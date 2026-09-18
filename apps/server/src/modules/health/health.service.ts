import type { HealthResponse } from "@zexn/shared";
import * as healthRepository from "./health.repository.js";

const DB_TIMEOUT_MS = 2000;

/** Timeout bilan: health endpoint DB osilib qolsa ham javob beradi. */
async function checkDb(): Promise<HealthResponse["db"]> {
  try {
    await Promise.race([
      healthRepository.pingDb(),
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
