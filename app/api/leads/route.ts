import React, { useState, useEffect } from 'react';

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: 24,
  background:
    'radial-gradient(1200px 420px at 50% -120px, rgba(229,57,53,.18), transparent 60%), #0A0F1D',
  color: '#E5E7EB',
};

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
  boxShadow: '0 18px 45px rgba(0,0,0,0.18)',
};

const labelStyle: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: 14,
  marginBottom: 8,
};

const mutedTextStyle: React.CSSProperties = {
  color: '#9CA3AF',
};

const thStyle: React.CSSProperties = {
  padding: '12px 8px',
  color: '#9CA3AF',
  fontWeight: 700,
};

const tableHeaderRowStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #1a2641',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 8px',
  verticalAlign: 'top',
  borderBottom: '1px solid #111827',
};

const statusBadgeStyle: React.CSSProperties = {
  ...badgeStyle,
  background: '#0b1428',
  color: '#E5E7EB',
  border: '1px solid #263152',
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
  background: 'rgba(2, 6, 23, 0.72)',
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
  borderLeft: '1px solid #1a2641',
  padding: 24,
  boxShadow: '-12px 0 32px rgba(0,0,0,0.35)',
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

const closeButtonStyle: React.CSSProperties = {
  border: '1px solid #29334f',
  borderRadius: 999,
  padding: '6px 12px',
  color: '#E5E7EB',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
  background: '#0b1428',
};

const drawerSectionStyle: React.CSSProperties = {
  border: '1px solid #1a2641',
  borderRadius: 14,
  padding: 16,
  marginBottom: 16,
  background: '#0b1428',
};

const detailLabelStyle: React.CSSProperties = {
  color: '#9CA3AF',
  fontSize: 12,
  marginBottom: 4,
};

const timelineItemStyle: React.CSSProperties = {
  borderLeft: '3px solid #E53935',
  paddingLeft: 12,
  paddingBottom: 4,
};

const inputStyle: React.CSSProperties = {
  border: '1px solid #263152',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  background: '#0b1428',
  color: '#E5E7EB',
};

const buttonStyle: React.CSSProperties = {
  border: '1px solid #E53935',
  borderRadius: 10,
  padding: '10px 16px',
  background: 'linear-gradient(135deg, #E53935, #ff7a7a)',
  color: '#0A0F1D',
  fontWeight: 800,
  cursor: 'pointer',
};

const exportButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #E53935',
  borderRadius: 12,
  padding: '12px 18px',
  background: 'linear-gradient(135deg, #E53935, #ff7a7a)',
  color: '#0A0F1D',
  fontWeight: 800,
  fontSize: 14,
  textDecoration: 'none',
};

const secondaryExportButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #29334f',
  borderRadius: 12,
  padding: '12px 18px',
  background: '#0b1428',
  color: '#E5E7EB',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
};

export default function DashboardPage() {
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    // fetch leads or other data here
  }, []);

  return (
    <main style={pageStyle}>
      <h1>Dashboard</h1>
      <p style={mutedTextStyle}>
        View ingested arrest and bail-form leads from TOPICs and future sources.
      </p>

      <div style={metricGridStyle}>
        {leads.map((lead) => (
          <div
            key={lead.id}
            style={{
              ...cardStyle,
              backgroundColor: lead.priority === 'HOT' ? 'rgba(229, 57, 53, 0.14)' : 'transparent',
              boxShadow:
                lead.priority === 'HOT' ? 'inset 4px 0 0 #E53935' : 'none',
            }}
          >
            <h2>{lead.title}</h2>
            <p style={{ color: '#9CA3AF', fontSize: 14 }}>
              {lead.description}
            </p>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginTop: 2 }}>
              Additional info here
            </p>
            <p style={{ marginTop: 12, color: '#9CA3AF', fontSize: 13 }}>
              More details
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
