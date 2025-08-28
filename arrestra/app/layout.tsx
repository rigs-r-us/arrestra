import React from "react";
import "./globals.css";

export const metadata = {
  title: "Arrestra Starter",
  description: "SaaS + Lead Gen MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-5xl mx-auto py-8 px-4">
          <header className="mb-8">
            <h1 className="text-2xl font-bold">Arrestra</h1>
            <p className="text-sm text-gray-600">SaaS + Lead Gen MVP</p>
            <nav className="mt-4 flex gap-4">
              <a className="underline" href="/">Home</a>
              <a className="underline" href="/leads">Leads</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
