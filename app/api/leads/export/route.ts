import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '../../../../src/lib/db';

function csvEscape(value: unknown) {
  const str = String(value ?? '');
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { tenantId: true },
  });

  if (!dbUser?.tenantId) {
    return NextResponse.json({ error: 'User has no tenant associated' }, { status: 403 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const priority = url.searchParams.get('priority');
  const selectedLeadIds = url.searchParams.getAll('leadId').filter(Boolean);

  const leads = await prisma.lead.findMany({
    where: {
      tenantId: dbUser.tenantId,
      ...(selectedLeadIds.length > 0 ? { id: { in: selectedLeadIds } } : {}),
      ...(status ? { status: status as any } : {}),
      ...(priority ? { priority } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  const headers = ['First Name', 'Last Name', 'County', 'Charge', 'Priority', 'Score', 'Status', 'Source', 'Created At'];

  const rows = leads.map((lead) => [
    lead.firstName,
    lead.lastName,
    lead.county,
    lead.charge,
    lead.priority,
    lead.score,
    lead.status,
    lead.source,
    lead.createdAt.toISOString(),
  ]);

  const csv = [
    headers.map(csvEscape).join(','),
    ...rows.map((row) => row.map(csvEscape).join(',')),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="arrestra-direct-mail-export.csv"',
    },
  });
}
