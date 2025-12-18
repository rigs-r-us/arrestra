import '~/app/globals.css';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/15 ring-1 ring-primary/40" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">Arrestra</div>
              <div className="text-xs text-muted-foreground">Firm Dashboard</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/api/auth/signout">Sign out</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
