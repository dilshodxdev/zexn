import { z } from "zod";
import { idSchema, roleSchema } from "./common.js";

/** Login: kichik lotin harf, raqam, nuqta, pastki chiziq. 3-32 belgi. Global unique. */
export const loginSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._]{3,32}$/, "Login: 3-32 ta kichik lotin harf, raqam, nuqta yoki _");

export const passwordSchema = z.string().min(8, "Parol kamida 8 ta belgi").max(128);

/** POST /api/auth/register - markaz ro'yxatdan o'tadi, foydalanuvchi birinchi CENTER_ADMIN bo'ladi */
export const registerCenterBodySchema = z.object({
  centerName: z.string().trim().min(2).max(80),
  fullName: z.string().trim().min(2).max(80),
  login: loginSchema,
  password: passwordSchema,
});
export type RegisterCenterBody = z.infer<typeof registerCenterBodySchema>;

/** POST /api/auth/login */
export const loginBodySchema = z.object({
  login: loginSchema,
  password: z.string().min(1),
});
export type LoginBody = z.infer<typeof loginBodySchema>;

/** POST /api/auth/change-password */
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;

/** POST /api/auth/select-center - bu yerdagi centerId tenant EMAS, tanlov (server membership'ni tekshiradi) */
export const selectCenterBodySchema = z.object({
  centerId: idSchema,
});
export type SelectCenterBody = z.infer<typeof selectCenterBodySchema>;

export const userSummarySchema = z.object({
  id: idSchema,
  fullName: z.string(),
  login: z.string(),
  isSuperAdmin: z.boolean(),
  mustChangePassword: z.boolean(),
  hasTelegram: z.boolean(),
});
export type UserSummary = z.infer<typeof userSummarySchema>;

export const membershipSummarySchema = z.object({
  id: idSchema,
  centerId: idSchema,
  centerName: z.string(),
  centerSlug: z.string(),
  role: roleSchema,
});
export type MembershipSummary = z.infer<typeof membershipSummarySchema>;

/** login / register / refresh / select-center javobi. Refresh token httpOnly cookie'da, body'da yo'q. */
export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: userSummarySchema,
  memberships: z.array(membershipSummarySchema),
  /** JWT'dagi joriy membership; bitta membership bo'lsa server avtomatik tanlaydi */
  currentMembership: membershipSummarySchema.nullable(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

/** GET /api/me - accessToken'siz */
export const meResponseSchema = authResponseSchema.omit({ accessToken: true });
export type MeResponse = z.infer<typeof meResponseSchema>;

/** Access JWT payload (server ichki, client ham decode qilib ko'rishi mumkin) */
export const accessTokenPayloadSchema = z.object({
  sub: idSchema,
  isSuperAdmin: z.boolean(),
  membership: z.object({ centerId: idSchema, role: roleSchema }).optional(),
});
export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
