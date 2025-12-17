]import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/70 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                <Skeleton className="h-4 w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/70 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">Recent leads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-80" />
          <Skeleton className="h-4 w-64" />
        </CardContent>
      </Card>
    </div>
  );
}
