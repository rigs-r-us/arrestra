-- DropIndex
DROP INDEX "OutreachEvent_leadId_idx";

-- DropIndex
DROP INDEX "OutreachEvent_tenantId_idx";

-- DropIndex
DROP INDEX "OutreachEvent_userId_idx";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "magistrate" TEXT,
ADD COLUMN     "magistrationDate" TIMESTAMP(3);
