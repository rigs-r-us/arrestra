# Arrestra Starter (Next.js + Prisma + SQLite)

Minimal scaffold to explore the Arrestra MVP. Includes:
- Next.js App Router
- Prisma ORM with SQLite (dev)
- Mock Leads API and /leads page

## Quickstart

```bash
# 1) Setup
cp .env.example .env

# 2) Install
npm install

# 3) Prisma client + DB
npm run prisma:generate
npm run db:push

# 4) Seed mock data
npm run seed

# 5) Run
npm run dev
```

Visit http://localhost:3000/leads

---

Generated: 2025-08-28T16:31:00.950432
