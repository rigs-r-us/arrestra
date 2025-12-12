import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/lib/db';

// Shape of the JSON payload we expect
type IngestPayload = {
  source?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  county?: string | null;
  caseNumber?: string | null;
  arrestDate?: string | null; // ISO date string from scraper
  charge?: string | null;
  bondAmount?: number | null;
  notes?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    // 1) Identify tenant by API key (header or body fallback)
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

    // 2) Basic validation for required/important fields
    if (!body.source) {
      body.source = 'topics.travis'; // default for now
    }

    // Parse arrestDate if provided
    let arrestDate: Date | null = null;
    if (body.arrestDate) {
      const d = new Date(body.arrestDate);
      if (!isNaN(d.getTime())) {
        arrestDate = d;
      }
    }

    // 3) Create the lead scoped to this tenant
    const lead = await prisma.lead.create({
      data: {
        tenantId: tenant.id,
        source: body.source ?? 'unknown',
        firstName: body.firstName ?? null,
        lastName: body.lastName ?? null,
        phone: body.phone ?? null,
        email: body.email ?? null,
        county: body.county ?? null,
        caseNumber: body.caseNumber ?? null,
        arrestDate,
        charge: body.charge ?? null,
        bondAmount: body.bondAmount ?? null,
        notes: body.notes ?? null,
        // status will default to NEW via Prisma schema
      },
    });

    // 4) Optionally, create a LeadEvent for audit trail (nice to have)
    await prisma.leadEvent.create({
      data: {
        leadId: lead.id,
        type: 'CREATED',
        metadata: {
          source: body.source ?? 'unknown',
        } as any,
      },
    }).catch(() => { /* non-fatal */ });

    return NextResponse.json(
      {
        ok: true,
        leadId: lead.id,
        tenantId: tenant.id,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error('Error in /api/leads/ingest', err);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(err?.message ?? err) },
      { status: 500 },
    );
  }
}
