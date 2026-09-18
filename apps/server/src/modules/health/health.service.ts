import type { HealthResponse } from "@zexn/shared";
import { prisma } from "../../lib/prisma.js";

const DB_TIMEOUT_MS = 2000;

/** DB'ga eng arzon so'rov. Timeout: health endpoint osilib qolmasin. */
async function checkDb(): Promise<HealthResponse["db"]> {
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("db timeout")), DB_TIMEOUT_MS)),
    ]);
    return "ok";
  } catch {
    return "down";
  }
}

export async function getHealth(): Promise<HealthResponse> {
  return {
    status: "ok",
    service: "zexn-server",
    time: new Date().toISOString(),
    uptimeSec: Math.round(process.uptime()),
    db: await checkDb(),
  };
}
