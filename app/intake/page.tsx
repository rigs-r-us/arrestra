"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IntakePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle"|"sending"|"error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push("/thanks");
    } else {
      setStatus("error");
    }
  }

  return (
    <main className="section">
      <div className="container" style={{maxWidth: 800}}>
        <div className="card">
          <h1 className="text-3xl font-extrabold m-0">Request a Demo</h1>
          <p className="section-sub mt-2">
            Tell us a bit about your firm and the counties / charges you care about. We’ll configure a demo tailored to you.
          </p>

          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2 mt-4">
            {/* Honeypot field (hidden) */}
            <input type="text" name="hp" className="hidden" tabIndex={-1} autoComplete="off" />

            <label className="md:col-span-1">
              <div className="muted text-sm mb-1">Name *</div>
              <input name="name" required className="card !p-3 w-full" placeholder="Jane Doe" />
            </label>
            <label className="md:col-span-1">
              <div className="muted text-sm mb-1">Work Email *</div>
              <input name="email" type="email" required className="card !p-3 w-full" placeholder="jane@firm.com" />
            </label>

            <label className="md:col-span-1">
              <div className="muted text-sm mb-1">Firm</div>
              <input name="firm" className="card !p-3 w-full" placeholder="Doe Defense PLLC" />
            </label>
            <label className="md:col-span-1">
              <div className="muted text-sm mb-1">County</div>
              <input name="county" className="card !p-3 w-full" placeholder="Travis, Harris, Dallas…" />
            </label>

            <label className="md:col-span-1">
              <div className="muted text-sm mb-1">Phone</div>
              <input name="phone" className="card !p-3 w-full" placeholder="(512) 555-1212" />
            </label>
            <label className="md:col-span-1">
              <div className="muted text-sm mb-1">Practice Focus</div>
              <select name="practice" className="card !p-3 w-full">
                <option value="">Select one</option>
                <option>DUI / DWI</option>
                <option>Assault / Violent</option>
                <option>Theft</option>
                <option>Drug</option>
                <option>General criminal defense</option>
              </select>
            </label>

            <label className="md:col-span-2">
              <div className="muted text-sm mb-1">What would you like to see in the demo?</div>
              <textarea name="message" rows={5} className="card !p-3 w-full" placeholder="Counties, charges, typical bail range, CRM, etc." />
            </label>

            <label className="md:col-span-2 flex items-center gap-2">
              <input name="consent" type="checkbox" className="h-4 w-4" />
              <span className="muted text-sm">
                I agree to be contacted about this request. Arrestra is a lead notification tool and does not provide legal advice.
              </span>
            </label>

            <div className="md:col-span-2 flex items-center gap-3">
              <button className="btn btn-primary" disabled={status==="sending"}>
                {status==="sending" ? "Sending…" : "Submit request"}
              </button>
              {status==="error" && <span className="text-red-300 text-sm">Something went wrong. Please try again.</span>}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
