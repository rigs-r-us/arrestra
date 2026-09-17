import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCurrentUser } from "@/lib/session";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/mail-queue", label: "Mail Queue" },
  { href: "/exports", label: "Exports" },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl flex-wrap items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl"
              style={{
                background: "rgba(229,57,53,.12)",
                border: "1px solid rgba(229,57,53,.30)",
              }}
            />

            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-foreground">
                Arrestra
              </div>
              <div className="text-xs text-muted-foreground">Firm Dashboard</div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}

            {user?.role === "ADMIN" && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Link href="/settings">Settings</Link>
              </Button>
            )}

            <Separator orientation="vertical" className="mx-2 h-6 bg-border" />

            <Button asChild size="sm" variant="outline">
              <Link href="/api/auth/signout">Sign out</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
