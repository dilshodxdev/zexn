import { asyncHandler } from "../../lib/asyncHandler.js";
import * as assignmentService from "./assignments.service.js";

export const getTopics = asyncHandler(async (_req, res) => {
  res.json(await assignmentService.getTopics());
});

export const getAssignments = asyncHandler(async (req, res) => {
  res.json(await assignmentService.getAssignments(req.centerId!));
});

export const createAssignment = asyncHandler(async (req, res) => {
  const result = await assignmentService.createAssignment(req.centerId!, req.user!.id, req.body);
  res.status(201).json(result);
});

export const updateAssignment = asyncHandler(async (req, res) => {
  res.json(
    await assignmentService.updateAssignment(req.centerId!, req.params.assignmentId!, req.body),
  );
});

export const getManageDetail = asyncHandler(async (req, res) => {
  res.json(await assignmentService.getManageDetail(req.centerId!, req.params.assignmentId!));
});

export const getSubmission = asyncHandler(async (req, res) => {
  res.json(
    await assignmentService.getSubmission(
      req.centerId!,
      req.params.assignmentId!,
      req.params.studentId!,
    ),
  );
});

export const reviewSubmission = asyncHandler(async (req, res) => {
  res.json(
    await assignmentService.reviewSubmission(
      req.centerId!,
      req.params.assignmentId!,
      req.params.studentId!,
      req.user!.id,
      req.body,
    ),
  );
});

export const getStudentAssignments = asyncHandler(async (req, res) => {
  res.json(await assignmentService.getStudentAssignments(req.centerId!, req.user!.id));
});

export const getStudentDetail = asyncHandler(async (req, res) => {
  res.json(
    await assignmentService.getStudentDetail(req.centerId!, req.user!.id, req.params.assignmentId!),
  );
});

export const startAssignment = asyncHandler(async (req, res) => {
  res.json(
    await assignmentService.startAssignment(req.centerId!, req.user!.id, req.params.assignmentId!),
  );
});

export const saveSubmission = asyncHandler(async (req, res) => {
  res.json(
    await assignmentService.saveSubmission(
      req.centerId!,
      req.user!.id,
      req.params.assignmentId!,
      req.body,
    ),
  );
});

export const submitAssignment = asyncHandler(async (req, res) => {
  res.json(
    await assignmentService.submitAssignment(
      req.centerId!,
      req.user!.id,
      req.params.assignmentId!,
      req.body,
    ),
  );
});
