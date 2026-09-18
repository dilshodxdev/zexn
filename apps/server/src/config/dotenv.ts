import { config } from "dotenv";
import path from "node:path";

/**
 * .env ni yuklaydi. Birinchi bo'lib import qilinadi (index.ts), shundan keyin env.ts ishlaydi.
 * Ikki joydan qidiradi: apps/server/.env (bo'lsa) va repo root/.env. Mavjud process.env
 * ustidan yozmaydi - Docker'da compose bergan qiymatlar ustun.
 */
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), "../../.env") });
