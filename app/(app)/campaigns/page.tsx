import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

const MAILED_STATUSES = ['MAILED', 'CLIENT_RESPONDED', 'CONTACT_PERMITTED'] as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: { source?: string };
}) {
  const user = await requireUser();
  const selectedSource = searchParams.source;

  const [totals, byPriority, mailed] = await Promise.all([
    prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId: user.tenantId },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ['source', 'priority'],
      where: { tenantId: user.tenantId },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ['source'],
      where: { tenantId: user.tenantId, status: { in: [...MAILED_STATUSES] } },
      _count: { _all: true },
    }),
  ]);

  const priorityBySource = new Map<string, Record<string, number>>();
  for (const row of byPriority) {
    const existing = priorityBySource.get(row.source) ?? {};
    existing[row.priority] = row._count._all;
    priorityBySource.set(row.source, existing);
  }
  const mailedBySource = new Map(mailed.map((row) => [row.source, row._count._all]));

  const leads = await prisma.lead.findMany({
    where: {
      tenantId: user.tenantId,
      ...(selectedSource ? { source: selectedSource } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Campaigns</h1>
        <p className="text-muted-foreground">
          Leads grouped by source. Select a card to filter the list below.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {totals.map((row) => {
          const priorities = priorityBySource.get(row.source) ?? {};
          const isSelected = selectedSource === row.source;

          return (
            <Link key={row.source} href={isSelected ? '/campaigns' : `/campaigns?source=${encodeURIComponent(row.source)}`}>
              <Card
                className={
                  isSelected ? 'border-red-400 ring-1 ring-red-200' : 'hover:border-muted-foreground/40'
                }
              >
                <CardHeader>
                  <CardTitle className="text-base">{row.source}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-3xl font-extrabold">{row._count._all}</p>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <Badge className="border-red-200 bg-red-50 text-red-700">
                      {priorities.HOT ?? 0} HOT
                    </Badge>
                    <Badge className="border-orange-200 bg-orange-50 text-orange-700">
                      {priorities.WARM ?? 0} WARM
                    </Badge>
                    <Badge className="border-slate-200 bg-slate-100 text-slate-700">
                      {priorities.LOW ?? 0} LOW
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mailedBySource.get(row.source) ?? 0} mailed
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {totals.length === 0 && (
          <p className="text-sm text-muted-foreground">No leads yet.</p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedSource ? `Leads from ${selectedSource}` : 'All Leads'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Priority</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.priority}</TableCell>
                  <TableCell>
                    {[lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unknown'}
                  </TableCell>
                  <TableCell>{lead.status}</TableCell>
                  <TableCell>{lead.county || '—'}</TableCell>
                  <TableCell>{formatDate(lead.createdAt)}</TableCell>
                  <TableCell>
                    <Link href={`/leads/${lead.id}`} className="text-red-600 hover:underline">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}

              {leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
