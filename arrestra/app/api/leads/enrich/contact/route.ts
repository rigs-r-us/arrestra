import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { runContactVerification } from '@/src/providers/contactVerification';
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key'); if (!apiKey) return NextResponse.json({ error: 'Missing x-api-key' }, { status: 401 });
  const tenant = await prisma.tenant.findUnique({ where: { apiKey } }); if (!tenant) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  const { leadId } = await req.json();
  const lead = await prisma.lead.findFirst({ where: { id: leadId, tenantId: tenant.id } }); if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  const result = await runContactVerification({ tenantId: tenant.id, leadId: lead.id, email: lead.email ?? undefined, phone: lead.phone ?? undefined });
  return NextResponse.json({ ok: true, ...result });
}
