import { PrismaClient } from "@prisma/client";
import { isProd } from "../config/env.js";

/**
 * Butun server uchun bitta PrismaClient. Har modulda yangi client ochish
 * connection pool'ni tugatadi.
 *
 * 2-bosqichda bu yerga tenant scope extension qo'shiladi: centerId filtri har so'rovda majburiy.
 * Hozircha oddiy client - tenant jadvallari hali yo'q.
 */
export const prisma = new PrismaClient({
  log: isProd ? ["error"] : ["warn", "error"],
});
