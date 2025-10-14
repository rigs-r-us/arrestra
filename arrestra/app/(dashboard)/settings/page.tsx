import { prisma } from '@/src/lib/db';
import { getTenantFromRequest } from '@/src/lib/tenant';
export default async function SettingsPage() {
  const tenant = await getTenantFromRequest();
  if (!tenant) return <div className="card">No tenant</div>;
  const domains = await prisma.domain.findMany({ where: { tenantId: tenant.id } });
  return (
    <main className="grid gap-6">
      <section className="card"><h2 className="text-xl font-semibold">Firm Settings</h2><p className="text-slate-600">Slug / Subdomain: <strong>{tenant.slug}</strong></p></section>
      <section className="card"><h3 className="font-semibold mb-2">Domains</h3><ul className="list-disc pl-5 text-slate-700">{domains.map(d => <li key={d.id}>{d.domain}{d.primary ? " (primary)" : ""}</li>)}</ul></section>
    </main>
  );
}
