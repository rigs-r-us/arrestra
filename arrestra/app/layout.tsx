import './globals.css';
import { ReactNode } from 'react';

export const metadata = { title: 'Arrestra', description: 'Multi-tenant lead intelligence for defense attorneys' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en"><body>
      <div className="container">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Arrestra</h1>
          <nav className="flex gap-3">
            <a href="/dashboard" className="btn">Dashboard</a>
            <a href="/login" className="btn">Login</a>
          </nav>
        </header>
        {children}
      </div>
    </body></html>
  );
}
