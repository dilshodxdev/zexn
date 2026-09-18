import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { API_ERROR_CODES } from "@zexn/shared";
import { AppError } from "../lib/AppError.js";

type Part = "body" | "query" | "params";
type Schemas = Partial<Record<Part, ZodTypeAny>>;

/**
 * validate({ body: schema, query: schema, params: schema })
 * Schemalar @zexn/shared dan olinadi. Muvaffaqiyatli parse natijasi req[part] ga qayta yoziladi -
 * shuning uchun controller'da coerce/default qilingan qiymatlar tayyor keladi.
 *
 * Xato bo'lsa: 400 VALIDATION_ERROR, meta.issues ichida qaysi maydon nima uchun.
 */
export function validate(schemas: Schemas): RequestHandler {
  return (req, _res, next) => {
    for (const part of ["body", "query", "params"] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        return next(
          new AppError(400, "So'rov ma'lumotlari noto'g'ri", API_ERROR_CODES.VALIDATION_ERROR, {
            part,
            issues: result.error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          }),
        );
      }
      req[part] = result.data;
    }
    next();
  };
}
