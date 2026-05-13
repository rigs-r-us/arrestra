      <section style={cardStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            Recent Leads
          </h2>

          <a href="/api/leads/export" style={exportButtonStyle}>
            Export CSV
          </a>
        </div>
const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 16,
  marginBottom: 16,
};

const exportButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #111827',
  borderRadius: 10,
  padding: '10px 16px',
  background: '#111827',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: 14,
  textDecoration: 'none',
};
