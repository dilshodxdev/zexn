import { createHash, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import {
  API_ERROR_CODES,
  accessTokenPayloadSchema,
  type AccessTokenPayload,
  type Role,
} from "@zexn/shared";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/AppError.js";
import * as authRepository from "./auth.repository.js";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "30d";
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type MembershipClaim = { centerId: string; role: Role };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function unauthorized(message = "Sessiya yaroqsiz"): AppError {
  return new AppError(401, message, API_ERROR_CODES.UNAUTHORIZED);
}

export function createAccessToken(
  user: { id: string; isSuperAdmin: boolean },
  membership?: MembershipClaim,
): string {
  const payload: AccessTokenPayload = {
    sub: user.id,
    isSuperAdmin: user.isSuperAdmin,
    ...(membership ? { membership } : {}),
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

function createRefreshJwt(userId: string, centerId?: string): string {
  return jwt.sign(
    { sub: userId, type: "refresh", jti: randomUUID(), ...(centerId ? { centerId } : {}) },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TTL },
  );
}

function parseRefreshJwt(token: string): { userId: string; centerId?: string } {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string" ||
      decoded.type !== "refresh" ||
      (decoded.centerId !== undefined && typeof decoded.centerId !== "string")
    ) {
      throw unauthorized();
    }
    return {
      userId: decoded.sub,
      ...(typeof decoded.centerId === "string" ? { centerId: decoded.centerId } : {}),
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw unauthorized();
  }
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    return accessTokenPayloadSchema.parse(jwt.verify(token, env.JWT_ACCESS_SECRET));
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, "Access token muddati tugagan", API_ERROR_CODES.TOKEN_EXPIRED);
    }
    throw unauthorized("Access token yaroqsiz");
  }
}

export async function issueSession(
  user: { id: string; isSuperAdmin: boolean },
  membership?: MembershipClaim,
): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = createRefreshJwt(user.id, membership?.centerId);
  await authRepository.createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  return {
    accessToken: createAccessToken(user, membership),
    refreshToken,
  };
}

export async function rotateRefreshToken(token: string): Promise<{
  userId: string;
  centerId?: string;
  refreshToken: string;
}> {
  const claims = parseRefreshJwt(token);
  const stored = await authRepository.findRefreshTokenByHash(hashToken(token));
  if (
    !stored ||
    stored.userId !== claims.userId ||
    stored.revokedAt ||
    stored.expiresAt.getTime() <= Date.now()
  ) {
    throw unauthorized();
  }

  const refreshToken = createRefreshJwt(claims.userId, claims.centerId);
  const replaced = await authRepository.replaceRefreshToken(stored.id, {
    userId: claims.userId,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
  if (!replaced) throw unauthorized();
  return { ...claims, refreshToken };
}

export async function revokeRefreshToken(token: string | undefined): Promise<void> {
  if (!token) return;
  await authRepository.revokeRefreshTokenByHash(hashToken(token));
}
