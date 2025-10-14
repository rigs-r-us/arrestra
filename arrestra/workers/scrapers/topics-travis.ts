const API_BASE = process.env.ARRESTRA_API || 'http://localhost:3000';
const API_KEY = process.env.ARRESTRA_API_KEY || 'dev-tenant-api-key';
async function ingestLead(payload) {
  const res = await fetch(`${API_BASE}/api/leads/ingest`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': API_KEY }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error(`Ingest failed: ${res.status}`);
  return res.json();
}
async function main() {
  const mock = { source: 'topics', firstName: 'Jane', lastName: 'Doe', phone: '5125550000', email: 'jane@example.com', county: 'Travis', caseNumber: 'D-1-DC-25-999999', charge: 'PCS <1g', bondAmount: 1500, arrestDate: new Date().toISOString() };
  const resp = await ingestLead(mock);
  console.log('Ingested', resp);
}
main().catch(err => { console.error(err); process.exit(1); });
