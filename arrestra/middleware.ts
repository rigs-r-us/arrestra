import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/src/lib/db';
export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const res = NextResponse.next();
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
  const hostname = host.split(':')[0];
  let tenantId: string | null = null;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const sub = parts[0];
    const domain = await prisma.domain.findUnique({ where: { domain: sub } }).catch(()=>null);
    if (domain) tenantId = domain.tenantId;
    if (!tenantId) { const t = await prisma.tenant.findUnique({ where: { slug: sub } }).catch(()=>null); if (t) tenantId = t.id; }
  }
  if (!tenantId) { const slug = url.searchParams.get('tenant'); if (slug) { const t = await prisma.tenant.findUnique({ where: { slug } }).catch(()=>null); if (t) tenantId = t.id; } }
  if (!tenantId) { const t = await prisma.tenant.findFirst().catch(()=>null); if (t) tenantId = t.id; }
  if (tenantId) res.headers.set('x-tenant-id', tenantId);
  return res;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth).*)'] };
