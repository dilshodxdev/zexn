import type { RequestHandler } from "express";
import { API_ERROR_CODES } from "@zexn/shared";
import { AppError } from "../lib/AppError.js";

/**
 * 2-BOSQICH STUB. JWT tekshiruvi hali yo'q.
 * Default YOPIQ: hozir har so'rovni 401 bilan qaytaradi. Ochiq stub qoldirish xavfsizlik teshigi.
 *
 * 2-bosqichda: Authorization: Bearer <access> -> verify -> req.user = { id, isSuperAdmin, membership }.
 * Rejalashtirilgan interfeys: docs/03-auth.md (2-bosqichda yoziladi).
 */
export const requireAuth: RequestHandler = (_req, _res, next) => {
  next(new AppError(401, "Avtorizatsiya talab qilinadi", API_ERROR_CODES.UNAUTHORIZED));
};
