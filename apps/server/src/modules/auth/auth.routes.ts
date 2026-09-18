import { Router } from "express";
import {
  changePasswordBodySchema,
  loginBodySchema,
  registerCenterBodySchema,
  selectCenterBodySchema,
} from "@zexn/shared";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerCenterBodySchema }), controller.register);
authRouter.post("/login", validate({ body: loginBodySchema }), controller.login);
authRouter.post("/refresh", validate({}), controller.refresh);
authRouter.post("/logout", validate({}), controller.logout);
authRouter.post(
  "/select-center",
  requireAuth,
  validate({ body: selectCenterBodySchema }),
  controller.selectCenter,
);
authRouter.post(
  "/change-password",
  requireAuth,
  validate({ body: changePasswordBodySchema }),
  controller.changePassword,
);
