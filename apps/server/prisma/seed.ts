// Dev seed: bitta markaz + super admin + har roldan bittadan foydalanuvchi.
// SEED_DEV_PASSWORDS=true bo'lsa namuna parol bcrypt bilan yoziladi.
// Ishga tushirish: pnpm --filter @zexn/server exec prisma db seed
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const seedDevPasswords = process.env.SEED_DEV_PASSWORDS === "true";
  const devPasswordHash = seedDevPasswords ? await bcrypt.hash("ZexnDev123!", 12) : undefined;
  const center = await prisma.center.upsert({
    where: { slug: "itpark-xorazm" },
    update: {},
    create: { name: "IT Park Xorazm", slug: "itpark-xorazm" },
  });

  const users: Array<{ login: string; fullName: string; role?: Role; isSuperAdmin?: boolean }> = [
    { login: "superadmin", fullName: "ZEXN Super Admin", isSuperAdmin: true },
    { login: "admin", fullName: "Markaz Admini", role: Role.CENTER_ADMIN },
    { login: "teacher", fullName: "Oqituvchi Namuna", role: Role.TEACHER },
    { login: "student", fullName: "Oquvchi Namuna", role: Role.STUDENT },
  ];

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { login: u.login },
      update: devPasswordHash ? { passwordHash: devPasswordHash, mustChangePassword: false } : {},
      create: {
        login: u.login,
        fullName: u.fullName,
        isSuperAdmin: u.isSuperAdmin ?? false,
        mustChangePassword: !devPasswordHash,
        passwordHash: devPasswordHash,
      },
    });
    if (u.role) {
      await prisma.membership.upsert({
        where: { userId_centerId: { userId: user.id, centerId: center.id } },
        update: { role: u.role },
        create: { userId: user.id, centerId: center.id, role: u.role },
      });
    }
  }

  console.log(`Seed tayyor: markaz "${center.name}", ${users.length} ta foydalanuvchi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
