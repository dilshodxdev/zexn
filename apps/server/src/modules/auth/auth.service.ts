import bcrypt from "bcrypt";
import {
  API_ERROR_CODES,
  type AuthResponse,
  type ChangePasswordBody,
  type LoginBody,
  type MembershipSummary,
  type RegisterCenterBody,
  type SelectCenterBody,
  type UserSummary,
} from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import * as authRepository from "./auth.repository.js";
import { passwordStrategy } from "./strategies/PasswordStrategy.js";
import * as tokenService from "./token.service.js";

type UserWithMemberships = NonNullable<
  Awaited<ReturnType<typeof authRepository.findUserWithMemberships>>
>;

export type AuthSession = { body: AuthResponse; refreshToken: string };

function summarizeUser(user: UserWithMemberships): UserSummary {
  return {
    id: user.id,
    fullName: user.fullName,
    login: user.login,
    isSuperAdmin: user.isSuperAdmin,
    mustChangePassword: user.mustChangePassword,
    hasTelegram: user.telegramId !== null,
  };
}

function summarizeMembership(
  membership: UserWithMemberships["memberships"][number],
): MembershipSummary {
  return {
    id: membership.id,
    centerId: membership.centerId,
    centerName: membership.center.name,
    centerSlug: membership.center.slug,
    role: membership.role,
  };
}

function selectMembership(user: UserWithMemberships, centerId?: string) {
  if (centerId) return user.memberships.find((item) => item.centerId === centerId) ?? null;
  return user.memberships.length === 1 ? user.memberships[0] : null;
}

async function createSession(user: UserWithMemberships, centerId?: string): Promise<AuthSession> {
  const current = selectMembership(user, centerId);
  const tokens = await tokenService.issueSession(
    user,
    current ? { centerId: current.centerId, role: current.role } : undefined,
  );
  return {
    body: {
      accessToken: tokens.accessToken,
      user: summarizeUser(user),
      memberships: user.memberships.map(summarizeMembership),
      currentMembership: current ? summarizeMembership(current) : null,
    },
    refreshToken: tokens.refreshToken,
  };
}

function slugify(value: string): string {
  const transliterated = value
    .toLowerCase()
    .replace(/o['‘’`]g/g, "og")
    .replace(/g['‘’`]/g, "g")
    .replace(/sh/g, "sh")
    .replace(/ch/g, "ch")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return transliterated || "markaz";
}

async function availableSlug(centerName: string): Promise<string> {
  const base = slugify(centerName);
  let candidate = base;
  let suffix = 2;
  while (await authRepository.centerSlugExists(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export async function register(input: RegisterCenterBody): Promise<AuthSession> {
  if (await authRepository.loginExists(input.login)) {
    throw new AppError(409, "Login band", API_ERROR_CODES.VALIDATION_ERROR, {
      issues: [{ path: "login", message: "Bu login band" }],
    });
  }
  const user = await authRepository.createRegistration({
    centerName: input.centerName,
    centerSlug: await availableSlug(input.centerName),
    fullName: input.fullName,
    login: input.login,
    passwordHash: await bcrypt.hash(input.password, 12),
  });
  if (!user) throw new AppError(500, "Foydalanuvchi yaratilmadi", API_ERROR_CODES.INTERNAL_ERROR);
  return createSession(user);
}

export async function login(input: LoginBody): Promise<AuthSession> {
  const verified = await passwordStrategy.verify(input);
  const user = await authRepository.findUserWithMemberships(verified.id);
  if (!user) {
    throw new AppError(401, "Login yoki parol noto'g'ri", API_ERROR_CODES.INVALID_CREDENTIALS);
  }
  return createSession(user);
}

export async function refresh(refreshToken: string | undefined): Promise<AuthSession> {
  if (!refreshToken) {
    throw new AppError(401, "Refresh token topilmadi", API_ERROR_CODES.UNAUTHORIZED);
  }
  const rotated = await tokenService.rotateRefreshToken(refreshToken);
  const user = await authRepository.findUserWithMemberships(rotated.userId);
  if (!user) throw new AppError(401, "Sessiya yaroqsiz", API_ERROR_CODES.UNAUTHORIZED);
  const current = selectMembership(user, rotated.centerId);
  return {
    body: {
      accessToken: tokenService.createAccessToken(
        user,
        current ? { centerId: current.centerId, role: current.role } : undefined,
      ),
      user: summarizeUser(user),
      memberships: user.memberships.map(summarizeMembership),
      currentMembership: current ? summarizeMembership(current) : null,
    },
    refreshToken: rotated.refreshToken,
  };
}

export function logout(refreshToken: string | undefined): Promise<void> {
  return tokenService.revokeRefreshToken(refreshToken);
}

export async function selectCenter(userId: string, input: SelectCenterBody): Promise<AuthSession> {
  const membership = await authRepository.findActiveMembership(userId, input.centerId);
  if (!membership) {
    throw new AppError(403, "Bu markazga kirish ruxsati yo'q", API_ERROR_CODES.FORBIDDEN);
  }
  const user = await authRepository.findUserWithMemberships(userId);
  if (!user) throw new AppError(401, "Foydalanuvchi topilmadi", API_ERROR_CODES.UNAUTHORIZED);
  return createSession(user, membership.centerId);
}

export async function changePassword(userId: string, input: ChangePasswordBody): Promise<void> {
  const user = await authRepository.findUserCredentialsById(userId);
  if (!user?.passwordHash || !(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
    throw new AppError(401, "Joriy parol noto'g'ri", API_ERROR_CODES.INVALID_CREDENTIALS);
  }
  await authRepository.updatePassword(userId, await bcrypt.hash(input.newPassword, 12));
}
