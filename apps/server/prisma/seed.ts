// Dev seed: bitta markaz + super admin + har roldan bittadan foydalanuvchi.
// SEED_DEV_PASSWORDS=true bo'lsa namuna parol bcrypt bilan yoziladi.
// Ishga tushirish: pnpm --filter @zexn/server exec prisma db seed
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { seedAssignments } from "./seed-data/assignments.js";
import { assertAcyclicTopics, reactCourse } from "./seed-data/react-course.js";
import { seedSdt } from "./seed-data/sdt.js";

const prisma = new PrismaClient();

function questionOptions(
  questionId: string,
  correct: string,
  distractors: string[],
  questionIndex: number,
) {
  const texts = [correct, ...distractors];
  const rotate = questionIndex % texts.length;
  const rotatedTexts = [...texts.slice(rotate), ...texts.slice(0, rotate)];
  const correctIndex = (texts.length - rotate) % texts.length;

  return {
    options: rotatedTexts.map((text, index) => ({
      id: `${questionId}-${String.fromCharCode(97 + index)}`,
      text,
    })),
    correctOptionId: `${questionId}-${String.fromCharCode(97 + correctIndex)}`,
  };
}

function topicQuestions(topic: (typeof reactCourse.topics)[number]) {
  const prerequisite = topic.prerequisites[0] ?? "JavaScript va web asoslari";
  const material = topic.materials[0]?.title ?? "React hujjati";
  return [
    {
      text: `"${topic.title}" mavzusining asosiy maqsadi nima?`,
      correct: topic.description,
      distractors: [
        "Faqat CSS ranglarini tanlash",
        "Serverni qayta o'rnatish",
        "Ma'lumotlar bazasini zaxiralash",
      ],
    },
    {
      text: `"${topic.title}" mavzusi uchun qaysi manba tavsiya qilingan?`,
      correct: material,
      distractors: ["Node.js API ma'lumotnomasi", "PostgreSQL qo'llanmasi", "Docker CLI hujjati"],
    },
    {
      text: `"${topic.title}" dan oldin qaysi bilim tavsiya qilinadi?`,
      correct: prerequisite,
      distractors: ["Git tarixini tozalash", "DNS server sozlash", "Linux yadrosini yig'ish"],
    },
    {
      text: `"${topic.title}" bo'yicha qaysi yondashuv Reactga mos?`,
      correct: "Deklarativ va komponentli yondashuvni qo'llash",
      distractors: [
        "DOMni har doim qo'lda o'zgartirish",
        "Barcha kodni bitta funksiyaga yozish",
        "Stateni global o'zgaruvchida saqlash",
      ],
    },
    {
      text: `"${topic.title}" mavzusini qanday mustahkamlash ma'qul?`,
      correct: "Kichik amaliy misol yaratib natijani tekshirish",
      distractors: [
        "Faqat sarlavhani yodlash",
        "Kodni ishga tushirmaslik",
        "Xatolarni e'tiborsiz qoldirish",
      ],
    },
  ];
}

async function seedReactCourse(): Promise<void> {
  assertAcyclicTopics(reactCourse.topics);
  const subject = await prisma.subject.upsert({
    where: { slug: reactCourse.slug },
    update: { title: reactCourse.title, isActive: true },
    create: { title: reactCourse.title, slug: reactCourse.slug, isActive: true },
  });
  const topicIds = new Map<string, string>();

  for (const [index, topic] of reactCourse.topics.entries()) {
    const saved = await prisma.topic.upsert({
      where: { subjectId_slug: { subjectId: subject.id, slug: topic.slug } },
      update: { title: topic.title, order: index + 1, description: topic.description },
      create: {
        subjectId: subject.id,
        title: topic.title,
        slug: topic.slug,
        order: index + 1,
        description: topic.description,
      },
    });
    topicIds.set(topic.slug, saved.id);
  }

  for (const topic of reactCourse.topics) {
    const topicId = topicIds.get(topic.slug);
    if (!topicId) throw new Error(`Seed mavzusi topilmadi: ${topic.slug}`);
    await prisma.topicPrerequisite.deleteMany({ where: { topicId } });
    for (const prerequisiteSlug of topic.prerequisites) {
      const prerequisiteId = topicIds.get(prerequisiteSlug);
      if (!prerequisiteId) throw new Error(`Seed prerequisite topilmadi: ${prerequisiteSlug}`);
      await prisma.topicPrerequisite.create({ data: { topicId, prerequisiteId } });
    }

    for (const [index, material] of topic.materials.entries()) {
      await prisma.material.upsert({
        where: { id: `seed-react-${topic.slug}-material-${index + 1}` },
        update: { topicId, ...material },
        create: { id: `seed-react-${topic.slug}-material-${index + 1}`, topicId, ...material },
      });
    }

    const testId = `seed-react-${topic.slug}-test`;
    await prisma.test.upsert({
      where: { id: testId },
      update: { topicId, title: `${topic.title} testi`, isActive: true },
      create: { id: testId, topicId, title: `${topic.title} testi`, isActive: true },
    });
    for (const [index, question] of topicQuestions(topic).entries()) {
      const questionId = `seed-react-${topic.slug}-q${index + 1}`;
      const { options, correctOptionId } = questionOptions(
        questionId,
        question.correct,
        question.distractors,
        index,
      );
      await prisma.question.upsert({
        where: { id: questionId },
        update: {
          topicId,
          text: question.text,
          options,
          correctOptionId,
          difficulty: index < 2 ? 1 : index < 4 ? 2 : 3,
        },
        create: {
          id: questionId,
          topicId,
          text: question.text,
          options,
          correctOptionId,
          difficulty: index < 2 ? 1 : index < 4 ? 2 : 3,
        },
      });
      await prisma.testQuestion.upsert({
        where: { testId_questionId: { testId, questionId } },
        update: { order: index + 1 },
        create: { testId, questionId, order: index + 1 },
      });
    }
  }
}

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

  await seedReactCourse();
  if (seedDevPasswords) await seedAssignments(prisma, center.id);
  await seedSdt(prisma, center.id, seedDevPasswords);

  console.info(`Seed tayyor: markaz "${center.name}", ${users.length} ta foydalanuvchi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
