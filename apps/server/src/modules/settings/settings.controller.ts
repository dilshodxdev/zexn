import { asyncHandler } from "../../lib/asyncHandler.js";
import * as settingsService from "./settings.service.js";

export const getAiSettings = asyncHandler(async (req, res) => {
  res.json(await settingsService.getCenterSettings(req.centerId!));
});

export const updateAiSettings = asyncHandler(async (req, res) => {
  res.json(await settingsService.updateCenterSettings(req.centerId!, req.user!.id, req.body));
});

export const testAiPrompt = asyncHandler(async (req, res) => {
  res.json(await settingsService.testCenterPrompt(req.user!.id, req.body));
});
