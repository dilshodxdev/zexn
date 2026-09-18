import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { API_ERROR_CODES } from "@zexn/shared";
import { env, isProd } from "./config/env.js";
import { AppError } from "./lib/AppError.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { healthRouter } from "./modules/health/health.routes.js";
import { apiRouter } from "./modules/index.js";

/**
 * Express ilovasi. index.ts dan ajratilgan: testlarda app'ni port ochmasdan
 * (supertest bilan) ishlatish mumkin.
 */
export function createApp() {
  const app = express();

  // Nginx/proxy ortida real IP va protokolni to'g'ri o'qish uchun
  app.set("trust proxy", 1);

  const allowedOrigins = new Set(env.CLIENT_ORIGIN);
  if (!isProd) {
    allowedOrigins.add("http://localhost:5173");
    allowedOrigins.add("http://127.0.0.1:5173");
  }
  app.use(
    cors({
      // origin yo'q (curl, server-to-server) -> ruxsat; bor -> faqat ro'yxatdagilar
      origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // TODO(rate-limit): public auth endpointlariga production rate limit qo'shish.

  app.use("/health", healthRouter);
  app.use("/api", apiRouter);

  // Hech qaysi route mos kelmadi
  app.use((req, _res, next) => {
    next(
      new AppError(
        404,
        "Yo'l topilmadi: " + req.method + " " + req.path,
        API_ERROR_CODES.NOT_FOUND,
      ),
    );
  });

  app.use(errorHandler);
  return app;
}
