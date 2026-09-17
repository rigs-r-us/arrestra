import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { markMailSentBulk } from './actions';

export const dynamic = 'force-dynamic';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default async function MailQueuePage() {
  const user = await requireUser();

  const leads = await prisma.lead.findMany({
    where: { tenantId: user.tenantId, status: 'MAIL_QUEUED' },
    orderBy: { createdAt: 'asc' },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Mail Queue</h1>
        <p className="text-muted-foreground">
          Leads queued for direct-mail outreach. Select the ones you've physically mailed and
          mark them sent.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Queued ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={markMailSentBulk} className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Priority</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead>Queued</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <input type="checkbox" name="leadId" value={lead.id} className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                      <Badge className="border-slate-200 bg-slate-100 text-slate-700">
                        {lead.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {[lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unknown'}
                    </TableCell>
                    <TableCell>{lead.county || '—'}</TableCell>
                    <TableCell className="max-w-[320px] truncate">{lead.charge || '—'}</TableCell>
                    <TableCell>{formatDate(lead.updatedAt)}</TableCell>
                    <TableCell>
                      <Link href={`/leads/${lead.id}`} className="text-red-600 hover:underline">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}

                {leads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">
                      Nothing in the mail queue right now.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {leads.length > 0 && (
              <Button type="submit" className="w-fit">
                Mark Selected as Sent
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
