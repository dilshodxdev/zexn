import {
  API_ERROR_CODES,
  type NextStep,
  type StudentOverview,
  type TestDetail,
  type TestListItem,
  type TopicDetail,
  type TopicNode,
} from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import * as studentRepository from "./student.repository.js";

type Course = NonNullable<Awaited<ReturnType<typeof studentRepository.findActiveCourse>>>;
type CourseTopic = Course["topics"][number];

function latestScore(topic: CourseTopic): number | null {
  const attempts = topic.tests.flatMap((test) => test.attempts);
  attempts.sort((left, right) => {
    const leftTime = left.finishedAt?.getTime() ?? 0;
    const rightTime = right.finishedAt?.getTime() ?? 0;
    return rightTime - leftTime;
  });
  return attempts[0]?.score ?? null;
}

function buildTopicNodes(topics: CourseTopic[]): TopicNode[] {
  const mastery = new Map(topics.map((topic) => [topic.id, latestScore(topic)]));
  const baseStatus = new Map(
    topics.map((topic) => {
      const score = mastery.get(topic.id) ?? null;
      if (score !== null && score >= 70) return [topic.id, "done"] as const;
      if (score !== null || topic.knowledgeGaps.length > 0) return [topic.id, "weak"] as const;
      return [topic.id, "locked"] as const;
    }),
  );
  let currentAssigned = false;

  return topics.map((topic) => {
    let status: TopicNode["status"] = baseStatus.get(topic.id) ?? "locked";
    const prerequisiteIds = topic.prerequisites.map((item) => item.prerequisiteId);
    if (
      status === "locked" &&
      !currentAssigned &&
      prerequisiteIds.every((id) => baseStatus.get(id) === "done")
    ) {
      status = "current";
      currentAssigned = true;
    }
    return {
      id: topic.id,
      title: topic.title,
      order: topic.order,
      status,
      mastery: mastery.get(topic.id) ?? null,
      prerequisiteIds,
      lessonsDone: status === "done" ? topic.materials.length : 0,
      lessonsTotal: topic.materials.length,
    };
  });
}

function levelForXp(xp: number): string {
  if (xp < 500) return "Beginner";
  if (xp < 2000) return "Intermediate";
  return "Advanced";
}

function mapNextStep(
  item: Awaited<ReturnType<typeof studentRepository.findLatestNextStep>>,
): NextStep | null {
  if (!item) return null;
  return {
    id: item.id,
    topicId: item.topicId,
    topicTitle: item.topic.title,
    rootTopicId: item.gap?.rootTopic?.id ?? null,
    rootTopicTitle: item.gap?.rootTopic?.title ?? null,
    instruction: item.instruction,
    material: item.material,
    status: "pending",
    createdAt: item.createdAt.toISOString(),
  };
}

export async function getOverview(centerId: string, studentId: string): Promise<StudentOverview> {
  const [student, course, nextStep, stats, leaders] = await Promise.all([
    studentRepository.findStudent(studentId),
    studentRepository.findActiveCourse(centerId, studentId),
    studentRepository.findLatestNextStep(centerId, studentId),
    studentRepository.findStudentStats(centerId, studentId),
    studentRepository.findRatingLeaders(centerId),
  ]);
  if (!student) {
    throw new AppError(404, "O'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  if (!course) {
    throw new AppError(404, "Faol kurs topilmadi", API_ERROR_CODES.NOT_FOUND);
  }

  const topics = buildTopicNodes(course.topics);
  const xp = stats?.xp ?? 0;
  const rating = leaders.map((item, index) => ({
    userId: item.studentId,
    fullName: item.student.fullName,
    xp: item.xp,
    rank: index + 1,
    isMe: item.studentId === studentId,
  }));
  if (!rating.some((item) => item.userId === studentId)) {
    rating.push({
      userId: studentId,
      fullName: student.fullName,
      xp,
      rank: (await studentRepository.countStudentsAboveXp(centerId, xp)) + 1,
      isMe: true,
    });
  }

  return {
    student: {
      id: student.id,
      fullName: student.fullName,
      shortId: student.login,
      hasTelegram: student.telegramId !== null,
      telegramUsername: null,
    },
    course: {
      id: course.id,
      title: course.title,
      topics,
      completedCount: topics.filter((topic) => topic.status === "done").length,
      totalCount: topics.length,
    },
    nextStep: mapNextStep(nextStep),
    stats: {
      level: levelForXp(xp),
      xp,
      levelXp: 1000,
      streakDays: stats?.streakDays ?? 0,
      streakRecord: stats?.streakRecord ?? 0,
      achievementsEarned: stats?.achievements ?? 0,
      achievementsTotal: 0,
    },
    rating,
  };
}

export async function getTopic(
  centerId: string,
  studentId: string,
  topicId: string,
): Promise<TopicDetail> {
  const course = await studentRepository.findActiveCourse(centerId, studentId);
  const topic = course?.topics.find((item) => item.id === topicId);
  if (!course || !topic) {
    throw new AppError(404, "Mavzu topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  const nodes = buildTopicNodes(course.topics);
  const gap = topic.knowledgeGaps[0];
  return {
    topic: nodes.find((item) => item.id === topicId)!,
    description: topic.description,
    materials: topic.materials.map(({ id, title, url, kind }) => ({ id, title, url, kind })),
    gap: gap
      ? {
          rootTopicId: gap.rootTopic?.id ?? null,
          rootTopicTitle: gap.rootTopic?.title ?? null,
          confidence: gap.confidence,
          explanation: gap.explanation,
        }
      : null,
    availableTestId: topic.tests[0]?.id ?? null,
  };
}

export async function getTests(centerId: string, studentId: string): Promise<TestListItem[]> {
  const tests = await studentRepository.findActiveTests(centerId, studentId);
  return tests.map((test) => ({
    id: test.id,
    title: test.title,
    topicId: test.topic.id,
    topicTitle: test.topic.title,
    questionCount: test._count.testQuestions,
    status: test.attempts.length > 0 ? "completed" : "available",
    lastScore: test.attempts[0]?.score ?? null,
  }));
}

function parseOptions(value: unknown): TestDetail["questions"][number]["options"] {
  if (!Array.isArray(value)) {
    throw new AppError(500, "Savol variantlari yaroqsiz", API_ERROR_CODES.INTERNAL_ERROR);
  }
  const options = value.filter(
    (item): item is { id: string; text: string } =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      typeof item.id === "string" &&
      "text" in item &&
      typeof item.text === "string",
  );
  if (options.length !== value.length || options.length < 2) {
    throw new AppError(500, "Savol variantlari yaroqsiz", API_ERROR_CODES.INTERNAL_ERROR);
  }
  return options;
}

export async function getTest(testId: string): Promise<TestDetail> {
  const test = await studentRepository.findActiveTest(testId);
  if (!test) {
    throw new AppError(404, "Test topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return {
    id: test.id,
    title: test.title,
    topicId: test.topicId,
    questions: test.testQuestions.map(({ question }) => ({
      id: question.id,
      text: question.text,
      options: parseOptions(question.options),
    })),
  };
}
