import { Router } from "express";

/**
 * /api prefiksi ostidagi barcha modullar shu yerga ulanadi.
 * Masalan: apiRouter.use("/auth", authRouter);
 * /health prefikssiz, app.ts da alohida.
 */
export const apiRouter = Router();

apiRouter.get("/", (_req, res) => {
  res.json({ name: "zexn-api", version: "0.1.0" });
});
