// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo tenant and admin user...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Law Firm',
      slug: 'demo',
      apiKey: 'demo-api-key', // you can change this later
    },
  });

  const passwordHash = await bcrypt.hash('changeme123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      name: 'Demo Admin',
      hashedPassword: passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  console.log('Seed complete ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
