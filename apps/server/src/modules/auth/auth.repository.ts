import type { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

const activeMemberships = {
  where: { isActive: true, center: { isActive: true } },
  include: { center: true },
  orderBy: { createdAt: "asc" },
} satisfies Prisma.MembershipFindManyArgs;

export function findUserCredentials(login: string) {
  return prisma.user.findUnique({ where: { login } });
}

export function findUserCredentialsById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export function findUserWithMemberships(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: activeMemberships },
  });
}

export function findUserAuthState(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, mustChangePassword: true },
  });
}

export async function loginExists(login: string): Promise<boolean> {
  return (await prisma.user.count({ where: { login } })) > 0;
}

export async function centerSlugExists(slug: string): Promise<boolean> {
  return (await prisma.center.count({ where: { slug } })) > 0;
}

export async function createRegistration(data: {
  centerName: string;
  centerSlug: string;
  fullName: string;
  login: string;
  passwordHash: string;
}) {
  const userId = await prisma.$transaction(async (tx) => {
    const center = await tx.center.create({
      data: { name: data.centerName, slug: data.centerSlug },
    });
    const user = await tx.user.create({
      data: {
        fullName: data.fullName,
        login: data.login,
        passwordHash: data.passwordHash,
        mustChangePassword: false,
      },
    });
    await tx.membership.create({
      data: { userId: user.id, centerId: center.id, role: "CENTER_ADMIN" },
    });
    return user.id;
  });
  return findUserWithMemberships(userId);
}

export function findActiveMembership(userId: string, centerId: string) {
  return prisma.membership.findFirst({
    where: { userId, centerId, isActive: true, center: { isActive: true } },
    include: { center: true },
  });
}

export function updatePassword(userId: string, passwordHash: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash, mustChangePassword: false },
  });
}

export function createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date }) {
  return prisma.refreshToken.create({ data });
}

export function findRefreshTokenByHash(tokenHash: string) {
  return prisma.refreshToken.findUnique({ where: { tokenHash } });
}

export async function replaceRefreshToken(
  oldTokenId: string,
  data: { userId: string; tokenHash: string; expiresAt: Date },
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshToken.updateMany({
      where: { id: oldTokenId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (revoked.count !== 1) return false;
    await tx.refreshToken.create({ data });
    return true;
  });
}

export function revokeRefreshTokenByHash(tokenHash: string) {
  return prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
