import { prisma } from "@/lib/prisma";
import LeadCard from "@/components/LeadCard";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { arrestTime: "desc" },
    take: 25,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Leads</h2>
      {leads.length === 0 && <p>No leads yet. Run the seed script to add some.</p>}
      {leads.map((l) => (
        <LeadCard
          key={l.id}
          lead={{
            ...l,
            arrestTime: l.arrestTime.toISOString(),
            createdAt: l.createdAt.toISOString(),
          }}
        />
      ))}
    </div>
  );
}
