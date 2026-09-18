import type { RequestHandler } from "express";
import { API_ERROR_CODES } from "@zexn/shared";
import { AppError } from "../lib/AppError.js";

/**
 * req.centerId ni o'rnatadi. FAQAT req.user.membership (JWT) dan.
 * Hech qachon body/query/params dan olinmaydi - bu eng kritik xavfsizlik nuqtasi.
 * requireAuth dan KEYIN ulanadi.
 */
export const requireTenant: RequestHandler = (req, _res, next) => {
  const centerId = req.user?.membership?.centerId;
  if (!centerId) {
    return next(new AppError(403, "Markaz tanlanmagan", API_ERROR_CODES.TENANT_REQUIRED));
  }
  req.centerId = centerId;
  next();
};
