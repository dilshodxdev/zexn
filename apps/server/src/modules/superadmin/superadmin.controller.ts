import { asyncHandler } from "../../lib/asyncHandler.js";
import * as superadminService from "./superadmin.service.js";

export const getAiSettings = asyncHandler(async (_req, res) => {
  res.json(await superadminService.getPlatformSettings());
});

export const updateAiSettings = asyncHandler(async (req, res) => {
  res.json(await superadminService.updatePlatformSettings(req.user!.id, req.body));
});

export const testAiPrompt = asyncHandler(async (req, res) => {
  res.json(await superadminService.testPlatformPrompt(req.user!.id, req.body));
});

export const getOverview = asyncHandler(async (_req, res) => {
  res.json(await superadminService.getOverview());
});
