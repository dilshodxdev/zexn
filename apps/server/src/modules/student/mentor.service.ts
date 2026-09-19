import {
  API_ERROR_CODES,
  type MentorMessage,
  type NextStep,
  type SendMentorMessageBody,
} from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import { buildMentorContext } from "../../lib/ai/context-builder.js";
import { createAiProvider } from "../../lib/ai/index.js";
import * as settingsRepository from "../settings/settings.repository.js";
import * as mentorRepository from "./mentor.repository.js";
import * as studentRepository from "./student.repository.js";

const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const GREETING_TIMEOUT_MS = 8_000;
const messageTimes = new Map<string, number[]>();
const greetingRequests = new Map<string, Promise<void>>();

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
    role: message.role === "mentor" || message.role === "teacher" ? "mentor" : "student",
    text: message.role === "teacher" ? `O'qituvchi: ${message.text}` : message.text,
    createdAt: message.createdAt.toISOString(),
  };
}

export function buildSystemPrompt(
  platformPrompt: string,
  centerPrompt: string,
  studentName: string,
  courseTitle: string,
  weakTopics: Array<{
    title: string;
    material: { title: string; url: string } | null;
  }>,
  nextStepInstruction: string,
  codeReview: boolean,
): string {
  // Prompt matni context-builder'da (lib/ai/context-builder.ts) - bu yerda faqat ma'lumot uzatiladi.
  return buildMentorContext({
    settings: { platformPrompt, centerPrompt },
    student: { fullName: studentName, courseTitle, weakTopics, nextStepInstruction },
    codeReview,
  });
}

function containsCodeBlock(text: string): boolean {
  return /```[^\n`]*\n[\s\S]+?```/.test(text);
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

function tashkentDateKey(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tashkent",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function isToday(value: Date): boolean {
  return tashkentDateKey(value) === tashkentDateKey(new Date());
}

async function createGreeting(centerId: string, studentId: string): Promise<void> {
  const latestMessages = await mentorRepository.findRecentMessages(centerId, studentId, 1);
  if (latestMessages[0] && isToday(latestMessages[0].createdAt)) return;

  const [student, course, nextStep, platformPrompt, centerPrompt] = await Promise.all([
    studentRepository.findStudent(studentId),
    studentRepository.findActiveCourse(centerId, studentId),
    studentRepository.findLatestNextStep(centerId, studentId),
    settingsRepository.findPlatformPrompt(),
    settingsRepository.findCenterPrompt(centerId),
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
  const system = `${buildSystemPrompt(
    platformPrompt,
    centerPrompt,
    student.fullName,
    course.title,
    weakTopics,
    nextStepInstruction,
    false,
  )}\nBu suhbatning birinchi xabari. O'quvchi hali hech narsa yozmagan.`;
  const fallback = `Salom, ${student.fullName}! 👋 Ishlar yaxshimi? Bugun nima o'tamiz - o'zing aytasanmi yoki men taklif qilaymi? (Keyingi qadaming: ${nextStepInstruction})`;

  let timeout: ReturnType<typeof setTimeout> | undefined;
  let text = fallback;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error("AI_TIMEOUT")), GREETING_TIMEOUT_MS);
    });
    text = await Promise.race([
      createAiProvider().chat({
        system,
        history: [],
        message:
          "[tizim] O'quvchi chatni ochdi. Salomlash, hol-ahvol so'ra, bugungi reja haqida so'ra (o'zi aytadimi yoki sen taklif qilasanmi). 2-3 gap.",
      }),
      timeoutPromise,
    ]);
  } catch {
    text = fallback;
  } finally {
    if (timeout) clearTimeout(timeout);
  }

  const recheckedMessages = await mentorRepository.findRecentMessages(centerId, studentId, 1);
  if (recheckedMessages[0] && isToday(recheckedMessages[0].createdAt)) return;
  await mentorRepository.createMessage(centerId, studentId, "mentor", text);
}

export async function ensureGreeting(centerId: string, studentId: string): Promise<void> {
  const key = `${centerId}:${studentId}`;
  const pending = greetingRequests.get(key);
  if (pending) return pending;

  const request = createGreeting(centerId, studentId).finally(() => {
    greetingRequests.delete(key);
  });
  greetingRequests.set(key, request);
  return request;
}

export async function getMessages(
  centerId: string,
  studentId: string,
  requestedLimit: number,
): Promise<MentorMessage[]> {
  await ensureGreeting(centerId, studentId);
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
  const [student, course, nextStep, recentMessages, platformPrompt, centerPrompt] =
    await Promise.all([
      studentRepository.findStudent(studentId),
      studentRepository.findActiveCourse(centerId, studentId),
      studentRepository.findLatestNextStep(centerId, studentId),
      mentorRepository.findRecentMessages(centerId, studentId, 10, studentMessage.id),
      settingsRepository.findPlatformPrompt(),
      settingsRepository.findCenterPrompt(centerId),
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
  const system = buildSystemPrompt(
    platformPrompt,
    centerPrompt,
    student.fullName,
    course.title,
    weakTopics,
    nextStepInstruction,
    containsCodeBlock(body.text),
  );
  const history = recentMessages.reverse().map((message) => ({
    role:
      message.role === "mentor" || message.role === "teacher"
        ? ("mentor" as const)
        : ("student" as const),
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
