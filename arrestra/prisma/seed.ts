import { prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  const slug = 'acme';
  const apiKey = process.env.SEED_TENANT_API_KEY || 'dev-tenant-api-key';
  const tenant = await prisma.tenant.upsert({ where: { slug }, create: { name: 'Acme Defense', slug, apiKey }, update: {} });
  await prisma.domain.upsert({ where: { domain: 'acme' }, create: { domain: 'acme', tenantId: tenant.id, primary: true }, update: {} });
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@acmefirm.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';
  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.upsert({ where: { email }, create: { email, name: 'Acme Admin', hashedPassword: hashed, role: 'ADMIN', tenantId: tenant.id }, update: {} });
  await prisma.lead.create({ data: { tenantId: tenant.id, source: 'seed', firstName: 'John', lastName: 'Smith', county: 'Travis', charge: 'DWI', bondAmount: 3000, notes: 'Seed lead for demo' } });
  console.log('Seed complete');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
