import { asyncHandler } from "../../lib/asyncHandler.js";
import * as interviewService from "./interview.service.js";

export const getSkills = asyncHandler(async (req, res) => {
  res.json(await interviewService.getSkills(req.centerId!, req.user!.id));
});

export const getTracks = asyncHandler(async (req, res) => {
  res.json(await interviewService.getTracks(req.centerId!, req.user!.id));
});

export const listSessions = asyncHandler(async (req, res) => {
  res.json(await interviewService.listSessions(req.centerId!, req.user!.id));
});

export const startInterview = asyncHandler(async (req, res) => {
  res
    .status(201)
    .json(await interviewService.startInterview(req.centerId!, req.user!.id, req.body));
});

export const getSession = asyncHandler(async (req, res) => {
  res.json(await interviewService.getSession(req.centerId!, req.user!.id, req.params.sessionId!));
});

export const answerInterview = asyncHandler(async (req, res) => {
  res.json(
    await interviewService.answerInterview(
      req.centerId!,
      req.user!.id,
      req.params.sessionId!,
      req.body,
    ),
  );
});

export const abandonInterview = asyncHandler(async (req, res) => {
  res.json(
    await interviewService.abandonInterview(req.centerId!, req.user!.id, req.params.sessionId!),
  );
});
