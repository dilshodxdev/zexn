import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { API_ERROR_CODES, type ApiErrorBody } from "@zexn/shared";
import { AppError } from "../lib/AppError.js";
import { isProd } from "../config/env.js";

/**
 * Barcha xatolar bitta formatga: { error: { message, code?, meta? } }.
 * Express xato middleware'ni 4 ta argument bo'yicha taniydi - `_next` olib tashlanmasin.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let body: ApiErrorBody = {
    error: { message: "Serverda kutilmagan xato", code: API_ERROR_CODES.INTERNAL_ERROR },
  };

  if (err instanceof AppError) {
    status = err.statusCode;
    body = { error: { message: err.message, code: err.code, meta: err.meta } };
  } else if (err instanceof ZodError) {
    // validate() dan tashqarida (masalan service ichida) parse qilinsa ham bir xil format
    status = 400;
    body = {
      error: {
        message: "So'rov ma'lumotlari noto'g'ri",
        code: API_ERROR_CODES.VALIDATION_ERROR,
        meta: { issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      },
    };
  } else if (err instanceof SyntaxError && "body" in err) {
    // express.json() buzilgan JSON'da SyntaxError tashlaydi
    status = 400;
    body = { error: { message: "JSON noto'g'ri", code: API_ERROR_CODES.VALIDATION_ERROR } };
  }

  if (status >= 500) {
    console.error(err);
  } else if (!isProd) {
    // 4xx kutilgan xato: dev'da bir qator yetadi, stack shovqin bo'ladi
    console.warn(`[${status}] ${body.error.code ?? ""} ${body.error.message}`);
  }
  res.status(status).json(body);
};
