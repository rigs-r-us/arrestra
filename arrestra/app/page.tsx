export default function Home() {
  return (
    <main className="grid gap-6">
      <section className="card">
        <h2 className="text-xl font-semibold mb-2">Smarter Leads for Smarter Defense</h2>
        <p className="text-slate-600">
          Arrestra collects arrest/bail intel from TOPICs and enriches it with public data to qualify high-intent leads.
        </p>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        <div className="card"><h3 className="font-semibold mb-1">Multi-tenant by design</h3><p className="text-slate-600">Each firm has an isolated subdomain (e.g., <em>firm.arrestra.com</em>).</p></div>
        <div className="card"><h3 className="font-semibold mb-1">Automated enrichment</h3><p className="text-slate-600">Contact verification, docket lookups, jail roster checks, and more.</p></div>
        <div className="card"><h3 className="font-semibold mb-1">Lightweight CRM</h3><p className="text-slate-600">Pipeline statuses, events, and exports.</p></div>
      </section>
    </main>
  );
}
