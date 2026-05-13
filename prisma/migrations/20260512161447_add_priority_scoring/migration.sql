/*
  Warnings:

  - Made the column `score` on table `Enrichment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Enrichment" ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'LOW',
ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "score" SET DEFAULT 0;
