import { Router } from "express";
import { submitAttemptBodySchema, testParamsSchema, topicParamsSchema } from "@zexn/shared";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { requireTenant } from "../../middleware/tenant.js";
import { validate } from "../../middleware/validate.js";
import * as attemptController from "./attempt.controller.js";
import * as controller from "./student.controller.js";

export const studentRouter = Router();

studentRouter.use(requireAuth, requireTenant, requireRole("STUDENT"));
studentRouter.get("/overview", validate({}), controller.getOverview);
studentRouter.get("/topics/:topicId", validate({ params: topicParamsSchema }), controller.getTopic);
studentRouter.get("/tests", validate({}), controller.getTests);
studentRouter.get("/tests/:testId", validate({ params: testParamsSchema }), controller.getTest);
studentRouter.post(
  "/tests/:testId/attempts",
  validate({ params: testParamsSchema, body: submitAttemptBodySchema }),
  attemptController.submitAttempt,
);
