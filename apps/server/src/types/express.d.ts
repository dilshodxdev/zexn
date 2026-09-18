import type { Role } from "@zexn/shared";

/**
 * Express Request'ga o'z maydonlarimizni qo'shamiz (declaration merging).
 * Bu fayl faqat type - runtime'da hech narsa yo'q. auth/tenant middleware to'ldiradi.
 */
declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      isSuperAdmin: boolean;
      /** JWT'dagi joriy membership: qaysi markazda, qaysi rolda */
      membership?: { centerId: string; role: Role };
    }

    interface Request {
      user?: AuthUser;
      /** Tenant middleware o'rnatadi. Faqat JWT dan, hech qachon body/query dan emas. */
      centerId?: string;
    }
  }
}

export {};
