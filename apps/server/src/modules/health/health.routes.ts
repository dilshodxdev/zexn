import { Router } from "express";
import * as controller from "./health.controller.js";

/**
 * Namuna modul. Yangi modul uchun shu fayllarni nusxa oling:
 *   <nom>.routes.ts     - Router + validate(schema) + controller
 *   <nom>.controller.ts - asyncHandler(async (req, res) => ...)
 *   <nom>.service.ts    - biznes mantiq, AppError tashlaydi
 *   <nom>.repository.ts - faqat Prisma (health: pingDb)
 */
export const healthRouter = Router();

healthRouter.get("/", controller.getHealth);
