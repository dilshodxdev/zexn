import {
  API_ERROR_CODES,
  type MentorMessage,
  type NextStep,
  type SendMentorMessageBody,
} from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import { createAiProvider } from "../../lib/ai/index.js";
import * as mentorRepository from "./mentor.repository.js";
import * as studentRepository from "./student.repository.js";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const messageTimes = new Map<string, number[]>();

function enforceRateLimit(centerId: string, studentId: string): void {
  const key = `${centerId}:${studentId}`;
  const now = Date.now();
  const recent = (messageTimes.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    messageTimes.set(key, recent);
    throw new AppError(
      429,
      "Bir daqiqada 10 tadan ortiq xabar yuborib bo'lmaydi",
      API_ERROR_CODES.RATE_LIMITED,
    );
  }
  recent.push(now);
  messageTimes.set(key, recent);
}

function mapMessage(message: {
  id: string;
  role: string;
  text: string;
  createdAt: Date;
}): MentorMessage {
  return {
    id: message.id,
    role: message.role === "mentor" ? "mentor" : "student",
    text: message.text,
    createdAt: message.createdAt.toISOString(),
  };
}

function buildSystemPrompt(
  studentName: string,
  courseTitle: string,
  weakTopics: Array<{
    title: string;
    material: { title: string; url: string } | null;
  }>,
  nextStepInstruction: string,
): string {
  const weakTopicLines = weakTopics.length
    ? weakTopics
        .map(
          ({ title, material }) =>
            `- ${title}${material ? ` | ${material.title} | ${material.url}` : ""}`,
        )
        .join("\n")
    : "Zaif mavzu aniqlanmagan.";
  return [
    "Siz o'quvchiga qisqa va tushunarli o'zbekcha javob beradigan AI mentorsiz.",
    `O'quvchi: ${studentName}`,
    `Kurs: ${courseTitle}`,
    "Zaif mavzular va materiallar:",
    weakTopicLines,
    `Joriy keyingi qadam: ${nextStepInstruction}`,
  ].join("\n");
}

function isWeakTopic(
  topic: NonNullable<
    Awaited<ReturnType<typeof studentRepository.findActiveCourse>>
  >["topics"][number],
): boolean {
  const latestAttempt = topic.tests
    .flatMap((test) => test.attempts)
    .sort(
      (left, right) => (right.finishedAt?.getTime() ?? 0) - (left.finishedAt?.getTime() ?? 0),
    )[0];
  return latestAttempt?.score !== undefined
    ? latestAttempt.score < 70
    : topic.knowledgeGaps.length > 0;
}

export async function getMessages(
  centerId: string,
  studentId: string,
  requestedLimit: number,
): Promise<MentorMessage[]> {
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 50;
  const messages = await mentorRepository.findRecentMessages(
    centerId,
    studentId,
    Math.min(limit, 50),
  );
  return messages.reverse().map(mapMessage);
}

export async function sendMessage(
  centerId: string,
  studentId: string,
  body: SendMentorMessageBody,
): Promise<{ student: MentorMessage; mentor: MentorMessage }> {
  enforceRateLimit(centerId, studentId);
  const studentMessage = await mentorRepository.createMessage(
    centerId,
    studentId,
    "student",
    body.text,
  );
  const [student, course, nextStep, recentMessages] = await Promise.all([
    studentRepository.findStudent(studentId),
    studentRepository.findActiveCourse(centerId, studentId),
    studentRepository.findLatestNextStep(centerId, studentId),
    mentorRepository.findRecentMessages(centerId, studentId, 10, studentMessage.id),
  ]);
  if (!student) {
    throw new AppError(404, "O'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  if (!course) {
    throw new AppError(404, "Faol kurs topilmadi", API_ERROR_CODES.NOT_FOUND);
  }

  const nextStepInstruction = nextStep?.instruction ?? "hozircha keyingi qadam belgilanmagan";
  const weakTopics = course.topics.filter(isWeakTopic).map((topic) => ({
    title: topic.title,
    material: topic.materials[0]
      ? { title: topic.materials[0].title, url: topic.materials[0].url }
      : null,
  }));
  const system = buildSystemPrompt(student.fullName, course.title, weakTopics, nextStepInstruction);
  const history = recentMessages.reverse().map((message) => ({
    role: message.role === "mentor" ? ("mentor" as const) : ("student" as const),
    text: message.text,
  }));

  let mentorText: string;
  try {
    mentorText = await createAiProvider().chat({ system, history, message: body.text });
  } catch {
    mentorText = `Hozir javob bera olmadim, keyingi qadamingiz: ${nextStepInstruction}`;
  }
  const mentorMessage = await mentorRepository.createMessage(
    centerId,
    studentId,
    "mentor",
    mentorText,
  );
  return { student: mapMessage(studentMessage), mentor: mapMessage(mentorMessage) };
}

export async function completeNextStep(
  centerId: string,
  studentId: string,
  nextStepId: string,
): Promise<{ nextStep: NextStep }> {
  const item = await mentorRepository.completeNextStep(centerId, studentId, nextStepId);
  if (!item) {
    throw new AppError(404, "Kutilayotgan keyingi qadam topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return {
    nextStep: {
      id: item.id,
      topicId: item.topicId,
      topicTitle: item.topic.title,
      rootTopicId: item.gap?.rootTopic?.id ?? null,
      rootTopicTitle: item.gap?.rootTopic?.title ?? null,
      instruction: item.instruction,
      material: item.material,
      status: "done",
      createdAt: item.createdAt.toISOString(),
    },
  };
}
