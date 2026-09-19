import { Router } from "express";
import {
  answerInterviewBodySchema,
  interviewParamsSchema,
  startInterviewBodySchema,
} from "@zexn/shared";
import { validate } from "../../middleware/validate.js";
import * as controller from "./interview.controller.js";

export const interviewRouter = Router();

interviewRouter.get("/tracks", controller.getTracks);
interviewRouter.get("/skills", controller.getSkills);
interviewRouter.get("/", controller.listSessions);
interviewRouter.post("/", validate({ body: startInterviewBodySchema }), controller.startInterview);
interviewRouter.get(
  "/:sessionId",
  validate({ params: interviewParamsSchema }),
  controller.getSession,
);
interviewRouter.post(
  "/:sessionId/answer",
  validate({ params: interviewParamsSchema, body: answerInterviewBodySchema }),
  controller.answerInterview,
);
interviewRouter.post(
  "/:sessionId/abandon",
  validate({ params: interviewParamsSchema }),
  controller.abandonInterview,
);
