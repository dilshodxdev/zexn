import { Router } from "express";
import {
  assignNextStepBodySchema,
  createTwinNextStepBodySchema,
  sendTwinNoteBodySchema,
  twinNextStepParamsSchema,
  twinParamsSchema,
} from "@zexn/shared";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { requireTenant } from "../../middleware/tenant.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./sdt.controller.js";

export const sdtRouter = Router();

sdtRouter.use(requireAuth, requireTenant, requireRole("TEACHER", "CENTER_ADMIN"));
sdtRouter.get("/class", controller.getClassDigitalTwin);
sdtRouter.post(
  "/:studentId/next-steps",
  validate({ params: twinParamsSchema, body: createTwinNextStepBodySchema }),
  controller.createNextStep,
);
sdtRouter.post(
  "/:studentId/next-steps/:nextStepId/assign",
  validate({ params: twinNextStepParamsSchema, body: assignNextStepBodySchema }),
  controller.assignNextStep,
);
sdtRouter.post(
  "/:studentId/notes",
  validate({ params: twinParamsSchema, body: sendTwinNoteBodySchema }),
  controller.sendTeacherNote,
);
sdtRouter.get(
  "/:studentId/interviews",
  validate({ params: twinParamsSchema }),
  controller.getStudentInterviews,
);
sdtRouter.get(
  "/:studentId/progress",
  validate({ params: twinParamsSchema }),
  controller.getProgress,
);
sdtRouter.get("/:studentId", validate({ params: twinParamsSchema }), controller.getDigitalTwin);
