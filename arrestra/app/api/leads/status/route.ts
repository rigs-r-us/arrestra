import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { LeadStatus } from '@prisma/client';
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key'); if (!apiKey) return NextResponse.json({ error: 'Missing x-api-key' }, { status: 401 });
  const tenant = await prisma.tenant.findUnique({ where: { apiKey } }); if (!tenant) return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  const { leadId, status } = await req.json();
  if (!Object.keys(LeadStatus).includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  const lead = await prisma.lead.update({ where: { id: leadId }, data: { status } });
  await prisma.leadEvent.create({ data: { leadId, type: 'STATUS_CHANGE', metadata: { status } } });
  return NextResponse.json({ ok: true, lead });
}
