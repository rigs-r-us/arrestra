// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const firstNames = [
  'Marcus', 'Daniel', 'Anthony', 'Jose', 'David',
  'Christopher', 'Michael', 'Robert', 'James', 'John',
];

const lastNames = [
  'Johnson', 'Ramirez', 'Williams', 'Garcia', 'Martinez',
  'Brown', 'Davis', 'Miller', 'Wilson', 'Moore',
];

const counties = ['Travis', 'Williamson', 'Hays', 'Bexar', 'Dallas'];

const charges = [
  { charge: 'Driving While Intoxicated', severity: 'Misdemeanor Class B', baseScore: 88 },
  { charge: 'Assault Causing Bodily Injury', severity: 'Misdemeanor Class A', baseScore: 84 },
  { charge: 'Possession of Controlled Substance', severity: 'State Jail Felony', baseScore: 91 },
  { charge: 'Theft', severity: 'Misdemeanor Class A', baseScore: 66 },
  { charge: 'Unlawful Carrying Weapon', severity: 'Misdemeanor Class A', baseScore: 79 },
  { charge: 'Criminal Trespass', severity: 'Misdemeanor Class B', baseScore: 52 },
  { charge: 'Evading Arrest', severity: 'Misdemeanor Class A', baseScore: 74 },
  { charge: 'Family Violence Assault', severity: 'Misdemeanor Class A', baseScore: 89 },
];

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function main() {
  console.log('Seeding demo tenant, admin user, and demo leads...');

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Law Firm',
      slug: 'demo',
      apiKey: 'demo-api-key',
    },
  });

  const passwordHash = await bcrypt.hash('changeme123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {
      name: 'Demo Admin',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
    create: {
      email: 'admin@demo.com',
      name: 'Demo Admin',
      hashedPassword: passwordHash,
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  // Remove old demo-seeded leads so repeated seeding stays clean.
  await prisma.lead.deleteMany({
    where: {
      tenantId: tenant.id,
      source: 'demo-seed',
    },
  });

  const demoLeads = Array.from({ length: 100 }, (_, index) => {
    const chargeInfo = charges[index % charges.length];
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[(index * 3) % lastNames.length];
    const county = counties[index % counties.length];

    // Match your dashboard expectation: 1 HOT, 7 WARM, rest LOW.
    const priority = index === 0 ? 'HOT' : index <= 7 ? 'WARM' : 'LOW';
    const score = index === 0 ? 94 : index <= 7 ? 78 - index : Math.max(25, chargeInfo.baseScore - 35);

    return {
      tenantId: tenant.id,
      source: 'demo-seed',
      fingerprint: `demo-lead-${index + 1}`,
      sourceId: `DEMO-${String(index + 1).padStart(4, '0')}`,
      sourceUrl: 'https://example.com/demo-booking-record',
      rawData: {
        demo: true,
        generatedBy: 'prisma/seed.ts',
        index: index + 1,
      },
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      county,
      caseNumber: `D-${new Date().getFullYear()}-${String(index + 1).padStart(5, '0')}`,
      arrestDate: daysAgo((index % 30) + 1),
      bookingDate: daysAgo(index % 30),
      chargeSeverity: chargeInfo.severity,
      disposition: index % 4 === 0 ? 'Pending arraignment' : 'Pending',
      courtName: `${county} County Court`,
      jailName: `${county} County Jail`,
      address: `${1000 + index} Demo Creek Dr`,
      city:
        county === 'Travis'
          ? 'Austin'
          : county === 'Williamson'
            ? 'Round Rock'
            : county === 'Hays'
              ? 'San Marcos'
              : county === 'Bexar'
                ? 'San Antonio'
                : 'Dallas',
      state: 'TX',
      zip:
        county === 'Travis'
          ? '78701'
          : county === 'Williamson'
            ? '78664'
            : county === 'Hays'
              ? '78666'
              : county === 'Bexar'
                ? '78205'
                : '75201',
      charge: chargeInfo.charge,
      bondAmount: 1500 + (index % 12) * 750,
      bondType: index % 3 === 0 ? 'Surety Bond' : 'Cash/Surety Bond',
      custodyStatus: index % 5 === 0 ? 'In Custody' : 'Released on Bond',
      notes: 'Demo lead generated for Arrestra dashboard testing.',
      score,
      priority,
      lastScoredAt: new Date(),
      status: 'NEW' as const,
    };
  });

  await prisma.lead.createMany({
    data: demoLeads,
    skipDuplicates: true,
  });

  const leadCount = await prisma.lead.count({
    where: {
      tenantId: tenant.id,
      source: 'demo-seed',
    },
  });

  console.log(`Seed complete ✅ Created ${leadCount} demo leads for tenant ${tenant.slug}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });