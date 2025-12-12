export default function Home() {
  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Arrestra App ✅</h1>
      <p style={{ marginBottom: 24 }}>
        Your Arrestra application is deployed. Log in to access your dashboard.
      </p>
      <a
        href="/login"
        style={{
          display: 'inline-block',
          padding: '10px 18px',
          borderRadius: 8,
          border: '1px solid #222',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Go to Login
      </a>
    </main>
  );
}
