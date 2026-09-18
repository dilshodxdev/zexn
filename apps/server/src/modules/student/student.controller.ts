import { asyncHandler } from "../../lib/asyncHandler.js";
import * as studentService from "./student.service.js";

export const getOverview = asyncHandler(async (req, res) => {
  res.json(await studentService.getOverview(req.centerId!, req.user!.id));
});

export const getTopic = asyncHandler(async (req, res) => {
  res.json(await studentService.getTopic(req.centerId!, req.user!.id, req.params.topicId!));
});

export const getTests = asyncHandler(async (req, res) => {
  res.json(await studentService.getTests(req.centerId!, req.user!.id));
});

export const getTest = asyncHandler(async (req, res) => {
  res.json(await studentService.getTest(req.params.testId!));
});
