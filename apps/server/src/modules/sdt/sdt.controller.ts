import { asyncHandler } from "../../lib/asyncHandler.js";
import * as interviewService from "../interview/interview.service.js";
import * as sdtService from "./sdt.service.js";

export const getDigitalTwin = asyncHandler(async (req, res) => {
  res.json(await sdtService.getDigitalTwin(req.centerId!, req.params.studentId!));
});

export const getProgress = asyncHandler(async (req, res) => {
  res.json(await sdtService.getProgress(req.centerId!, req.params.studentId!));
});

export const getStudentInterviews = asyncHandler(async (req, res) => {
  res.json(
    await interviewService.listStudentSessionsForTeacher(req.centerId!, req.params.studentId!),
  );
});

export const getClassDigitalTwin = asyncHandler(async (req, res) => {
  res.json(await sdtService.getClassDigitalTwin(req.centerId!));
});

export const createNextStep = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(await sdtService.createNextStep(req.centerId!, req.params.studentId!, req.body));
});

export const assignNextStep = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(
      await sdtService.assignNextStep(
        req.centerId!,
        req.params.studentId!,
        req.params.nextStepId!,
        req.user!.id,
        req.body,
      ),
    );
});

export const sendTeacherNote = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(await sdtService.sendTeacherNote(req.centerId!, req.params.studentId!, req.body));
});
