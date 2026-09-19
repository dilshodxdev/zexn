import { Router } from "express";
import { testAiPromptBodySchema, updateAiSettingsBodySchema } from "@zexn/shared";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { requireTenant } from "../../middleware/tenant.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./settings.controller.js";

export const settingsRouter = Router();

settingsRouter.use(requireAuth, requireTenant, requireRole("TEACHER", "CENTER_ADMIN"));
settingsRouter.get("/ai", controller.getAiSettings);
settingsRouter.put(
  "/ai",
  validate({ body: updateAiSettingsBodySchema }),
  controller.updateAiSettings,
);
settingsRouter.post(
  "/ai/test",
  validate({ body: testAiPromptBodySchema }),
  controller.testAiPrompt,
);
