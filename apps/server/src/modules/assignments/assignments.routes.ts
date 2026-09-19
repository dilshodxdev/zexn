import { Router } from "express";
import {
  assignmentParamsSchema,
  createAssignmentBodySchema,
  reviewSubmissionBodySchema,
  saveSubmissionBodySchema,
  submissionParamsSchema,
  submitAssignmentBodySchema,
  updateAssignmentBodySchema,
} from "@zexn/shared";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { requireTenant } from "../../middleware/tenant.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./assignments.controller.js";

export const assignmentsRouter = Router();

assignmentsRouter.use(requireAuth, requireTenant, requireRole("TEACHER", "CENTER_ADMIN"));
assignmentsRouter.get("/topics", validate({}), controller.getTopics);
assignmentsRouter.get("/", validate({}), controller.getAssignments);
assignmentsRouter.post(
  "/",
  validate({ body: createAssignmentBodySchema }),
  controller.createAssignment,
);
assignmentsRouter.patch(
  "/:assignmentId",
  validate({ params: assignmentParamsSchema, body: updateAssignmentBodySchema }),
  controller.updateAssignment,
);
assignmentsRouter.get(
  "/:assignmentId/submissions/:studentId",
  validate({ params: submissionParamsSchema }),
  controller.getSubmission,
);
assignmentsRouter.post(
  "/:assignmentId/submissions/:studentId/review",
  validate({ params: submissionParamsSchema, body: reviewSubmissionBodySchema }),
  controller.reviewSubmission,
);
assignmentsRouter.get(
  "/:assignmentId",
  validate({ params: assignmentParamsSchema }),
  controller.getManageDetail,
);

export const studentAssignmentsRouter = Router();

studentAssignmentsRouter.get("/", validate({}), controller.getStudentAssignments);
studentAssignmentsRouter.get(
  "/:assignmentId",
  validate({ params: assignmentParamsSchema }),
  controller.getStudentDetail,
);
studentAssignmentsRouter.post(
  "/:assignmentId/start",
  validate({ params: assignmentParamsSchema }),
  controller.startAssignment,
);
studentAssignmentsRouter.patch(
  "/:assignmentId/submission",
  validate({ params: assignmentParamsSchema, body: saveSubmissionBodySchema }),
  controller.saveSubmission,
);
studentAssignmentsRouter.post(
  "/:assignmentId/submit",
  validate({ params: assignmentParamsSchema, body: submitAssignmentBodySchema }),
  controller.submitAssignment,
);
