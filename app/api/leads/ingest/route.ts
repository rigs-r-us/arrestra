import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';

type IngestPayload = {
  source?: string;
  sourceId?: string | null;
  sourceUrl?: string | null;
  rawData?: unknown;

  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;

  county?: string | null;
  caseNumber?: string | null;
  arrestDate?: string | null;
  bookingDate?: string | null;
  charge?: string | null;
  chargeSeverity?: string | null;
  bondAmount?: number | null;
  bondType?: string | null;
  custodyStatus?: string | null;

  notes?: string | null;
};

function normalizeText(value?: string | null) {
  return value?.trim() || null;
}

function parseDate(value?: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildFullName(payload: IngestPayload) {
  const fullName = normalizeText(payload.fullName);

  if (fullName) {
    return fullName;
  }

  const firstName = normalizeText(payload.firstName);
  const lastName = normalizeText(payload.lastName);

  return [firstName, lastName].filter(Boolean).join(' ') || null;
}

function buildFingerprint(payload: IngestPayload) {
  const source = normalizeText(payload.source) ?? 'unknown';
  const sourceId = normalizeText(payload.sourceId);

  if (sourceId) {
    return sourceId.toLowerCase();
  }

  const fullName = buildFullName(payload);

  const parts = [
    source,
    normalizeText(payload.caseNumber),
    fullName,
    normalizeText(payload.county),
    normalizeText(payload.charge),
    normalizeText(payload.bookingDate) ?? normalizeText(payload.arrestDate),
  ];

  return crypto
    .createHash('sha256')
    .update(parts.map((part) => part?.toLowerCase() ?? '').join('|'))
    .digest('hex');
}

function scoreLead(payload: IngestPayload) {
  let score = 0;

  const charge = `${payload.charge ?? ''} ${payload.chargeSeverity ?? ''}`.toLowerCase();
  const bondAmount = payload.bondAmount ?? 0;
  const bookingDate = parseDate(payload.bookingDate) ?? parseDate(payload.arrestDate);

  if (charge.includes('felony')) score += 25;
  if (charge.includes('assault')) score += 15;
  if (charge.includes('family violence')) score += 15;
  if (charge.includes('driving while intoxicated')) score += 15;
  if (charge.includes('dwi')) score += 15;
  if (charge.includes('dui')) score += 15;
  if (charge.includes('burglary')) score += 15;
  if (charge.includes('firearm')) score += 15;
  if (charge.includes('controlled substance') || charge.includes('poss cs')) score += 10;

  if (bondAmount >= 10000) score += 25;
  else if (bondAmount >= 5000) score += 15;
  else if (bondAmount > 0) score += 5;

  if (bookingDate) {
    const ageHours = (Date.now() - bookingDate.getTime()) / (1000 * 60 * 60);

    if (ageHours <= 12) score += 15;
    else if (ageHours <= 24) score += 10;
    else if (ageHours <= 72) score += 5;
  }

  if (score >= 60) return { score, priority: 'HOT' as const };
  if (score >= 30) return { score, priority: 'WARM' as const };

  return { score, priority: 'LOW' as const };
}

export async function POST(req: NextRequest) {
  try {
    const headerApiKey = req.headers.get('x-api-key') || req.headers.get('X-API-Key');
    const body: IngestPayload & { apiKey?: string } = await req.json().catch(() => ({} as any));
    const apiKey = headerApiKey || body.apiKey;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { apiKey },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 403 });
    }

    const source = normalizeText(body.source) ?? 'topics.travis';
    const fullName = buildFullName(body);
    const fingerprint = buildFingerprint({ ...body, source, fullName });
    const arrestDate = parseDate(body.arrestDate);
    const bookingDate = parseDate(body.bookingDate);
    const { score, priority } = scoreLead(body);

    const lead = await prisma.lead.upsert({
      where: {
        tenantId_source_fingerprint: {
          tenantId: tenant.id,
          source,
          fingerprint,
        },
      },
      update: {
        sourceId: normalizeText(body.sourceId),
        sourceUrl: normalizeText(body.sourceUrl),
        rawData: body.rawData === undefined ? undefined : (body.rawData as any),

        firstName: normalizeText(body.firstName),
        lastName: normalizeText(body.lastName),
        fullName,
        phone: normalizeText(body.phone),
        email: normalizeText(body.email),

        county: normalizeText(body.county),
        caseNumber: normalizeText(body.caseNumber),
        arrestDate,
        bookingDate,
        charge: normalizeText(body.charge),
        chargeSeverity: normalizeText(body.chargeSeverity),
        bondAmount: body.bondAmount ?? null,
        bondType: normalizeText(body.bondType),
        custodyStatus: normalizeText(body.custodyStatus),

        notes: normalizeText(body.notes),
        score,
        priority,
        lastScoredAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        source,
        sourceId: normalizeText(body.sourceId),
        sourceUrl: normalizeText(body.sourceUrl),
        rawData: body.rawData === undefined ? undefined : (body.rawData as any),
        fingerprint,

        firstName: normalizeText(body.firstName),
        lastName: normalizeText(body.lastName),
        fullName,
        phone: normalizeText(body.phone),
        email: normalizeText(body.email),

        county: normalizeText(body.county),
        caseNumber: normalizeText(body.caseNumber),
        arrestDate,
        bookingDate,
        charge: normalizeText(body.charge),
        chargeSeverity: normalizeText(body.chargeSeverity),
        bondAmount: body.bondAmount ?? null,
        bondType: normalizeText(body.bondType),
        custodyStatus: normalizeText(body.custodyStatus),

        notes: normalizeText(body.notes),
        score,
        priority,
        lastScoredAt: new Date(),
      },
    });

    await prisma.leadEvent
      .create({
        data: {
          leadId: lead.id,
          type: 'INGESTED',
          metadata: {
            source,
            fingerprint,
            priority,
            score,
          } as any,
        },
      })
      .catch(() => undefined);

    return NextResponse.json(
      {
        ok: true,
        leadId: lead.id,
        tenantId: tenant.id,
        score,
        priority,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error('Error in /api/leads/ingest', err);

    return NextResponse.json(
      {
        error: 'Internal server error',
        detail: String(err?.message ?? err),
      },
      { status: 500 },
    );
  }
}