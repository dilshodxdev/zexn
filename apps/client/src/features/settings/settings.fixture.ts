import {
  aiSettingsSchema,
  superAdminOverviewSchema,
  testAiPromptResponseSchema,
  type AiSettings,
  type SuperAdminOverview,
  type TestAiPromptResponse,
} from "@zexn/shared";

export const centerAiSettingsFixture: AiSettings = aiSettingsSchema.parse({
  prompt:
    "O'quvchilarga javob berishda samimiy va dalda beruvchi ohangda yozing. Kod namunalarini iloji boricha sodda va tushunarli qilib ko'rsating.",
  provider: "deepseek",
  defaultPrompt:
    "Siz ZEXN ta'lim platformasining do'stona AI mentorsiz. O'quvchilarga savollariga aniq, o'zbek tilida va qadamma-qadam tushuntirib javob bering.",
  updatedAt: "2026-09-18T10:00:00.000Z",
  updatedBy: {
    id: "user-teacher-1",
    fullName: "Aziz O'qituvchi",
  },
});

export const platformAiSettingsFixture: AiSettings = aiSettingsSchema.parse({
  prompt:
    "Platformaning barcha markazlarida axloq qoidalariga rioya qiling. Yechimni to'g'ridan-to'g'ri bermasdan, o'quvchini mustaqil fikrlashga undash asosiy tamoyildir.",
  provider: "deepseek",
  defaultPrompt:
    "Siz ZEXN global ta'lim platformasining bosh AI tizimisiz. Barcha javoblarni pedagogik standartlarga mos ravishda bering.",
  updatedAt: "2026-09-15T14:20:00.000Z",
  updatedBy: {
    id: "user-superadmin",
    fullName: "Super Admin",
  },
});

export const superAdminOverviewFixture: SuperAdminOverview = superAdminOverviewSchema.parse({
  centers: 8,
  activeCenters: 7,
  users: 420,
  students: 380,
  teachers: 35,
  aiProvider: "deepseek",
  recentCenters: [
    {
      id: "center-1",
      name: "Najot Ta'lim",
      slug: "najot-talim",
      isActive: true,
      studentCount: 140,
      teacherCount: 12,
      createdAt: "2026-09-01T08:00:00.000Z",
    },
    {
      id: "center-2",
      name: "PDP Academy",
      slug: "pdp-academy",
      isActive: true,
      studentCount: 110,
      teacherCount: 9,
      createdAt: "2026-09-05T09:30:00.000Z",
    },
    {
      id: "center-3",
      name: "Astrum IT Academy",
      slug: "astrum",
      isActive: true,
      studentCount: 75,
      teacherCount: 7,
      createdAt: "2026-09-10T11:00:00.000Z",
    },
    {
      id: "center-4",
      name: "Mohirdev Center",
      slug: "mohirdev",
      isActive: true,
      studentCount: 55,
      teacherCount: 5,
      createdAt: "2026-09-12T14:15:00.000Z",
    },
    {
      id: "center-5",
      name: "Algoritmik Maktab",
      slug: "algoritmik",
      isActive: false,
      studentCount: 0,
      teacherCount: 2,
      createdAt: "2026-09-16T16:00:00.000Z",
    },
  ],
});

export function getTestAiPromptFixture(message: string): TestAiPromptResponse {
  return testAiPromptResponseSchema.parse({
    reply: `"${message}" savolingiz yuzasidan: React'da useState hooki komponentning ichki holatini saqlash va boshqarish uchun xizmat qiladi. Qayta renderlashda qiymat saqlanib qoladi.`,
    provider: "deepseek",
    latencyMs: 245,
  });
}
