// Tartib muhim: ESM importlar yozilgan tartibda bajariladi.
// 1) .env yuklanadi  2) env.ts tekshiradi (xato bo'lsa shu yerda yiqiladi)  3) app ko'tariladi
import "./config/dotenv.js";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[zexn-server] ${env.NODE_ENV} rejimida http://localhost:${env.PORT} da ishlayapti`);
});

// Docker `stop` SIGTERM yuboradi: ochiq so'rovlarni tugatib, DB ulanishini yopamiz.
async function shutdown(signal: string) {
  console.log(`[zexn-server] ${signal} qabul qilindi, to'xtatilmoqda...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // 10 soniyada yopilmasa majburan
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
