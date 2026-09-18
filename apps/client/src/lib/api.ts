import axios, { AxiosError } from "axios";
import { apiErrorBodySchema, type ApiErrorCode } from "@zexn/shared";

/**
 * VITE_API_URL bo'sh -> o'z origin'idagi /api (dev'da Vite proxy, prod'da nginx).
 * To'ldirilgan -> to'g'ridan-to'g'ri o'sha URL (masalan alohida domen).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "/api";

/** Server xatosi client tomonda shu shaklda. UI `code` ga qarab matn tanlaydi. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number | null,
    public readonly code?: ApiErrorCode,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  withCredentials: true,
});

// Har qanday axios xatosini ApiError ga o'giramiz: komponentlar axios haqida bilmasin
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const parsed = apiErrorBodySchema.safeParse(err.response?.data);
    if (parsed.success) {
      const { message, code, meta } = parsed.data.error;
      return Promise.reject(
        new ApiError(message, err.response?.status ?? null, code as ApiErrorCode | undefined, meta),
      );
    }
    // Tarmoq xatosi yoki kutilmagan format
    return Promise.reject(
      new ApiError(err.message || "Tarmoq xatosi", err.response?.status ?? null),
    );
  },
);
