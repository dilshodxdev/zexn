import { asyncHandler } from "../../lib/asyncHandler.js";
import * as attemptService from "./attempt.service.js";

export const submitAttempt = asyncHandler(async (req, res) => {
  const result = await attemptService.submitAttempt(
    req.centerId!,
    req.user!.id,
    req.params.testId!,
    req.body,
  );
  res.status(201).json(result);
});
