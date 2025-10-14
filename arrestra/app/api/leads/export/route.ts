import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key'); if (!apiKey) return new NextResponse('Missing x-api-key', { status: 401 });
  const tenant = await prisma.tenant.findUnique({ where: { apiKey } }); if (!tenant) return new NextResponse('Invalid API key', { status: 401 });
  const leads = await prisma.lead.findMany({ where: { tenantId: tenant.id }, orderBy: { createdAt: 'desc' }, take: 1000 });
  const headers = ['id','firstName','lastName','phone','email','county','caseNumber','charge','bondAmount','status','createdAt'];
  const rows = [headers.join(',')];
  for (const l of leads) {
    rows.push([l.id,l.firstName||'',l.lastName||'',l.phone||'',l.email||'',l.county||'',l.caseNumber||'',(l.charge||'').replace(/,/g,';'), String(l.bondAmount ?? ''), l.status, l.createdAt.toISOString()].join(','));
  }
  const csv = rows.join('\n');
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="leads.csv"' } });
}
