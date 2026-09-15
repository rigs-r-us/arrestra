-- Phase 4: compliance workflow (mail queue, client response, contact permission)
-- All changes below are additive — no existing column, enum value, or table
-- is renamed or removed, so this is safe to run against a live database with
-- existing Lead rows.

-- New LeadStatus values. Postgres won't let a value just added be used in
-- the same transaction, but nothing here needs to use them yet, so this is
-- safe inside the single-transaction migration Prisma runs.
ALTER TYPE "LeadStatus" ADD VALUE 'REVIEWED';
ALTER TYPE "LeadStatus" ADD VALUE 'MAIL_QUEUED';
ALTER TYPE "LeadStatus" ADD VALUE 'CLIENT_RESPONDED';
ALTER TYPE "LeadStatus" ADD VALUE 'CONTACT_PERMITTED';

-- Compliance flags on Lead
ALTER TABLE "Lead" ADD COLUMN "clientResponded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "clientRespondedAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "contactPermitted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "contactPermittedAt" TIMESTAMP(3);

-- Outreach tracking
CREATE TYPE "OutreachChannel" AS ENUM ('DIRECT_MAIL', 'EMAIL', 'PHONE', 'SMS', 'INTERNAL_NOTE');
CREATE TYPE "OutreachStatus" AS ENUM ('NOT_STARTED', 'QUEUED', 'SENT', 'DELIVERED', 'RESPONDED', 'FAILED');

CREATE TABLE "OutreachEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "userId" TEXT,
    "channel" "OutreachChannel" NOT NULL,
    "status" "OutreachStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "templateId" TEXT,
    "notes" TEXT,
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OutreachEvent_tenantId_idx" ON "OutreachEvent"("tenantId");
CREATE INDEX "OutreachEvent_leadId_idx" ON "OutreachEvent"("leadId");
CREATE INDEX "OutreachEvent_userId_idx" ON "OutreachEvent"("userId");

ALTER TABLE "OutreachEvent" ADD CONSTRAINT "OutreachEvent_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OutreachEvent" ADD CONSTRAINT "OutreachEvent_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OutreachEvent" ADD CONSTRAINT "OutreachEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
