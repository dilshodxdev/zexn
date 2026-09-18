import { asyncHandler } from "../../lib/asyncHandler.js";
import * as healthService from "./health.service.js";

/** Controller faqat req/res. Mantiq service'da. */
export const getHealth = asyncHandler(async (_req, res) => {
  const result = await healthService.getHealth();
  // DB yotgan bo'lsa ham 200: server tirik. Monitoring `db` maydoniga qaraydi.
  res.json(result);
});
