import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/70 bg-card/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <Badge variant="secondary" className="bg-accent/60 text-muted-foreground">
          last 24h
        </Badge>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Today’s pipeline snapshot. We’ll wire this to Neon once the UI is locked.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New leads" value="12" />
        <Stat label="Qualified" value="5" />
        <Stat label="Contacted" value="3" />
        <Stat label="Won" value="1" />
      </div>

      <Card className="border-border/70 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Recent leads</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Next: we’ll add <code className="rounded bg-accent/60 px-1">/api/leads</code> + a table here.
        </CardContent>
      </Card>
    </div>
  );
}
