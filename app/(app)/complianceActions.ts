'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/db';
import { createOutreachEvent } from '@/lib/compliance';
import { logLeadEvent, markLeadMailSent } from '@/lib/leadMutations';

function revalidateLeadPaths(leadId: string) {
  revalidatePath('/dashboard');
  revalidatePath('/mail-queue');
  revalidatePath('/campaigns');
  revalidatePath(`/leads/${leadId}`);
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

  revalidateLeadPaths(leadId);
}

/** MAIL_QUEUED -> MAILED. Marks the queued mail piece as sent today. */
export async function markMailSent(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const leadId = String(formData.get('leadId') || '');
  if (!leadId) return;

  await prisma.$transaction(async (tx) => {
    await markLeadMailSent(tx, user.tenantId, user.id, leadId);
  });

  revalidateLeadPaths(leadId);
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

  revalidateLeadPaths(leadId);
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

  revalidateLeadPaths(leadId);
}

/** Generic status change for the non-compliance-workflow statuses. */
export async function updateLeadStatus(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;

  const leadId = String(formData.get('leadId') || '');
  const status = String(formData.get('status') || 'NEW');
  if (!leadId) return;

  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId, tenantId: user.tenantId },
    select: { status: true },
  });
  if (!existingLead) return;

  if (existingLead.status === status) {
    revalidateLeadPaths(leadId);
    return;
  }

  await prisma.lead.update({
    where: { id: leadId, tenantId: user.tenantId },
    data: { status: status as any },
  });

  await logLeadEvent(leadId, user.id, 'STATUS_CHANGED', {
    from: existingLead.status ?? null,
    to: status,
  });

  revalidateLeadPaths(leadId);
}
