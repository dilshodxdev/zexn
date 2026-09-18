// Dev seed: bitta markaz + super admin + har roldan bittadan foydalanuvchi.
// Parollar 2-bosqichda (bcrypt) qo'shiladi; hozir passwordHash bo'sh, mustChangePassword = true.
// Ishga tushirish: pnpm --filter @zexn/server exec prisma db seed
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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
      update: {},
      create: {
        login: u.login,
        fullName: u.fullName,
        isSuperAdmin: u.isSuperAdmin ?? false,
        mustChangePassword: true,
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
