import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key'); if (!apiKey) return NextResponse.json({ error: 'Missing x-api-key' }, { status: 401 });
    const tenant = await prisma.tenant.findUnique({ where: { apiKey } }); if (!tenant) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    const body = await req.json();
    const lead = await prisma.lead.create({ data: {
      tenantId: tenant.id, source: body.source || 'unknown', firstName: body.firstName, lastName: body.lastName,
      phone: body.phone, email: body.email, county: body.county, caseNumber: body.caseNumber,
      arrestDate: body.arrestDate ? new Date(body.arrestDate) : undefined, charge: body.charge, bondAmount: body.bondAmount ?? undefined, notes: body.notes
    }});
    await prisma.leadEvent.create({ data: { leadId: lead.id, type: 'INGESTED', metadata: body } });
    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (e:any) { console.error(e); return NextResponse.json({ error: 'Server error', detail: String(e?.message || e) }, { status: 500 }); }
}
