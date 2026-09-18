import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import * as controller from "./me.controller.js";

export const meRouter = Router();

meRouter.get("/", requireAuth, controller.getMe);
