// Dev seed: bitta markaz + super admin + har roldan bittadan foydalanuvchi.
// SEED_DEV_PASSWORDS=true bo'lsa namuna parol bcrypt bilan yoziladi.
// Ishga tushirish: pnpm --filter @zexn/server exec prisma db seed
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const seedDevPasswords = process.env.SEED_DEV_PASSWORDS === "true";
  const center = await prisma.center.upsert({
    where: { slug: "itpark-xorazm" },
    update: {},
    create: { name: "IT Park Xorazm", slug: "itpark-xorazm" },
  });

  const users: Array<{
    login: string;
    password: string;
    fullName: string;
    mustChangePassword: boolean;
    role?: Role;
    isSuperAdmin?: boolean;
  }> = [
    {
      login: "superadmin",
      password: "superadmin",
      fullName: "ZEXN Super Admin",
      mustChangePassword: false,
      isSuperAdmin: true,
    },
    {
      login: "admin",
      password: "admin",
      fullName: "Markaz Admini",
      mustChangePassword: false,
      role: Role.CENTER_ADMIN,
    },
    {
      login: "teacher",
      password: "teacher",
      fullName: "Oqituvchi Namuna",
      mustChangePassword: false,
      role: Role.TEACHER,
    },
    {
      login: "student",
      password: "student",
      fullName: "Oquvchi Namuna",
      mustChangePassword: false,
      role: Role.STUDENT,
    },
    {
      login: "newstudent",
      password: "temp1234",
      fullName: "Yangi Oquvchi",
      mustChangePassword: true,
      role: Role.STUDENT,
    },
  ];

  for (const u of users) {
    const passwordHash = seedDevPasswords ? await bcrypt.hash(u.password, 12) : undefined;
    const user = await prisma.user.upsert({
      where: { login: u.login },
      update: passwordHash ? { passwordHash, mustChangePassword: u.mustChangePassword } : {},
      create: {
        login: u.login,
        fullName: u.fullName,
        isSuperAdmin: u.isSuperAdmin ?? false,
        mustChangePassword: seedDevPasswords ? u.mustChangePassword : true,
        passwordHash,
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
