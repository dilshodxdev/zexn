-- AlterTable
ALTER TABLE "centers" ADD COLUMN     "mentorSystemPrompt" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "promptUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "promptUpdatedByUserId" TEXT;

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "mentorSystemPrompt" TEXT NOT NULL DEFAULT '',
    "updatedByUserId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "centers" ADD CONSTRAINT "centers_promptUpdatedByUserId_fkey" FOREIGN KEY ("promptUpdatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
