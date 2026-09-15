import type { OutreachChannel, OutreachStatus, PrismaClient } from "@prisma/client";

/**
 * The single enforcement point for Arrestra's compliance rule: a firm may
 * not initiate EMAIL, PHONE, or SMS contact with a lead unless that lead
 * has already contacted the firm first (contactPermitted = true).
 *
 * DIRECT_MAIL and INTERNAL_NOTE are always allowed — direct mail is the
 * default, always-compliant outreach channel this product is built around,
 * and internal notes never reach the lead at all.
 *
 * Every code path that creates an OutreachEvent for EMAIL/PHONE/SMS MUST
 * call this first. Throwing (rather than silently downgrading the channel
 * or no-oping) is intentional: a caller that ignores the thrown error is a
 * bug to be caught in review, not a request to guess at what they meant.
 */
export class OutreachNotPermittedError extends Error {
  constructor(channel: OutreachChannel) {
    super(
      `${channel} outreach is not permitted for this lead. ` +
        `The lead must have contacted the firm first (contactPermitted = true) ` +
        `before ${channel} can be used — see the Contact Permitted step in the ` +
        `lead's compliance workflow.`
    );
    this.name = "OutreachNotPermittedError";
  }
}

const CHANNELS_REQUIRING_PERMISSION: readonly OutreachChannel[] = [
  "EMAIL",
  "PHONE",
  "SMS",
];

export function assertChannelAllowed(
  channel: OutreachChannel,
  lead: { contactPermitted: boolean }
): void {
  if (!CHANNELS_REQUIRING_PERMISSION.includes(channel)) {
    return; // DIRECT_MAIL, INTERNAL_NOTE always allowed
  }

  if (!lead.contactPermitted) {
    throw new OutreachNotPermittedError(channel);
  }
}

/**
 * The only sanctioned way to create an OutreachEvent. Runs the compliance
 * check before writing anything, so a future feature (e.g. an attorney
 * logging a phone call) gets the gate for free just by calling this
 * instead of prisma.outreachEvent.create directly.
 */
export async function createOutreachEvent(
  prisma: PrismaClient,
  lead: { id: string; contactPermitted: boolean },
  data: {
    tenantId: string;
    userId?: string | null;
    channel: OutreachChannel;
    status?: OutreachStatus;
    notes?: string | null;
    sentAt?: Date | null;
    respondedAt?: Date | null;
  }
) {
  assertChannelAllowed(data.channel, lead);

  return prisma.outreachEvent.create({
    data: {
      tenantId: data.tenantId,
      leadId: lead.id,
      userId: data.userId ?? undefined,
      channel: data.channel,
      status: data.status ?? "NOT_STARTED",
      notes: data.notes ?? undefined,
      sentAt: data.sentAt ?? undefined,
      respondedAt: data.respondedAt ?? undefined,
    },
  });
}
