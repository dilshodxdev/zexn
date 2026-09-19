import type { PrismaClient } from "@prisma/client";
import { ERROR_PATTERN_CODES, SKILL_KEYS } from "@zexn/shared";
import { generateNextSteps } from "../../src/modules/sdt/sdt.service.js";

const skills = [
  {
    key: "jsx",
    name: "JSX",
    slug: "jsx-va-markup",
    description: "JSX sintaksisi va markup ichidagi JavaScript ifodalari.",
    remediationTitle: "JSX asoslarini mustahkamlash",
    remediationDescription: "JSX atributlari va ifodalarini ishlatib kichik komponent tuzing.",
  },
  {
    key: "props",
    name: "Props",
    slug: "props",
    description: "Komponentlar orasida props orqali ma'lumot uzatish.",
    remediationTitle: "Props bilan ishlash",
    remediationDescription: "Ota komponentdan bola komponentga uch xil qiymat uzating.",
  },
  {
    key: "components",
    name: "Komponentlar",
    slug: "component-arxitekturasi",
    description: "Interfeysni qayta ishlatiladigan komponentlarga ajratish.",
    remediationTitle: "Komponentlarga ajratish",
    remediationDescription: "Berilgan interfeysni kamida uchta kichik komponentga ajrating.",
  },
  {
    key: "lists-keys",
    name: "Ro'yxatlar va key",
    slug: "royxatlar-va-key",
    description: "Ro'yxatlarni render qilish va barqaror key tanlash.",
    remediationTitle: "Barqaror key ishlatish",
    remediationDescription:
      "Ro'yxatni map bilan chiqaring va har elementga barqaror id key bering.",
  },
  {
    key: "conditional-rendering",
    name: "Shartli rendering",
    slug: "shartli-rendering",
    description: "Holatga qarab JSX elementlarini xavfsiz ko'rsatish.",
    remediationTitle: "Shartli renderingni tuzatish",
    remediationDescription: "Boolean shartlar bilan uchta ko'rinishni to'g'ri render qiling.",
  },
  {
    key: "state",
    name: "State",
    slug: "state-asoslari",
    description: "Komponent state'i va useState hookidan foydalanish.",
    remediationTitle: "State asoslari",
    remediationDescription: "useState bilan qiymat yarating va hodisa orqali yangilang.",
  },
  {
    key: "state-immutability",
    name: "State immutability",
    slug: "obyekt-massiv-state",
    description: "Obyekt va massiv state'ni mutatsiyasiz yangilash.",
    remediationTitle: "State ni immutable yangilash",
    remediationDescription:
      "Berilgan `user` obyektini to'g'ridan-to'g'ri o'zgartirmasdan, spread (`{...user, name}`) bilan yangi obyekt yaratib `setUser` ga bering. 3 ta holatni tuzating.",
  },
  {
    key: "events",
    name: "Hodisalar",
    slug: "interaktivlik",
    description: "Foydalanuvchi hodisalarini handlerlar bilan boshqarish.",
    remediationTitle: "Hodisa handlerlari",
    remediationDescription: "Click va input hodisalari uchun alohida handlerlar yozing.",
  },
  {
    key: "forms",
    name: "Formalar",
    slug: "formalar",
    description: "Controlled input va forma yuborishni boshqarish.",
    remediationTitle: "Controlled forma",
    remediationDescription: "Ikki inputli controlled forma yarating va submitni tekshiring.",
  },
  {
    key: "use-effect",
    name: "useEffect",
    slug: "effects",
    description: "Komponentni tashqi tizimlar bilan sinxronlash.",
    remediationTitle: "Effect bog'liqliklari",
    remediationDescription:
      "Effect ichidagi barcha reaktiv qiymatlarni dependency ro'yxatiga kiriting.",
  },
  {
    key: "api-fetching",
    name: "API so'rovlar",
    slug: "api-va-custom-hooklar",
    description: "API ma'lumotlarini yuklash va holatlarni boshqarish.",
    remediationTitle: "API holatlarini boshqarish",
    remediationDescription: "Loading, error va success holatlari bor so'rov komponentini tuzing.",
  },
  {
    key: "component-architecture",
    name: "Komponent arxitekturasi",
    slug: "state-flow",
    description: "State va mas'uliyatlarni komponentlar orasida to'g'ri taqsimlash.",
    remediationTitle: "State flow ni soddalashtirish",
    remediationDescription:
      "Umumiy stateni eng yaqin ota komponentga ko'taring va props bilan uzating.",
  },
] as const;

const dependencies = [
  ["props", "jsx"],
  ["components", "jsx"],
  ["lists-keys", "components"],
  ["conditional-rendering", "jsx"],
  ["state", "components"],
  ["state-immutability", "state"],
  ["events", "state"],
  ["forms", "events"],
  ["use-effect", "state"],
  ["api-fetching", "use-effect"],
  ["component-architecture", "props"],
] as const;

const patterns = [
  {
    code: "DIRECT_STATE_MUTATION",
    name: "State to'g'ridan-to'g'ri o'zgartirilgan",
    description: "State mutatsiyasi React yangilanishlarini ishonchsiz qiladi.",
    skillKey: "state-immutability",
  },
  {
    code: "MISSING_KEY_PROP",
    name: "Ro'yxatda key yo'q",
    description: "Key bo'lmasa React ro'yxat elementlarini barqaror aniqlay olmaydi.",
    skillKey: "lists-keys",
  },
  {
    code: "INDEX_AS_KEY",
    name: "Index key sifatida ishlatilgan",
    description: "Index key tartib o'zgarganda noto'g'ri element holatini saqlashi mumkin.",
    skillKey: "lists-keys",
  },
  {
    code: "MISSING_EFFECT_DEPS",
    name: "Effect dependency ro'yxati yo'q",
    description: "Dependency ro'yxatisiz effect kutilmagan vaqtda qayta ishlaydi.",
    skillKey: "use-effect",
  },
  {
    code: "NUMBER_AND_RENDER",
    name: "Raqam && bilan render qilingan",
    description: "Nol qiymati ekranda keraksiz 0 matnini chiqarishi mumkin.",
    skillKey: "conditional-rendering",
  },
] as const;

export async function seedSdt(
  prisma: PrismaClient,
  centerId: string,
  seedDemo: boolean,
): Promise<void> {
  const topics = await prisma.topic.findMany({
    where: { slug: { in: skills.map((skill) => skill.slug) } },
    select: { id: true, slug: true },
  });
  const topicIds = new Map(topics.map((topic) => [topic.slug, topic.id]));
  const skillIds = new Map<string, string>();

  for (const [index, skill] of skills.entries()) {
    const topicId = topicIds.get(skill.slug);
    if (!topicId) throw new Error(`SDT mavzusi topilmadi: ${skill.slug}`);
    const saved = await prisma.skill.upsert({
      where: { key: skill.key },
      update: {
        name: skill.name,
        description: skill.description,
        topicId,
        order: index + 1,
        remediationTitle: skill.remediationTitle,
        remediationDescription: skill.remediationDescription,
      },
      create: {
        key: skill.key,
        name: skill.name,
        description: skill.description,
        topicId,
        order: index + 1,
        remediationTitle: skill.remediationTitle,
        remediationDescription: skill.remediationDescription,
      },
    });
    skillIds.set(skill.key, saved.id);
  }

  if (skills.map((skill) => skill.key).join(",") !== SKILL_KEYS.join(",")) {
    throw new Error("SDT skill tartibi shared kontraktga mos emas");
  }
  await prisma.skillDependency.deleteMany({
    where: { skillId: { in: [...skillIds.values()] } },
  });
  await prisma.skillDependency.createMany({
    data: dependencies.map(([skillKey, prerequisiteKey]) => ({
      skillId: skillIds.get(skillKey)!,
      prerequisiteSkillId: skillIds.get(prerequisiteKey)!,
    })),
  });

  const patternIds = new Map<string, string>();
  for (const pattern of patterns) {
    const saved = await prisma.errorPattern.upsert({
      where: { code: pattern.code },
      update: {
        name: pattern.name,
        description: pattern.description,
        skillId: skillIds.get(pattern.skillKey)!,
      },
      create: {
        code: pattern.code,
        name: pattern.name,
        description: pattern.description,
        skillId: skillIds.get(pattern.skillKey)!,
      },
    });
    patternIds.set(pattern.code, saved.id);
  }
  if (patterns.map((pattern) => pattern.code).join(",") !== ERROR_PATTERN_CODES.join(",")) {
    throw new Error("SDT pattern tartibi shared kontraktga mos emas");
  }

  if (!seedDemo) return;
  const student = await prisma.user.findFirst({
    where: { login: "student", memberships: { some: { centerId, role: "STUDENT" } } },
    select: { id: true },
  });
  if (!student) return;
  if ((await prisma.studentSkill.count({ where: { centerId, studentId: student.id } })) > 0) {
    await generateNextSteps(centerId, student.id);
    return;
  }

  const demo = [
    ["jsx", 92, 4],
    ["props", 86, 4],
    ["components", 70, 3],
    ["lists-keys", 68, 3],
    ["events", 64, 2],
    ["conditional-rendering", 55, 2],
    ["state", 58, 3],
    ["state-immutability", 42, 3],
  ] as const;
  await prisma.studentSkill.createMany({
    data: demo.map(([key, masteryScore, attempts]) => ({
      centerId,
      studentId: student.id,
      skillId: skillIds.get(key)!,
      masteryScore,
      attempts,
      correctAttempts: masteryScore >= 70 ? attempts : 0,
      confidence: Math.min(1, attempts / 5),
      lastActivityAt: new Date(),
    })),
  });

  const now = Date.now();
  await prisma.skillHistory.createMany({
    data: [
      {
        centerId,
        studentId: student.id,
        skillId: skillIds.get("state-immutability")!,
        previousScore: 32,
        newScore: 38,
        source: "SEED",
        label: "Test: Obyekt va massiv state (30%)",
        createdAt: new Date(now - 7 * 86_400_000),
      },
      {
        centerId,
        studentId: student.id,
        skillId: skillIds.get("state-immutability")!,
        previousScore: 38,
        newScore: 42,
        source: "SEED",
        label: "Vazifa qabul qilindi: State ni immutable yangilash (55 ball)",
        createdAt: new Date(now - 4 * 86_400_000),
      },
      {
        centerId,
        studentId: student.id,
        skillId: skillIds.get("conditional-rendering")!,
        previousScore: 50,
        newScore: 55,
        source: "SEED",
        label: "Test: Shartli rendering (67%)",
        createdAt: new Date(now - 3 * 86_400_000),
      },
      {
        centerId,
        studentId: student.id,
        skillId: skillIds.get("jsx")!,
        previousScore: 85,
        newScore: 92,
        source: "SEED",
        label: "Vazifa qabul qilindi: JSX mashqi (100 ball)",
        createdAt: new Date(now - 2 * 86_400_000),
      },
    ],
  });
  await prisma.studentPattern.create({
    data: {
      centerId,
      studentId: student.id,
      patternId: patternIds.get("MISSING_KEY_PROP")!,
      occurrences: 2,
      resolvedCount: 0,
      status: "ACTIVE",
      lastDetectedAt: new Date(now - 3 * 86_400_000),
    },
  });
  await generateNextSteps(centerId, student.id);
}
