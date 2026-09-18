import { asyncHandler } from "../../lib/asyncHandler.js";
import * as mentorService from "./mentor.service.js";

export const getMessages = asyncHandler(async (req, res) => {
  const limit = typeof req.query.limit === "string" ? Number(req.query.limit) : 50;
  res.json(await mentorService.getMessages(req.centerId!, req.user!.id, limit));
});

export const sendMessage = asyncHandler(async (req, res) => {
  res.json(await mentorService.sendMessage(req.centerId!, req.user!.id, req.body));
});

export const completeNextStep = asyncHandler(async (req, res) => {
  res.json(await mentorService.completeNextStep(req.centerId!, req.user!.id, req.params.id!));
});
