-- Backfill migration: records schema that was already applied out-of-band
-- (likely via `prisma db push` or manual SQL, sometime around the original
-- lead-scoring/enrichment work) to every database with real data, but was
-- never captured as a tracked migration file. Discovered when a fresh
-- `prisma migrate deploy` against a brand-new database (a new Neon branch
-- created for production) came up missing these columns/index/enum values
-- that schema.prisma has always declared.
--
-- This is additive only. Environments that already have this schema
-- (the Neon "development" branch, the pre-cutover production database)
-- should be baselined with `prisma migrate resolve --applied
-- 20260915153000_backfill_lead_enrichment_columns` rather than having this
-- SQL run against them again.

-- AlterEnum
BEGIN;
CREATE TYPE "LeadStatus_new" AS ENUM ('NEW', 'MAILED', 'QUALIFIED', 'RETAINED', 'CLOSED_WON', 'CLOSED_LOST', 'DISMISSED', 'REVIEWED', 'MAIL_QUEUED', 'CLIENT_RESPONDED', 'CONTACT_PERMITTED');
ALTER TABLE "Lead" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Lead" ALTER COLUMN "status" TYPE "LeadStatus_new" USING ("status"::text::"LeadStatus_new");
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
ALTER TYPE "LeadStatus_new" RENAME TO "LeadStatus";
DROP TYPE "LeadStatus_old";
ALTER TABLE "Lead" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bondType" TEXT,
ADD COLUMN     "bookingDate" TIMESTAMP(3),
ADD COLUMN     "chargeSeverity" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "courtName" TEXT,
ADD COLUMN     "custodyStatus" TEXT,
ADD COLUMN     "disposition" TEXT,
ADD COLUMN     "fingerprint" TEXT,
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "jailName" TEXT,
ADD COLUMN     "lastScoredAt" TIMESTAMP(3),
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'LOW',
ADD COLUMN     "rawData" JSONB,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zip" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_tenantId_source_fingerprint_key" ON "Lead"("tenantId" ASC, "source" ASC, "fingerprint" ASC);
