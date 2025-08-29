import Link from "next/link";

export default function Landing() {
  return (
    <main className="relative">
      {/* ===== Hero ===== */}
      <section className="hero section">
        <div className="container grid gap-6 md:grid-cols-[1.1fr_.9fr] relative z-10">
          <div>
            <span className="pill">Smart Leads for Smarter Defense</span>
            <h1 className="hero-title mt-3">
              <span className="grad">Real‑time arrest leads</span> for criminal defense firms
            </h1>
            <p className="lead mt-4">
              We pull public arrest & bail data, score and qualify cases, then deliver them to your inbox or CRM—fast and compliant.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/intake" className="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 8l4 4-4 4M3 12h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Get started
              </Link>
              <a href="#how" className="btn btn-outline">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                How it works
              </a>
            </div>
          </div>

          <div>
            <div className="card">
              <div className="row">
                <div>
                  <div className="text-sm muted">Lead • Travis County</div>
                  <div className="font-extrabold text-xl">Jane Smith — Assault</div>
                </div>
                <span className="pill">Score 85</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-200/90 mt-3">
                <div><strong>Bail:</strong> $10,000</div>
                <div><strong>Arrested:</strong> 15m ago</div>
                <div><strong>Delivery:</strong> Email + CRM</div>
                <div><strong>Status:</strong> New</div>
              </div>
              <div className="row mt-4">
                <Link className="btn btn-primary" href="/intake">Claim</Link>
                <Link className="btn btn-outline" href="/intake">Mark contacted</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Audience ===== */}
      <section className="section pt-10">
        <div className="container grid gap-6 md:grid-cols-3">
          <div className="card">
            <div className="icon">🏛️</div>
            <h3 className="mt-3 text-lg font-semibold">Criminal defense attorneys</h3>
            <p className="section-sub mt-2">Solo or small‑firm partners who need high‑intent opportunities.</p>
          </div>
          <div className="card">
            <div className="icon">⚖️</div>
            <h3 className="mt-3 text-lg font-semibold">Practice‑area firms</h3>
            <p className="section-sub mt-2">DUI, assault, theft, and other high‑volume charge categories.</p>
          </div>
          <div className="card">
            <div className="icon">🔗</div>
            <h3 className="mt-3 text-lg font-semibold">Legal marketing agencies</h3>
            <p className="section-sub mt-2">Plug Arrestra into intake workflows and CRMs.</p>
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section id="features" className="section">
        <div className="container text-center max-w-[780px]">
          <h2 className="section-title font-bold">Everything you need to act first</h2>
          <p className="section-sub mt-2">Speed, accuracy, and clean delivery—built for small to mid‑size firms.</p>
        </div>
        <div className="container grid gap-6 md:grid-cols-3 mt-6">
          <div className="card">
            <div className="row">
              <div className="icon">📥</div><h3 className="text-lg font-semibold">Smart Lead Inbox</h3>
            </div>
            <p className="section-sub mt-2">Filter by county, charge, severity, and score. Export CSV or sync to CRM.</p>
            <ul className="list">
              <li><span className="tick">✔</span> Charge & county filters</li>
              <li><span className="tick">✔</span> Score thresholds</li>
              <li><span className="tick">✔</span> CSV & CRM sync</li>
            </ul>
          </div>
          <div className="card">
            <div className="row">
              <div className="icon">🧮</div><h3 className="text-lg font-semibold">Scoring & Qualification</h3>
            </div>
            <p className="section-sub mt-2">Rule‑based scoring considers charge type, bail, recency, and repeat‑offender flags.</p>
            <ul className="list">
              <li><span className="tick">✔</span> Charge & bail weights</li>
              <li><span className="tick">✔</span> Recency boosts</li>
              <li><span className="tick">✔</span> Repeat‑offender signals</li>
            </ul>
          </div>
          <div className="card">
            <div className="row">
              <div className="icon">🔌</div><h3 className="text-lg font-semibold">Delivery to Your Stack</h3>
            </div>
            <p className="section-sub mt-2">Email, SMS, Slack, and CRM integrations like Clio, HubSpot, and Lawmatics.</p>
            <ul className="list">
              <li><span className="tick">✔</span> Inbox alerts</li>
              <li><span className="tick">✔</span> Slack actions</li>
              <li><span className="tick">✔</span> CRM upsert</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how" className="section">
        <div className="container text-center max-w-[760px]">
          <h2 className="section-title font-bold">How it works</h2>
          <p className="section-sub mt-2">Data in → scoring → qualified leads out.</p>
        </div>
        <div className="container grid gap-6 md:grid-cols-4 mt-6">
          <div className="card"><h3 className="text-lg font-semibold">Data Scraping / APIs</h3><p className="section-sub mt-2">Pull from public sources (e.g., Texas Bail Dashboard) and normalize.</p></div>
          <div className="card"><h3 className="text-lg font-semibold">Filtering Engine</h3><p className="section-sub mt-2">Filter by charge type, county, time posted, bail amount, and repeat offenders.</p></div>
          <div className="card"><h3 className="text-lg font-semibold">Lead Enrichment</h3><p className="section-sub mt-2">Match contact when allowed (e.g., third‑party APIs); flag public defender status.</p></div>
          <div className="card"><h3 className="text-lg font-semibold">Delivery & Notification</h3><p className="section-sub mt-2">Email/SMS/Slack updates; CRM sync to Clio, HubSpot, Lawmatics.</p></div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="section">
        <div className="container text-center max-w-[760px]">
          <h2 className="section-title font-bold">Simple, firm‑friendly pricing</h2>
          <p className="section-sub mt-2">Start small, scale as your caseload grows.</p>
        </div>
        <div className="container grid gap-6 md:grid-cols-3 mt-6">
          <div className="card">
            <h3 className="text-xl font-semibold">Starter</h3>
            <div className="mt-2 text-3xl font-extrabold">$499 <span className="text-sm font-semibold text-slate-400">/mo</span></div>
            <ul className="list">
              <li><span className="tick">✔</span> Up to 30 leads / month</li>
              <li><span className="tick">✔</span> Email delivery</li>
              <li><span className="tick">✔</span> CSV export</li>
            </ul>
            <Link href="/intake" className="btn btn-outline mt-5 w-full">Get Starter</Link>
          </div>
          <div className="card ring-1 ring-indigo-400/40">
            <span className="pill mb-1 inline-block">Most popular</span>
            <h3 className="text-xl font-semibold">Growth</h3>
            <div className="mt-2 text-3xl font-extrabold">$999 <span className="text-sm font-semibold text-slate-400">/mo</span></div>
            <ul className="list">
              <li><span className="tick">✔</span> Up to 75 leads / month</li>
              <li><span className="tick">✔</span> Slack alerts + actions</li>
              <li><span className="tick">✔</span> One CRM integration</li>
            </ul>
            <Link href="/intake" className="btn btn-primary mt-5 w-full">Get Growth</Link>
          </div>
          <div className="card">
            <h3 className="text-xl font-semibold">Firm Unlimited</h3>
            <div className="mt-2 text-3xl font-extrabold">$1,999 <span className="text-sm font-semibold text-slate-400">/mo</span></div>
            <ul className="list">
              <li><span className="tick">✔</span> Unlimited leads</li>
              <li><span className="tick">✔</span> Priority routing</li>
              <li><span className="tick">✔</span> Advanced analytics</li>
            </ul>
            <Link href="/intake" className="btn btn-outline mt-5 w-full">Get Unlimited</Link>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="cta" className="section">
        <div className="container">
          <div className="card row">
            <div>
              <h3 className="text-2xl font-bold m-0">Ready to see real leads in your inbox?</h3>
              <p className="section-sub mt-2">Start with a demo. We’ll configure counties, charge filters, and score thresholds.</p>
            </div>
            <Link className="btn btn-primary" href="/intake">Request a demo</Link>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="section pt-10">
        <div className="container text-center max-w-[780px]">
          <h2 className="section-title font-bold">FAQ & Compliance</h2>
          <p className="section-sub mt-2">Built to respect public information laws and professional guidelines.</p>
        </div>
        <div className="container grid gap-6 md:grid-cols-3 mt-6">
          <div className="card"><h3 className="text-lg font-semibold">Where does the data come from?</h3><p className="section-sub mt-2">Public sources (e.g., county dashboards). We normalize and dedupe, then apply your filters.</p></div>
          <div className="card"><h3 className="text-lg font-semibold">Is this legal in my state?</h3><p className="section-sub mt-2">We use publicly available data and include attorney‑approved disclaimers. Confirm rules with local counsel.</p></div>
          <div className="card"><h3 className="text-lg font-semibold">Do you include sensitive PII?</h3><p className="section-sub mt-2">No. We avoid data that cannot be legally resold and provide redaction options in notifications.</p></div>
        </div>
      </section>
    </main>
  );
}
