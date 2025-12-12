'use client';

import { useEffect, useState } from 'react';

type Lead = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  county: string | null;
  caseNumber: string | null;
  charge: string | null;
  status: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leads', { cache: 'no-store' });

        if (res.status === 401) {
          // Not logged in → kick back to login
          window.location.href = '/login';
          return;
        }

        if (!res.ok) {
          throw new Error(`Failed to load leads (status ${res.status})`);
        }

        const data = await res.json();
        setLeads(data.leads ?? []);
      } catch (err: any) {
        setError(err?.message ?? 'Error loading leads');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <p>Loading leads…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Recent Leads</p>

      {leads.length === 0 ? (
        <p style={{ marginTop: 16 }}>No leads yet. Once your TOPICs scraper runs or you hit the ingest API, they’ll show up here.</p>
      ) : (
        <table style={{ marginTop: 16, borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Name</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>County</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Case #</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Charge</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Status</th>
              <th style={{ borderBottom: '1px solid #ddd', textAlign: 'left', padding: 8 }}>Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  {(lead.firstName || lead.lastName)
                    ? `${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim()
                    : 'Unknown'}
                </td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{lead.county ?? '—'}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{lead.caseNumber ?? '—'}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{lead.charge ?? '—'}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>{lead.status}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 8 }}>
                  {lead.createdAt
                    ? new Date(lead.createdAt).toISOString().slice(0, 10)
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
