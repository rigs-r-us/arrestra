import { prisma } from '@/src/lib/db';
import { getTenantFromRequest } from '@/src/lib/tenant';
import { LeadTable } from '@/components/LeadTable';

async function getLeads(tenantId: string) {
  return prisma.lead.findMany({
    where: { tenantId },
    include: { enrichments: { where: { provider: 'contact-verification' }, orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' }, take: 150
  });
}

export default async function DashboardPage() {
  const tenant = await getTenantFromRequest();
  if (!tenant) return <div className="card">No tenant resolved. In dev, append <code>?tenant=acme</code>.</div>;
  const leads = await getLeads(tenant.id);
  return (
    <main className="grid gap-6">
      <section className="card"><h2 className="text-xl font-semibold">{tenant.name} — Dashboard</h2><p className="text-slate-600">Subdomain: <strong>{tenant.slug}.arrestra.com</strong></p></section>
      <LeadTable leads={leads as any} />
    </main>
  );
}
