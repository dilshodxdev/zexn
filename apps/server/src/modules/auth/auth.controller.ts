import type { CookieOptions, Request } from "express";
import { isProd } from "../../config/env.js";
import { AppError } from "../../lib/AppError.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import { API_ERROR_CODES } from "@zexn/shared";
import * as authService from "./auth.service.js";

const REFRESH_COOKIE = "refreshToken";
const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/api/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/api/auth",
};

function getRefreshCookie(req: Request): string | undefined {
  const value: unknown = req.cookies?.[REFRESH_COOKIE];
  return typeof value === "string" ? value : undefined;
}

function requireUserId(req: Request): string {
  if (!req.user) {
    throw new AppError(401, "Avtorizatsiya talab qilinadi", API_ERROR_CODES.UNAUTHORIZED);
  }
  return req.user.id;
}

export const register = asyncHandler(async (req, res) => {
  const session = await authService.register(req.body);
  res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions);
  res.status(201).json(session.body);
});

export const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions);
  res.json(session.body);
});

export const refresh = asyncHandler(async (req, res) => {
  const session = await authService.refresh(getRefreshCookie(req));
  res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions);
  res.json(session.body);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(getRefreshCookie(req));
  res.clearCookie(REFRESH_COOKIE, clearCookieOptions);
  res.status(204).send();
});

export const selectCenter = asyncHandler(async (req, res) => {
  const session = await authService.selectCenter(requireUserId(req), req.body);
  res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOptions);
  res.json(session.body);
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(requireUserId(req), req.body);
  res.status(204).send();
});
