import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(1200px 420px at 50% -120px, rgba(229,57,53,.18), transparent 60%), #0A0F1D",
      }}
    >
      <header
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{
          background: "rgba(7, 11, 22, 0.92)",
          borderColor: "#10182a",
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl"
              style={{
                background: "rgba(229,57,53,.15)",
                border: "1px solid rgba(229,57,53,.35)",
              }}
            />

            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-white">
                Arrestra
              </div>

              <div className="text-xs text-slate-400">
                Firm Dashboard
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              className="text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>

            <Separator
              orientation="vertical"
              className="mx-2 h-6 bg-slate-700"
            />

            <Button
              asChild
              className="border border-slate-700 bg-slate-900 text-white hover:bg-slate-800"
            >
              <Link href="/api/auth/signout">Sign out</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}