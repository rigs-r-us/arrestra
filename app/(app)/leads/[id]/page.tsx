import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/lib/db';
import { requireUser } from '@/lib/session';
import {
  queueForMail,
  markMailSent,
  recordClientResponse,
  grantContactPermission,
  updateLeadStatus,
} from '../../complianceActions';

function formatDateTime(date: Date | null) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const p = priority?.toUpperCase() || 'LOW';
  const classes: Record<string, string> = {
    HOT: 'bg-red-500/15 text-red-300 border-red-500/40',
    WARM: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
    LOW: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
  };
  return <Badge className={classes[p] || classes.LOW}>{p}</Badge>;
}

function StatusBadge({ status }: { status: string | null }) {
  return (
    <Badge className="border-indigo-500/40 bg-indigo-500/15 text-indigo-300">
      {status || 'NEW'}
    </Badge>
  );
}

const STATUS_LABELS: Record<string, string> = {
  STATUS_CHANGED: 'Status changed',
  CLIENT_RESPONDED: 'Client responded',
  CONTACT_PERMITTED: 'Contact permission granted',
};

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();

  const lead = await prisma.lead.findUnique({
    where: { id: params.id, tenantId: user.tenantId },
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!lead) {
    notFound();
  }

  const name = [lead.firstName, lead.lastName].filter(Boolean).join(' ') || 'Unknown';
  const canQueue = lead.status === 'NEW' || lead.status === 'REVIEWED';
  const canMarkSent = lead.status === 'MAIL_QUEUED';

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-400 hover:text-slate-200">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">Lead Details</p>
          <h1 className="text-2xl font-extrabold">{name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={lead.priority} />
          <StatusBadge status={lead.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-400">Score</p>
            <p className="font-semibold">{lead.score ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">County</p>
            <p className="font-semibold">{lead.county || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Source</p>
            <p className="font-semibold">{lead.source}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Status</p>
            <p className="font-semibold">{lead.status}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Created</p>
            <p className="font-semibold">{formatDateTime(lead.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Updated</p>
            <p className="font-semibold">{formatDateTime(lead.updatedAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Client Responded</p>
            <p className="font-semibold">
              {lead.clientResponded ? formatDateTime(lead.clientRespondedAt) : 'Not yet'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Contact Permitted</p>
            <p className="font-semibold">
              {lead.contactPermitted ? formatDateTime(lead.contactPermittedAt) : 'Not yet'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateLeadStatus} className="grid gap-3">
            <input type="hidden" name="leadId" value={lead.id} />
            <select
              name="status"
              defaultValue={lead.status}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            >
              <option value="NEW">NEW</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="RETAINED">RETAINED</option>
              <option value="CLOSED_WON">CLOSED_WON</option>
              <option value="CLOSED_LOST">CLOSED_LOST</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>
            <Button type="submit" className="w-fit">
              Save Status
            </Button>
            <p className="text-xs text-slate-400">
              Mail queue, client response, and contact-permitted stages are managed in the
              Compliance Workflow panel below.
            </p>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Workflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-400">
            Each step below only unlocks once the previous one is complete. Contact permission
            cannot be granted until the lead is recorded as having responded to the firm first.
          </p>

          <form action={queueForMail}>
            <input type="hidden" name="leadId" value={lead.id} />
            <Button type="submit" disabled={!canQueue} variant={canQueue ? 'default' : 'secondary'}>
              Queue for Mail
            </Button>
          </form>

          <form action={markMailSent}>
            <input type="hidden" name="leadId" value={lead.id} />
            <Button
              type="submit"
              disabled={!canMarkSent}
              variant={canMarkSent ? 'default' : 'secondary'}
            >
              Mark Mail Sent
            </Button>
          </form>

          <form action={recordClientResponse} className="grid gap-2">
            <input type="hidden" name="leadId" value={lead.id} />
            <textarea
              name="notes"
              placeholder="Optional note on how the client responded"
              rows={2}
              disabled={lead.clientResponded}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={lead.clientResponded}
              variant={lead.clientResponded ? 'secondary' : 'default'}
              className="w-fit"
            >
              {lead.clientResponded ? 'Client Responded ✓' : 'Record Client Response'}
            </Button>
          </form>

          <form action={grantContactPermission}>
            <input type="hidden" name="leadId" value={lead.id} />
            <Button
              type="submit"
              disabled={!lead.clientResponded || lead.contactPermitted}
              variant={!lead.clientResponded || lead.contactPermitted ? 'secondary' : 'default'}
            >
              {lead.contactPermitted ? 'Contact Permitted ✓' : 'Grant Contact Permission'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {lead.events.length === 0 ? (
            <p className="text-sm text-slate-400">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {lead.events.map((event) => (
                <div key={event.id} className="border-l-2 border-indigo-600 pl-3">
                  <p className="font-semibold">{STATUS_LABELS[event.type] ?? event.type}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(event.createdAt)}</p>
                  {event.type === 'STATUS_CHANGED' && event.metadata && (
                    <p className="mt-1 text-sm">
                      {(event.metadata as any)?.from || '—'} →{' '}
                      {(event.metadata as any)?.to || '—'}
                    </p>
                  )}
                  {event.type === 'CLIENT_RESPONDED' && (event.metadata as any)?.notes && (
                    <p className="mt-1 text-sm">{(event.metadata as any).notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Charge</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{lead.charge || '—'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2 font-semibold text-emerald-300">
              Direct Mail ✅
            </div>
            {(['SMS', 'Phone', 'Email'] as const).map((channel) => (
              <div
                key={channel}
                className={
                  lead.contactPermitted
                    ? 'rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2 font-semibold text-emerald-300'
                    : 'rounded-md border border-red-500/40 bg-red-500/10 p-2 font-semibold text-red-300'
                }
              >
                {channel} {lead.contactPermitted ? '✅' : '❌'}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {lead.contactPermitted
              ? `Contact permitted since ${formatDateTime(lead.contactPermittedAt)} — this lead contacted the firm first.`
              : 'SMS, phone, and email unlock automatically once Contact Permission is granted above. Use this as product guidance only — confirm local advertising and solicitation rules with counsel.'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Action</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">
            {lead.priority === 'HOT'
              ? 'Prioritize this lead for immediate direct-mail outreach and attorney review.'
              : lead.priority === 'WARM'
                ? 'Queue this lead for standard direct-mail outreach.'
                : 'Keep this lead in the database, but deprioritize active outreach.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
