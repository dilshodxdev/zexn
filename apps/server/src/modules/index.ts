import { Router } from "express";
import { authRouter } from "./auth/auth.routes.js";
import { meRouter } from "./me/me.routes.js";

/**
 * /api prefiksi ostidagi barcha modullar shu yerga ulanadi.
 * Masalan: apiRouter.use("/auth", authRouter);
 * /health prefikssiz, app.ts da alohida.
 */
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/me", meRouter);

apiRouter.get("/", (_req, res) => {
  res.json({ name: "zexn-api", version: "0.1.0" });
});
