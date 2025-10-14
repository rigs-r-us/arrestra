import { headers } from 'next/headers';
import { prisma } from './db';
export async function getTenantFromRequest() {
  const h = await headers();
  const tid = h.get('x-tenant-id');
  if (tid) {
    const tenant = await prisma.tenant.findUnique({ where: { id: tid } });
    if (tenant) return tenant;
  }
  const host = h.get('x-forwarded-host') || h.get('host') || '';
  const parts = host.split(':')[0].split('.');
  if (parts.length > 2) {
    const sub = parts[0];
    const domain = await prisma.domain.findUnique({ where: { domain: sub } }).catch(()=>null);
    if (domain) return prisma.tenant.findUnique({ where: { id: domain.tenantId } });
    const t = await prisma.tenant.findUnique({ where: { slug: sub } });
    if (t) return t;
  }
  const referer = h.get('referer') ?? '';
  try { const url = new URL(referer); const slug = url.searchParams.get('tenant'); if (slug) { const t = await prisma.tenant.findUnique({ where: { slug } }); if (t) return t; } } catch {}
  return prisma.tenant.findFirst();
}
