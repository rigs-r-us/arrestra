import { prisma } from '@/src/lib/db';
type VerifyInput = { tenantId: string; leadId: string; email?: string | null; phone?: string | null; };
type PhoneResult = { valid?: boolean; lineType?: 'mobile' | 'landline' | 'voip' | 'unknown'; carrier?: string | null; countryCode?: string | null; nationalFormat?: string | null; };
type EmailResult = { result?: 'deliverable' | 'undeliverable' | 'risky' | 'unknown'; reason?: string | null; didYouMean?: string | null; };
export async function runContactVerification({ tenantId, leadId, email, phone }: VerifyInput) {
  const outcome: { phone?: PhoneResult; email?: EmailResult; scoreDelta: number } = { scoreDelta: 0 };
  if (phone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const url = new URL(`https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(phone)}`);
      url.searchParams.set('fields', 'carrier,caller_name');
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const res = await fetch(url.toString(), { headers: { Authorization: `Basic ${auth}` }, cache: 'no-store' });
      if (res.ok) {
        const data = await res.json(); const lt = (data?.carrier?.type ?? 'unknown') as PhoneResult['lineType'];
        const lineType: PhoneResult['lineType'] = (['mobile','landline','voip'] as const).includes(lt as any) ? lt : 'unknown';
        const valid = Boolean(data?.phone_number);
        outcome.phone = { valid, lineType, carrier: data?.carrier?.name ?? null, countryCode: data?.country_code ?? null, nationalFormat: data?.national_format ?? null };
        if (valid) outcome.scoreDelta += 10; if (lineType === 'mobile') outcome.scoreDelta += 5; if (lineType === 'voip') outcome.scoreDelta -= 2;
      }
    } catch {}
  }
  if (email && process.env.KICKBOX_API_KEY) {
    try {
      const url = new URL('https://api.kickbox.com/v2/verify'); url.searchParams.set('email', email); url.searchParams.set('apikey', process.env.KICKBOX_API_KEY);
      const res = await fetch(url.toString(), { cache: 'no-store' }); if (res.ok) { const data = await res.json(); const result = (data?.result ?? 'unknown') as EmailResult['result'];
        outcome.email = { result, reason: data?.reason ?? null, didYouMean: data?.did_you_mean ?? null };
        if (result === 'deliverable') outcome.scoreDelta += 10; if (result === 'risky') outcome.scoreDelta += 2; if (result === 'undeliverable') outcome.scoreDelta -= 8;
      }
    } catch {}
  }
  const enrichment = await prisma.$transaction(async (tx) => {
    const enr = await tx.enrichment.create({ data: { leadId, provider: 'contact-verification', score: outcome.scoreDelta, data: outcome } });
    await tx.leadEvent.create({ data: { leadId, type: 'ENRICHED_CONTACT', metadata: outcome as any } });
    return enr;
  });
  return { enrichmentId: enrichment.id, ...outcome };
}
