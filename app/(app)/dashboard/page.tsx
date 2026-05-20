import { revalidatePath } from 'next/cache';
import { prisma } from '../../../src/lib/db';

export const dynamic = 'force-dynamic';

async function updateLeadStatus(formData: FormData) {
  'use server';

  const leadId = String(formData.get('leadId') || '');
  const status = String(formData.get('status') || 'NEW');

  if (!leadId) return;

  const existingLead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { status: true },
  });

  if (existingLead?.status === status) {
    revalidatePath('/dashboard');
    return;
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: status as any },
  });

  await prisma.leadEvent.create({
    data: {
      leadId,
      type: 'STATUS_CHANGED',
      metadata: {
        from: existingLead?.status ?? null,
        to: status,
      },
    },
  });

  revalidatePath('/dashboard');
}

function formatDate(date: Date | null) {
  if (!date) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

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
    <span style={{ ...badgeStyle, ...(styles[p] || styles.LOW) }}>
      {p}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  return (
    <span style={statusBadgeStyle}>
      {status || 'NEW'}
    </span>
  );
}

export default async function DashboardPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      events: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
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

        <p style={{ color: '#9CA3AF' }}>
          View ingested arrest and bail-form leads from TOPICs and future sources.
        </p>
      </div>

      <section style={metricGridStyle}>
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
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Priority</th>
                <th style={thStyle}>Score</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Action</th>
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
                    borderBottom: '1px solid #1a2641',
                    backgroundColor: lead.priority === 'HOT' ? 'rgba(229, 57, 53, 0.14)' : '#0F172A',
                    boxShadow:
                      lead.priority === 'HOT' ? 'inset 4px 0 0 #dc2626' : 'none',
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
                      {[lead.firstName, lead.lastName].filter(Boolean).join(' ') ||
                        'Unknown'}
                    </strong>
                  </td>

                  <td style={tdStyle}>
                    <StatusBadge status={lead.status} />
                  </td>

                  <td style={tdStyle}>
                    <details>
                      <summary style={viewButtonStyle}>View</summary>

                      <div style={drawerBackdropStyle}>
                        <div style={drawerStyle}>
                          <div style={drawerHeaderStyle}>
                            <div>
                              <p style={labelStyle}>Lead Details</p>
                              <h2 style={{ fontSize: 24, fontWeight: 800 }}>
                                {[lead.firstName, lead.lastName]
                                  .filter(Boolean)
                                  .join(' ') || 'Unknown'}
                              </h2>
                            </div>

                            <div style={drawerHeaderActionsStyle}>
                              <PriorityBadge priority={lead.priority} />
                              <StatusBadge status={lead.status} />
                              <button
                                onClick={() => {
                                  const details = document.querySelector('details[open]');
                                  if (details) (details as HTMLDetailsElement).open = false;
                                }}
                                style={closeIconButtonStyle}
                              >
                                ✕
                              </button>
                            </div>
                          </div>

                          <div style={drawerSectionStyle}>
                            <h3 style={drawerSectionTitleStyle}>Case Snapshot</h3>

                            <div style={detailGridStyle}>
                              <div>
                                <p style={detailLabelStyle}>Score</p>
                                <p style={detailValueStyle}>{lead.score ?? 0}</p>
                              </div>

                              <div>
                                <p style={detailLabelStyle}>County</p>
                                <p style={detailValueStyle}>{lead.county || '—'}</p>
                              </div>

                              <div>
                                <p style={detailLabelStyle}>Source</p>
                                <p style={detailValueStyle}>{lead.source}</p>
                              </div>

                              <div>
                                <p style={detailLabelStyle}>Status</p>
                                <p style={detailValueStyle}>{lead.status}</p>
                              </div>

                              <div>
                                <p style={detailLabelStyle}>Created</p>
                                <p style={detailValueStyle}>{formatDateTime(lead.createdAt)}</p>
                              </div>

                              <div>
                                <p style={detailLabelStyle}>Updated</p>
                                <p style={detailValueStyle}>{formatDateTime(lead.updatedAt)}</p>
                              </div>
                            </div>
                          </div>

                          <div style={drawerSectionStyle}>
                            <h3 style={drawerSectionTitleStyle}>Lead Workflow</h3>

                            <form action={updateLeadStatus} style={{ display: 'grid', gap: 12 }}>
                              <input type="hidden" name="leadId" value={lead.id} />

                              <select name="status" defaultValue={lead.status} style={inputStyle}>
                                <option value="NEW">NEW</option>
                                <option value="MAILED">MAILED</option>
                                <option value="QUALIFIED">QUALIFIED</option>
                                <option value="RETAINED">RETAINED</option>
                                <option value="CLOSED_WON">CLOSED_WON</option>
                                <option value="CLOSED_LOST">CLOSED_LOST</option>
                                <option value="DISMISSED">DISMISSED</option>
                              </select>

                              <button type="submit" style={buttonStyle}>
                                Save Status
                              </button>
                            </form>
                          </div>

                          <div style={drawerSectionStyle}>
                            <h3 style={drawerSectionTitleStyle}>Activity Timeline</h3>

                            {lead.events.length === 0 ? (
                              <p style={{ color: '#9CA3AF', fontSize: 14 }}>
                                No activity yet.
                              </p>
                            ) : (
                              <div style={{ display: 'grid', gap: 12 }}>
                                {lead.events.map((event) => (
                                  <div key={event.id} style={timelineItemStyle}>
                                    <p style={{ fontWeight: 700 }}>
                                      {event.type === 'STATUS_CHANGED'
                                        ? 'Status changed'
                                        : event.type}
                                    </p>

                                    <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>
                                      {formatDateTime(event.createdAt)}
                                    </p>

                                    {event.type === 'STATUS_CHANGED' && event.metadata && (
                                      <p style={{ marginTop: 4, fontSize: 14 }}>
                                        {(event.metadata as any)?.from || '—'} →{' '}
                                        {(event.metadata as any)?.to || '—'}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={drawerSectionStyle}>
                            <h3 style={drawerSectionTitleStyle}>Charge</h3>
                            <p style={{ lineHeight: 1.6 }}>{lead.charge || '—'}</p>
                          </div>

                          <div style={drawerSectionStyle}>
                            <h3 style={drawerSectionTitleStyle}>Compliance Guidance</h3>

                            <div style={complianceGridStyle}>
                              <div style={allowedCardStyle}>Direct Mail ✅</div>
                              <div style={blockedCardStyle}>Cold SMS ❌</div>
                              <div style={blockedCardStyle}>Cold Call ❌</div>
                              <div style={blockedCardStyle}>Cold Email ❌</div>
                            </div>

                            <p style={{ marginTop: 12, color: '#9CA3AF', fontSize: 13 }}>
                              Use this as product guidance only. Law firms should confirm local advertising and solicitation rules with counsel.
                            </p>
                          </div>

                          <div style={drawerSectionStyle}>
                            <h3 style={drawerSectionTitleStyle}>Recommended Next Action</h3>

                            <p style={{ lineHeight: 1.6 }}>
                              {lead.priority === 'HOT'
                                ? 'Prioritize this lead for immediate direct-mail outreach and attorney review.'
                                : lead.priority === 'WARM'
                                  ? 'Queue this lead for standard direct-mail outreach.'
                                  : 'Keep this lead in the database, but deprioritize active outreach.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </details>
                  </td>

                  <td style={tdStyle}>{lead.county || '—'}</td>

                  <td style={{ ...tdStyle, maxWidth: 420 }}>
                    {lead.charge || '—'}
                  </td>

                  <td style={tdStyle}>{lead.source}</td>

                  <td style={tdStyle}>{formatDate(lead.createdAt)}</td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={9}>
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

const metricGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: 16,
  marginBottom: 24,
};

const cardStyle: React.CSSProperties = {
  background: '#0F172A',
  border: '1px solid #1a2641',
  borderRadius: 16,
  padding: 20,
  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
};

const labelStyle: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: 14,
  marginBottom: 8,
};

const metricStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 14,
};

const tableHeaderRowStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #1a2641',
};

const thStyle: React.CSSProperties = {
  padding: '12px 8px',
  color: '#9CA3AF',
  fontWeight: 700,
};

const tdStyle: React.CSSProperties = {
  padding: '14px 8px',
  verticalAlign: 'top',
};

const badgeStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.3,
};

const statusBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  background: '#eef2ff',
  color: '#3730a3',
  border: '1px solid #c7d2fe',
};

const viewButtonStyle: React.CSSProperties = {
  cursor: 'pointer',
  color: '#ff7a7a',
  fontWeight: 700,
  listStyle: 'none',
};

const drawerBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(17, 24, 39, 0.35)',
  zIndex: 50,
};

const drawerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  right: 0,
  height: '100vh',
  width: 'min(520px, 100vw)',
  overflowY: 'auto',
  background: '#0F172A',
  borderLeft: '1px solid #e5e7eb',
  padding: 24,
  boxShadow: '-12px 0 32px rgba(0,0,0,0.12)',
};

const drawerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  alignItems: 'flex-start',
  borderBottom: '1px solid #1a2641',
  paddingBottom: 16,
  marginBottom: 20,
};

const drawerHeaderActionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
};

const closeButtonStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 999,
  padding: '6px 12px',
  color: '#374151',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
  background: '#0F172A',
};

const closeIconButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: '#9CA3AF',
  fontSize: 20,
  fontWeight: 700,
  cursor: 'pointer',
  padding: '4px 8px',
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  '&:hover': {
    background: '#1a2641',
    color: '#ffffff',
  },
};

const drawerSectionStyle: React.CSSProperties = {
  border: '1px solid #1a2641',
  borderRadius: 14,
  padding: 16,
  marginBottom: 16,
};

const drawerSectionTitleStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 800,
  marginBottom: 12,
};

const detailGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 12,
};

const detailLabelStyle: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: 12,
  marginBottom: 4,
};

const detailValueStyle: React.CSSProperties = {
  fontWeight: 700,
};

const timelineItemStyle: React.CSSProperties = {
  borderLeft: '3px solid #2563eb',
  paddingLeft: 12,
  paddingBottom: 4,
};

const complianceGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 8,
};

const allowedCardStyle: React.CSSProperties = {
  background: '#ecfdf5',
  color: '#065f46',
  border: '1px solid #a7f3d0',
  borderRadius: 10,
  padding: 10,
  fontWeight: 700,
};

const blockedCardStyle: React.CSSProperties = {
  background: '#fef2f2',
  color: '#991b1b',
  border: '1px solid #fecaca',
  borderRadius: 10,
  padding: 10,
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  border: '1px solid #1a2641',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  background: '#1a2641',
  color: '#ffffff',
};

const buttonStyle: React.CSSProperties = {
  border: '1px solid #111827',
  borderRadius: 10,
  padding: '10px 16px',
  background: '#111827',
  color: '#ffffff',
  fontWeight: 700,
  cursor: 'pointer',
};