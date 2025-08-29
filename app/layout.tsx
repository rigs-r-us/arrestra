import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Arrestra — Smart Leads for Smarter Defense",
  description: "Real‑time arrest & bail data → qualified leads for criminal defense firms.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <div className="container" style={{height: 68, display: "flex", alignItems: "center", justifyContent: "space-between"}}>
            <Link href="/" className="row" style={{gap: 10, textDecoration: "none"} as any}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="28" height="28" rx="8" fill="url(#g)"/>
                <path d="M8 20l6-12 6 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4f46e5"/>
                    <stop offset="1" stopColor="#06b6d4"/>
                  </linearGradient>
                </defs>
              </svg>
              <strong className="brand">Arrestra</strong>
            </Link>
            <nav className="row" style={{gap: 18}}>
              <a href="#features" className="muted">Features</a>
              <a href="#how" className="muted">How it works</a>
              <a href="#pricing" className="muted">Pricing</a>
              <a href="#faq" className="muted">FAQ</a>
            </nav>
            <div className="row" style={{gap: 10}}>
              <a className="btn btn-outline" href="#pricing">Pricing</a>
              <Link className="btn btn-primary" href="/intake">Request demo</Link>
            </div>
          </div>
        </header>
        {children}
        <footer>
          <div className="container" style={{padding: '28px 0', fontSize: 14}}>
            <div className="row">
              <div>© {new Date().getFullYear()} Arrestra. All rights reserved.</div>
              <div className="muted" style={{maxWidth: 780}}>
                Disclaimer: Arrestra is a notification and lead routing tool using publicly available data. It does not provide legal advice.
                Ensure use complies with applicable laws and professional conduct rules in your jurisdiction.
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
