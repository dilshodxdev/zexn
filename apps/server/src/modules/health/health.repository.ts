import { prisma } from "../../lib/prisma.js";

/** Repository: faqat Prisma. DB'ga eng arzon so'rov. */
export async function pingDb(): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;
}
