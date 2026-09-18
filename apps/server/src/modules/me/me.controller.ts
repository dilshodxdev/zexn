import { API_ERROR_CODES } from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import { asyncHandler } from "../../lib/asyncHandler.js";
import * as meService from "./me.service.js";

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError(401, "Avtorizatsiya talab qilinadi", API_ERROR_CODES.UNAUTHORIZED);
  }
  res.json(await meService.getMe(req.user));
});
