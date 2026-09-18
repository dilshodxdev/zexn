import {
  authResponseSchema,
  meResponseSchema,
  type AuthResponse,
  type LoginBody,
  type MeResponse,
  type RegisterCenterBody,
  type SelectCenterBody,
} from "@zexn/shared";
import { api } from "@/lib/api";

/** POST /api/auth/login */
export async function login(body: LoginBody): Promise<AuthResponse> {
  const { data } = await api.post<unknown>("/auth/login", body);
  return authResponseSchema.parse(data);
}

/** POST /api/auth/register */
export async function registerCenter(body: RegisterCenterBody): Promise<AuthResponse> {
  const { data } = await api.post<unknown>("/auth/register", body);
  return authResponseSchema.parse(data);
}

/** POST /api/auth/refresh */
export async function refresh(): Promise<AuthResponse> {
  const { data } = await api.post<unknown>("/auth/refresh");
  return authResponseSchema.parse(data);
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/** POST /api/auth/select-center */
export async function selectCenter(body: SelectCenterBody): Promise<AuthResponse> {
  const { data } = await api.post<unknown>("/auth/select-center", body);
  return authResponseSchema.parse(data);
}

/** GET /api/me */
export async function fetchMe(): Promise<MeResponse> {
  const { data } = await api.get<unknown>("/me");
  return meResponseSchema.parse(data);
}
