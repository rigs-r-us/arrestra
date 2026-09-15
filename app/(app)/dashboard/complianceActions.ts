'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createOutreachEvent } from '@/lib/compliance';

async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, tenantId: true },
  });
}

async function logLeadEvent(
  leadId: string,
  userId: string | null,
  type: string,
  metadata?: Prisma.InputJsonValue
) {
  await prisma.leadEvent.create({
    data: { leadId, userId: userId ?? undefined, type, metadata },
  });
}

/** NEW / REVIEWED -> MAIL_QUEUED. Queues the lead for direct-mail outreach. */
export async function queueForMail(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const leadId = String(formData.get('leadId') || '');
  if (!leadId) return;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId, tenantId: user.tenantId },
  });
  if (!lead) return;
  if (lead.status !== 'NEW' && lead.status !== 'REVIEWED') return;

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId, tenantId: user.tenantId },
      data: { status: 'MAIL_QUEUED' },
    });

    await createOutreachEvent(tx as typeof prisma, lead, {
      tenantId: user.tenantId,
      userId: user.id,
      channel: 'DIRECT_MAIL',
      status: 'QUEUED',
    });
  });

  await logLeadEvent(leadId, user.id, 'STATUS_CHANGED', {
    from: lead.status,
    to: 'MAIL_QUEUED',
  });

  revalidatePath('/dashboard');
}

/** MAIL_QUEUED -> MAILED. Marks the queued mail piece as sent today. */
export async function markMailSent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const leadId = String(formData.get('leadId') || '');
  if (!leadId) return;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId, tenantId: user.tenantId },
    include: {
      outreachEvents: {
        where: { channel: 'DIRECT_MAIL', status: 'QUEUED' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });
  if (!lead || lead.status !== 'MAIL_QUEUED') return;

  const now = new Date();
  const queuedEvent = lead.outreachEvents[0];

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId, tenantId: user.tenantId },
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
        tenantId: user.tenantId,
        userId: user.id,
        channel: 'DIRECT_MAIL',
        status: 'SENT',
        sentAt: now,
      });
    }
  });

  await logLeadEvent(leadId, user.id, 'STATUS_CHANGED', {
    from: 'MAIL_QUEUED',
    to: 'MAILED',
  });

  revalidatePath('/dashboard');
}

/**
 * Records that the lead contacted the firm first. This is the fact that
 * later unlocks grantContactPermission — it does not itself permit any
 * non-mail outreach.
 */
export async function recordClientResponse(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const leadId = String(formData.get('leadId') || '');
  const rawNotes = String(formData.get('notes') || '').trim();
  const notes = rawNotes ? rawNotes.slice(0, 2000) : null;
  if (!leadId) return;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId, tenantId: user.tenantId },
  });
  if (!lead) return;

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.lead.update({
      where: { id: leadId, tenantId: user.tenantId },
      data: {
        clientResponded: true,
        clientRespondedAt: now,
        status: 'CLIENT_RESPONDED',
      },
    });

    await createOutreachEvent(tx as typeof prisma, lead, {
      tenantId: user.tenantId,
      userId: user.id,
      channel: 'DIRECT_MAIL',
      status: 'RESPONDED',
      respondedAt: now,
      notes,
    });
  });

  await logLeadEvent(leadId, user.id, 'CLIENT_RESPONDED', notes ? { notes } : undefined);

  revalidatePath('/dashboard');
}

/**
 * The compliance unlock: only callable once clientResponded is true.
 * After this, EMAIL/PHONE/SMS outreach becomes possible for this lead
 * (see src/lib/compliance.ts) — nothing before this point does.
 */
export async function grantContactPermission(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const leadId = String(formData.get('leadId') || '');
  if (!leadId) return;

  const lead = await prisma.lead.findUnique({
    where: { id: leadId, tenantId: user.tenantId },
  });
  if (!lead) return;

  if (!lead.clientResponded) {
    // Mirrors the disabled state on the button in the UI, but this is the
    // check that actually matters — the button state is just a courtesy.
    throw new Error(
      'Cannot grant contact permission: this lead has not been recorded as having contacted the firm first.'
    );
  }

  await prisma.lead.update({
    where: { id: leadId, tenantId: user.tenantId },
    data: {
      contactPermitted: true,
      contactPermittedAt: new Date(),
      status: 'CONTACT_PERMITTED',
    },
  });

  await logLeadEvent(leadId, user.id, 'CONTACT_PERMITTED');

  revalidatePath('/dashboard');
}
