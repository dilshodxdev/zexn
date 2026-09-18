import { healthResponseSchema, type HealthResponse } from "@zexn/shared";
import { api } from "@/lib/api";

/**
 * GET /api/health -> (proxy) -> server /health.
 * Javob shared schema bilan tekshiriladi: server kontraktni buzsa client darrov ushlaydi.
 */
export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await api.get<unknown>("/health");
  return healthResponseSchema.parse(data);
}
