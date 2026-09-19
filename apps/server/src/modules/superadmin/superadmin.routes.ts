import { Router } from "express";
import { testAiPromptBodySchema, updateAiSettingsBodySchema } from "@zexn/shared";
import { requireAuth, requireSuperAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./superadmin.controller.js";

export const superadminRouter = Router();

superadminRouter.use(requireAuth, requireSuperAdmin);
superadminRouter.get("/overview", controller.getOverview);
superadminRouter.get("/settings/ai", controller.getAiSettings);
superadminRouter.put(
  "/settings/ai",
  validate({ body: updateAiSettingsBodySchema }),
  controller.updateAiSettings,
);
superadminRouter.post(
  "/settings/ai/test",
  validate({ body: testAiPromptBodySchema }),
  controller.testAiPrompt,
);
