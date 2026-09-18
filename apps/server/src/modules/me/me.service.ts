import { API_ERROR_CODES, type MeResponse } from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import * as meRepository from "./me.repository.js";

export async function getMe(user: Express.AuthUser): Promise<MeResponse> {
  const record = await meRepository.findMe(user.id);
  if (!record) {
    throw new AppError(404, "Foydalanuvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  const memberships = record.memberships.map((membership) => ({
    id: membership.id,
    centerId: membership.centerId,
    centerName: membership.center.name,
    centerSlug: membership.center.slug,
    role: membership.role,
  }));
  return {
    user: {
      id: record.id,
      fullName: record.fullName,
      login: record.login,
      isSuperAdmin: record.isSuperAdmin,
      mustChangePassword: record.mustChangePassword,
      hasTelegram: record.telegramId !== null,
    },
    memberships,
    currentMembership: user.membership
      ? (memberships.find((item) => item.centerId === user.membership?.centerId) ?? null)
      : null,
  };
}
