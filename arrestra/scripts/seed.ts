import { prisma } from "../lib/prisma";

async function main() {
  const now = new Date();
  const sample = [
    {
      fullName: "John Doe",
      county: "Travis",
      charge: "DUI",
      bailAmount: 2500,
      arrestTime: new Date(now.getTime() - 45 * 60 * 1000),
      score: 65,
      source: "mock://seed",
      status: "NEW",
    },
    {
      fullName: "Jane Smith",
      county: "Harris",
      charge: "Assault",
      bailAmount: 10000,
      arrestTime: new Date(now.getTime() - 15 * 60 * 1000),
      score: 85,
      source: "mock://seed",
      status: "NEW",
    },
    {
      fullName: "Alex Johnson",
      county: "Dallas",
      charge: "Theft",
      bailAmount: 1500,
      arrestTime: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      score: 50,
      source: "mock://seed",
      status: "NEW",
    },
  ] as const;

  for (const s of sample) {
    await prisma.lead.create({ data: s as any });
  }
  console.log(`Seeded ${sample.length} leads.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
