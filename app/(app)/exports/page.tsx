import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';

const STATUSES = [
  'NEW',
  'REVIEWED',
  'MAIL_QUEUED',
  'MAILED',
  'CLIENT_RESPONDED',
  'CONTACT_PERMITTED',
  'QUALIFIED',
  'RETAINED',
  'CLOSED_WON',
  'CLOSED_LOST',
  'DISMISSED',
];

const PRIORITIES = ['HOT', 'WARM', 'LOW'];

export default async function ExportsPage() {
  const user = await requireUser();

  const totalLeads = await prisma.lead.count({ where: { tenantId: user.tenantId } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Exports</h1>
        <p className="text-slate-400">
          Download a CSV of your leads for direct-mail merges. {totalLeads} leads total.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtered Export</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/leads/export" method="get" className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-slate-400">Status</label>
              <select
                name="status"
                defaultValue=""
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">Any status</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-400">Priority</label>
              <select
                name="priority"
                defaultValue=""
                className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              >
                <option value="">Any priority</option>
                {PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <Button type="submit">Download CSV</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
