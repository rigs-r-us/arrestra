import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="relative overflow-hidden border-border/70 bg-card/60">
      {/* subtle red accent */}
      <div className="pointer-events-none absolute -top-24 right-0 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {hint ? (
          <Badge variant="secondary" className="bg-accent/60 text-muted-foreground">
            {hint}
          </Badge>
        ) : null}
      </CardContent>
    </Card>
  );
}

function EmptyLeadsState() {
  return (
    <Card className="border-border/70 bg-card/60">
      <CardHeader>
        <CardTitle className="text-base">Recent leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          No leads yet. When your scraper starts ingesting, they’ll show up here.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/leads">Go to Leads</Link>
          </Button>
          <Button asChild variant="secondary" className="bg-accent/60">
            <Link href="/settings">Connect integrations</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  // Later: replace with real query (tenant-aware) -> const leads = await ...
  const hasLeads = false;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Pipeline overview for your firm.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="New leads" value="0" hint="today" />
        <KpiCard label="Qualified" value="0" hint="today" />
        <KpiCard label="Contacted" value="0" hint="7 days" />
        <KpiCard label="Won" value="0" hint="30 days" />
      </div>

      {hasLeads ? (
        <Card className="border-border/70 bg-card/60">
          <CardHeader>
            <CardTitle className="text-base">Recent leads</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            (Next) We’ll render a shadcn Table here fed by GET /api/leads.
          </CardContent>
        </Card>
      ) : (
        <EmptyLeadsState />
      )}
    </div>
  );
}
