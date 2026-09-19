-- DropForeignKey
ALTER TABLE "interview_sessions" DROP CONSTRAINT "interview_sessions_skillId_fkey";

-- AlterTable
ALTER TABLE "interview_sessions" ADD COLUMN     "track" TEXT NOT NULL DEFAULT 'frontend',
ALTER COLUMN "skillId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;
