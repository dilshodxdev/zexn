import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  API_ERROR_CODES,
  apiErrorBodySchema,
  authResponseSchema,
  type ApiErrorCode,
} from "@zexn/shared";
import { useAuthStore } from "@/stores/authStore";

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

// Request interceptor: accessToken mavjud bo'lsa Authorization header qo'shadi
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

/** Token expired bo'lganda bir marta refresh qilib yangi tokenni qaytaradi */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
      const data = authResponseSchema.parse(res.data);
      useAuthStore.getState().setSession(data);
      return data.accessToken;
    } catch {
      useAuthStore.getState().clear();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// Response interceptor: ApiError ga o'girish va TOKEN_EXPIRED da avtomatik refresh
api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const originalRequest = err.config as RetryConfig | undefined;
    const parsed = apiErrorBodySchema.safeParse(err.response?.data);

    if (parsed.success) {
      const { message, code, meta } = parsed.data.error;

      // TOKEN_EXPIRED bo'lsa bir marta refresh qilib so'rovni qaytaradi
      if (code === API_ERROR_CODES.TOKEN_EXPIRED && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      }

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
