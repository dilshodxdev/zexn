import { Router } from "express";
import { assignmentsRouter } from "./assignments/assignments.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { meRouter } from "./me/me.routes.js";
import { sdtRouter } from "./sdt/sdt.routes.js";
import { settingsRouter } from "./settings/settings.routes.js";
import { studentRouter } from "./student/student.routes.js";
import { superadminRouter } from "./superadmin/superadmin.routes.js";

/**
 * /api prefiksi ostidagi barcha modullar shu yerga ulanadi.
 * Masalan: apiRouter.use("/auth", authRouter);
 * /health prefikssiz, app.ts da alohida.
 */
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/assignments", assignmentsRouter);
apiRouter.use("/me", meRouter);
apiRouter.use("/digital-twin", sdtRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/student", studentRouter);
apiRouter.use("/superadmin", superadminRouter);

apiRouter.get("/", (_req, res) => {
  res.json({ name: "zexn-api", version: "0.1.0" });
});
