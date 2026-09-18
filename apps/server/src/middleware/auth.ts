import type { Request, RequestHandler } from "express";
import { API_ERROR_CODES, type Role } from "@zexn/shared";
import { AppError } from "../lib/AppError.js";
import * as authRepository from "../modules/auth/auth.repository.js";
import * as tokenService from "../modules/auth/token.service.js";

function isChangePasswordRequest(req: Request): boolean {
  return `${req.baseUrl}${req.path}` === "/api/auth/change-password";
}

async function authenticate(req: Request): Promise<void> {
  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "Avtorizatsiya talab qilinadi", API_ERROR_CODES.UNAUTHORIZED);
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new AppError(401, "Avtorizatsiya talab qilinadi", API_ERROR_CODES.UNAUTHORIZED);
  }

  const payload = tokenService.verifyAccessToken(token);
  const authState = await authRepository.findUserAuthState(payload.sub);
  if (!authState) {
    throw new AppError(401, "Foydalanuvchi topilmadi", API_ERROR_CODES.UNAUTHORIZED);
  }
  if (authState.mustChangePassword && !isChangePasswordRequest(req)) {
    throw new AppError(403, "Parolni almashtirish talab qilinadi", API_ERROR_CODES.FORBIDDEN, {
      reason: "PASSWORD_CHANGE_REQUIRED",
    });
  }
  req.user = {
    id: payload.sub,
    isSuperAdmin: payload.isSuperAdmin,
    ...(payload.membership ? { membership: payload.membership } : {}),
  };
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  authenticate(req).then(() => next(), next);
};

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError(401, "Avtorizatsiya talab qilinadi", API_ERROR_CODES.UNAUTHORIZED));
    }
    if (req.user.isSuperAdmin) return next();
    if (!req.user.membership || !roles.includes(req.user.membership.role)) {
      return next(new AppError(403, "Ruxsat yetarli emas", API_ERROR_CODES.FORBIDDEN));
    }
    next();
  };
}
