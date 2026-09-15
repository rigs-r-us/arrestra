import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './db';
import { createOutreachEvent } from './compliance';

/**
 * Shared, non-Server-Action mutation logic used by both the single-lead
 * compliance actions (app/(app)/complianceActions.ts) and the bulk actions
 * on /mail-queue. Kept out of any 'use server' file since Next.js treats
 * every export of such a file as a client-callable action, which requires
 * serializable arguments — these take a live transaction client, which
 * isn't serializable and isn't meant to be called from the client anyway.
 */

export async function logLeadEvent(
  leadId: string,
  userId: string | null,
  type: string,
  metadata?: Prisma.InputJsonValue
) {
  await prisma.leadEvent.create({
    data: { leadId, userId: userId ?? undefined, type, metadata },
  });
}

/**
 * Core MAIL_QUEUED -> MAILED transition. Silently no-ops (returns false) on
 * a lead that isn't actually in MAIL_QUEUED or doesn't belong to this
 * tenant, so callers looping over a batch can skip stale/invalid rows
 * without aborting the rest of the batch.
 */
export async function markLeadMailSent(
  tx: Pick<PrismaClient, 'lead' | 'outreachEvent'>,
  tenantId: string,
  userId: string,
  leadId: string
): Promise<boolean> {
  const lead = await tx.lead.findUnique({
    where: { id: leadId, tenantId },
    include: {
      outreachEvents: {
        where: { channel: 'DIRECT_MAIL', status: 'QUEUED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  if (!lead || lead.status !== 'MAIL_QUEUED') return false;

  const now = new Date();
  const queuedEvent = lead.outreachEvents[0];

  await tx.lead.update({
    where: { id: leadId, tenantId },
    data: { status: 'MAILED' },
  });

  if (queuedEvent) {
    await tx.outreachEvent.update({
      where: { id: queuedEvent.id },
      data: { status: 'SENT', sentAt: now },
    });
  } else {
    // Shouldn't normally happen (queueForMail always creates one), but
    // don't block marking mail sent over a missing prior event record.
    await createOutreachEvent(tx as typeof prisma, lead, {
      tenantId,
      userId,
      channel: 'DIRECT_MAIL',
      status: 'SENT',
      sentAt: now,
    });
  }

  await logLeadEvent(leadId, userId, 'STATUS_CHANGED', {
    from: 'MAIL_QUEUED',
    to: 'MAILED',
  });

  return true;
}
