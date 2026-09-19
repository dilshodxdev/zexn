import type { AssignmentDifficulty, PrismaClient, SubmissionStatus } from "@prisma/client";

interface SeedAssignment {
  title: string;
  description: string;
  topicSlug: string;
  difficulty: AssignmentDifficulty;
  dueOffsetDays: number;
  resources: Array<{ title: string; url: string }>;
  submission?: {
    status: SubmissionStatus;
    progress: number;
    content: string;
    score?: number;
  };
}

const assignments: SeedAssignment[] = [
  {
    title: "JSX markupni to'g'rilash",
    description: "Berilgan JSX markupdagi sintaksis va atribut xatolarini tuzating.",
    topicSlug: "jsx-va-markup",
    difficulty: "EASY",
    dueOffsetDays: -1,
    resources: [
      { title: "JSX bilan markup yozish", url: "https://react.dev/learn/writing-markup-with-jsx" },
    ],
    submission: {
      status: "IN_PROGRESS",
      progress: 65,
      content: "Asosiy JSX xatolari tuzatildi.",
    },
  },
  {
    title: "State ni immutable yangilash",
    description: "Obyekt va massiv state qiymatlarini mutatsiyasiz yangilang.",
    topicSlug: "obyekt-massiv-state",
    difficulty: "MEDIUM",
    dueOffsetDays: 1,
    resources: [
      {
        title: "State ichidagi obyektlar",
        url: "https://react.dev/learn/updating-objects-in-state",
      },
      {
        title: "State ichidagi massivlar",
        url: "https://react.dev/learn/updating-arrays-in-state",
      },
    ],
    submission: {
      status: "IN_PROGRESS",
      progress: 40,
      content: "Obyekt yangilanishi tayyor.",
    },
  },
  {
    title: "Conditional rendering mashqi",
    description: "Turli holatlar uchun mos komponentlarni shartli render qiling.",
    topicSlug: "shartli-rendering",
    difficulty: "EASY",
    dueOffsetDays: 2,
    resources: [
      { title: "Shartli rendering", url: "https://react.dev/learn/conditional-rendering" },
    ],
    submission: {
      status: "SUBMITTED",
      progress: 80,
      content: "Loading, error va success holatlari qo'shildi.",
    },
  },
  {
    title: "Amaliy loyiha: Mini portfolio",
    description: "React komponentlari yordamida kichik portfolio sahifasini yarating.",
    topicSlug: "component-arxitekturasi",
    difficulty: "HARD",
    dueOffsetDays: 4,
    resources: [
      { title: "Birinchi komponent", url: "https://react.dev/learn/your-first-component" },
      { title: "Props uzatish", url: "https://react.dev/learn/passing-props-to-a-component" },
      { title: "Ro'yxatlarni render qilish", url: "https://react.dev/learn/rendering-lists" },
    ],
    submission: {
      status: "DONE",
      progress: 100,
      content: "Mini portfolio yakunlandi.",
      score: 90,
    },
  },
  {
    title: "Props bilan ishlash",
    description: "Komponentlar orasida ma'lumotni props orqali uzating.",
    topicSlug: "props",
    difficulty: "EASY",
    dueOffsetDays: 6,
    resources: [
      { title: "Props uzatish", url: "https://react.dev/learn/passing-props-to-a-component" },
    ],
    submission: {
      status: "DONE",
      progress: 100,
      content: "Props mashqi bajarildi.",
      score: 100,
    },
  },
  {
    title: "UseEffect bilan API so'rov",
    description: "useEffect orqali API ma'lumotlarini yuklash holatlarini boshqaring.",
    topicSlug: "api-va-custom-hooklar",
    difficulty: "HARD",
    dueOffsetDays: 1,
    resources: [
      {
        title: "Effect bilan sinxronlash",
        url: "https://react.dev/learn/synchronizing-with-effects",
      },
      {
        title: "Effectdan foydalanish",
        url: "https://react.dev/learn/you-might-not-need-an-effect",
      },
    ],
  },
  {
    title: "CSS bilan stil berish",
    description: "Komponentlarga className orqali mos CSS stillarini qo'llang.",
    topicSlug: "jsx-va-markup",
    difficulty: "MEDIUM",
    dueOffsetDays: 2,
    resources: [],
  },
  {
    title: "React muhitini sozlash",
    description: "React loyihasini ishga tushirib boshlang'ich tuzilmani tayyorlang.",
    topicSlug: "react-asoslari",
    difficulty: "EASY",
    dueOffsetDays: 4,
    resources: [{ title: "React bilan tanishuv", url: "https://react.dev/learn" }],
  },
];

export async function seedAssignments(
  prisma: PrismaClient,
  centerId: string,
  seedTime = new Date(),
): Promise<void> {
  const [teacher, student, topics] = await Promise.all([
    prisma.user.findFirst({
      where: {
        login: "teacher",
        memberships: { some: { centerId, role: "TEACHER", isActive: true } },
      },
      select: { id: true },
    }),
    prisma.user.findFirst({
      where: {
        login: "student",
        memberships: { some: { centerId, role: "STUDENT", isActive: true } },
      },
      select: { id: true },
    }),
    prisma.topic.findMany({
      where: { subject: { slug: "frontend-react", isActive: true } },
      select: { id: true, slug: true },
    }),
  ]);
  if (!teacher || !student) throw new Error("Assignment seed foydalanuvchilari topilmadi");
  const topicIds = new Map(topics.map((topic) => [topic.slug, topic.id]));

  for (const item of assignments) {
    const topicId = topicIds.get(item.topicSlug);
    if (!topicId) throw new Error(`Assignment seed mavzusi topilmadi: ${item.topicSlug}`);
    let assignment = await prisma.assignment.findFirst({
      where: { centerId, title: item.title },
      select: { id: true },
    });
    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          centerId,
          topicId,
          title: item.title,
          description: item.description,
          difficulty: item.difficulty,
          dueAt: new Date(seedTime.getTime() + item.dueOffsetDays * 24 * 60 * 60 * 1000),
          resources: item.resources,
          createdByUserId: teacher.id,
        },
        select: { id: true },
      });
    }
    if (!item.submission) continue;

    const submittedAt = item.submission.status === "IN_PROGRESS" ? null : seedTime;
    const reviewedAt = item.submission.status === "DONE" ? seedTime : null;
    const existing = await prisma.assignmentSubmission.findFirst({
      where: { centerId, assignmentId: assignment.id, studentId: student.id },
      select: { id: true },
    });
    const data = {
      status: item.submission.status,
      progress: item.submission.progress,
      content: item.submission.content,
      score: item.submission.score ?? null,
      feedback: item.submission.status === "DONE" ? "Yaxshi bajarilgan" : null,
      submittedAt,
      reviewedAt,
      reviewedByUserId: item.submission.status === "DONE" ? teacher.id : null,
    };
    if (existing) {
      await prisma.assignmentSubmission.updateMany({
        where: { id: existing.id, centerId, assignmentId: assignment.id, studentId: student.id },
        data,
      });
    } else {
      await prisma.assignmentSubmission.create({
        data: {
          centerId,
          assignmentId: assignment.id,
          studentId: student.id,
          ...data,
        },
      });
    }
  }
}
