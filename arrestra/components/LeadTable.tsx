import { Lead, Enrichment } from '@prisma/client';
type LeadWithEnrichment = Lead & { enrichments?: Enrichment[] };

function phoneBadge(data: any) { const phone = data?.phone; if (!phone) return null; const label = phone.valid ? 'Phone ✓' : 'Phone ✗'; const hint = phone.lineType ? ` (${phone.lineType})` : ''; return <span className="badge">{label}{hint}</span>; }
function emailBadge(data: any) { const email = data?.email; if (!email) return null; const label = email.result ? `Email: ${email.result}` : 'Email'; return <span className="badge">{label}</span>; }
function statusBadge(status: string) { return <span className="badge">{status}</span>; }

export function LeadTable({ leads }: { leads: LeadWithEnrichment[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Leads</h3>
        <span className="badge">{leads.length} total</span>
      </div>
      <table className="table">
        <thead><tr><th>Created</th><th>Name</th><th>Charge</th><th>County</th><th>Status</th><th>Source</th><th>Verification</th></tr></thead>
        <tbody>
          {leads.map(l => { const latest = l.enrichments && l.enrichments[0] ? l.enrichments[0] : undefined; const data: any = latest?.data ?? {};
            return (
              <tr key={l.id}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td>{[l.firstName, l.lastName].filter(Boolean).join(' ') || '—'}</td>
                <td>{l.charge || '—'}</td>
                <td>{l.county || '—'}</td>
                <td>{statusBadge(l.status)}</td>
                <td>{l.source}</td>
                <td className="flex gap-2">{phoneBadge(data)}{emailBadge(data)}</td>
              </tr>
            ); })}
        </tbody>
      </table>
    </div>
  );
}
