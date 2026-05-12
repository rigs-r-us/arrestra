import { prisma } from '../../../src/lib/db';

export const dynamic = 'force-dynamic';

function formatDate(date: Date | null) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function PriorityBadge({ priority }: { priority: string | null }) {
  const p = priority?.toUpperCase() || 'LOW';

  const styles: Record<string, React.CSSProperties> = {
    HOT: {
      background: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca',
    },
    WARM: {
      background: '#ffedd5',
      color: '#9a3412',
      border: '1px solid #fdba74',
    },
    LOW: {
      background: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.3,
        ...(styles[p] || styles.LOW),
      }}
    >
      {p}
    </span>
  );
}

export default async function DashboardPage() {
  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  });

  const totalLeads = leads.length;
  const hotLeads = leads.filter((lead) => lead.priority === 'HOT').length;
  const warmLeads = leads.filter((lead) => lead.priority === 'WARM').length;

  return (
    <main style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Arrestra Lead Dashboard
        </h1>

        <p style={{ color: '#6b7280' }}>
          View ingested arrest and bail-form leads from TOPICs and future
          sources.
        </p>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <p style={labelStyle}>Total Leads</p>
          <h2 style={metricStyle}>{totalLeads}</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Hot Leads</p>
          <h2 style={metricStyle}>{hotLeads}</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Warm Leads</p>
          <h2 style={metricStyle}>{warmLeads}</h2>
        </div>
      </section>

      <section style={cardStyle}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
          Recent Leads
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 14,
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: 'left',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>County</th>
                <th style={thStyle}>Charge</th>
                <th style={thStyle}>Source</th>
                <th style={thStyle}>Created</th>
              </tr>
            </thead>

            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  style={{
                    borderBottom: '1px solid #f3f4f6',
                    background: lead.priority === 'HOT' ? '#fef2f2' : 'transparent',
                  }}
                >
                  <td style={tdStyle}>
                    <PriorityBadge priority={lead.priority} />
                  </td>

                  <td style={tdStyle}>
                    <strong>{lead.score ?? 0}</strong>
                  </td>

                  <td style={tdStyle}>
                    <strong>
                      {[lead.firstName, lead.lastName]
                        .filter(Boolean)
                        .join(' ') || 'Unknown'}
                    </strong>
                  </td>

                  <td style={tdStyle}>{lead.county || '—'}</td>

                  <td
                    style={{
                      ...tdStyle,
                      maxWidth: 420,
                    }}
                  >
                    {lead.charge || '—'}
                  </td>

                  <td style={tdStyle}>{lead.source}</td>

                  <td style={tdStyle}>
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={7}>
                    No leads found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

const labelStyle: React.CSSProperties = {
  color: '#6b7280',
  fontSize: 14,
  marginBottom: 8,
};

const metricStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
};

const thStyle: React.CSSProperties = {
  padding: '12px 8px',
  color: '#6b7280',
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: '14px 8px',
  verticalAlign: 'top',
};