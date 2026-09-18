import { prisma } from "../../lib/prisma.js";

export function findMe(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        where: { isActive: true, center: { isActive: true } },
        include: { center: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
