import {
  API_ERROR_CODES,
  INTERVIEW_ANSWER_MAX,
  INTERVIEW_CODE_INDEXES,
  INTERVIEW_QUESTION_COUNT,
  INTERVIEW_TRACK_LANGUAGES,
  INTERVIEW_TRACK_TOPICS,
  INTERVIEW_TRACKS,
  interviewListItemSchema,
  interviewSessionSchema,
  interviewSkillSchema,
  interviewTrackInfoSchema,
  interviewTurnSchema,
  skillTier,
  type AnswerInterviewBody,
  type InterviewLevel,
  type InterviewLanguage,
  type InterviewListItem,
  type InterviewQuestionKind,
  type InterviewSession,
  type InterviewSkill,
  type InterviewTrack,
  type InterviewTrackInfo,
  type InterviewTurn,
  type StartInterviewBody,
} from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import { createAiProvider } from "../../lib/ai/index.js";
import * as sdtService from "../sdt/sdt.service.js";
import * as settingsRepository from "../settings/settings.repository.js";
import { DEFAULT_MENTOR_SYSTEM_PROMPT } from "../settings/settings.service.js";
import * as interviewRepository from "./interview.repository.js";

const START_RATE_LIMIT = 3;
const ANSWER_RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;
const startTimes = new Map<string, number[]>();
const answerTimes = new Map<string, number[]>();

function enforceRateLimit(
  store: Map<string, number[]>,
  key: string,
  limit: number,
  message: string,
): void {
  const now = Date.now();
  const recent = (store.get(key) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= limit) {
    store.set(key, recent);
    throw new AppError(429, message, API_ERROR_CODES.RATE_LIMITED);
  }
  recent.push(now);
  store.set(key, recent);
}

function parseTurns(value: unknown): InterviewTurn[] {
  const normalized = Array.isArray(value)
    ? value.map((item, arrayIndex) => {
        if (typeof item !== "object" || item === null || "kind" in item) return item;
        const record = item as Record<string, unknown>;
        const index = typeof record.index === "number" ? record.index : arrayIndex;
        return {
          ...record,
          kind: questionKind(index),
          language: null,
          starterCode: null,
        };
      })
    : value;
  const parsed = interviewTurnSchema.array().safeParse(normalized);
  if (!parsed.success) {
    throw new AppError(500, "Intervyu ma'lumotlari buzilgan", API_ERROR_CODES.INTERNAL_ERROR);
  }
  return parsed.data;
}

function questionKind(index: number): InterviewQuestionKind {
  return INTERVIEW_CODE_INDEXES.some((codeIndex) => codeIndex === index) ? "code" : "theory";
}

function defaultStarterCode(language: InterviewLanguage): string {
  if (language === "kotlin") return "fun solution() {\n    // TODO: yechimni yozing\n}";
  if (language === "swift") return "func solution() {\n    // TODO: yechimni yozing\n}";
  if (language === "python") return "def solution():\n    # TODO: yechimni yozing\n    pass";
  return "function solution() {\n  // TODO: yechimni yozing\n}";
}

function createTurn(
  track: InterviewTrack,
  index: number,
  question: { question: string; language?: InterviewLanguage; starterCode?: string },
): InterviewTurn {
  const kind = questionKind(index);
  if (kind === "theory") {
    return {
      index,
      kind,
      question: question.question,
      language: null,
      starterCode: null,
      answer: null,
      score: null,
      feedback: null,
      modelAnswer: null,
      answeredAt: null,
    };
  }
  const languages = INTERVIEW_TRACK_LANGUAGES[track];
  const language =
    question.language && languages.includes(question.language) ? question.language : languages[0]!;
  const lineCount = question.starterCode?.split("\n").length ?? 0;
  const starterCode =
    question.starterCode && lineCount >= 3 && lineCount <= 15 && /TODO/i.test(question.starterCode)
      ? question.starterCode
      : defaultStarterCode(language);
  return {
    index,
    kind,
    question: question.question,
    language,
    starterCode,
    answer: null,
    score: null,
    feedback: null,
    modelAnswer: null,
    answeredAt: null,
  };
}

function averageScore(turns: InterviewTurn[], kind: InterviewQuestionKind): number {
  const scores = turns.flatMap((turn) =>
    turn.kind === kind && turn.score !== null ? [turn.score] : [],
  );
  return scores.length === 0
    ? 0
    : Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function combinedPrompt(platformPrompt: string, centerPrompt: string): string {
  return [
    platformPrompt.trim() || DEFAULT_MENTOR_SYSTEM_PROMPT,
    ...(centerPrompt.trim() ? [centerPrompt.trim()] : []),
  ].join("\n");
}

function levelForMastery(mastery: number): InterviewLevel {
  if (mastery < 60) return "easy";
  if (mastery < 75) return "medium";
  return "hard";
}

function parseTrack(value: string): InterviewTrack {
  const track = INTERVIEW_TRACKS.find((item) => item === value);
  if (!track) {
    throw new AppError(500, "Intervyu sohasi noto'g'ri", API_ERROR_CODES.INTERNAL_ERROR);
  }
  return track;
}

type SessionRecord = NonNullable<Awaited<ReturnType<typeof interviewRepository.findSession>>>;

function mapSession(session: SessionRecord): InterviewSession {
  const turns = parseTurns(session.turns);
  return interviewSessionSchema.parse({
    id: session.id,
    track: session.track,
    skill: session.skill
      ? {
          id: session.skill.id,
          name: session.skill.name,
          topicTitle: session.skill.topic.title,
        }
      : null,
    level: session.level,
    status: session.status,
    questionCount: session.questionCount,
    answeredCount: turns.filter((turn) => turn.answer !== null).length,
    turns,
    result:
      session.status === "DONE"
        ? {
            score: session.score,
            theoryScore: averageScore(turns, "theory"),
            codeScore: averageScore(turns, "code"),
            summary: session.summary,
            strengths: session.strengths,
            weaknesses: session.weaknesses,
            masteryBefore: session.masteryBefore,
            masteryAfter: session.masteryAfter,
          }
        : null,
    startedAt: session.startedAt.toISOString(),
    finishedAt: session.finishedAt?.toISOString() ?? null,
  });
}

function mapListItem(
  session: Awaited<ReturnType<typeof interviewRepository.findStudentSessions>>[number],
): InterviewListItem {
  const turns = parseTurns(session.turns);
  return interviewListItemSchema.parse({
    id: session.id,
    track: session.track,
    skill: session.skill,
    level: session.level,
    status: session.status,
    answeredCount: turns.filter((turn) => turn.answer !== null).length,
    questionCount: session.questionCount,
    score: session.score,
    startedAt: session.startedAt.toISOString(),
    finishedAt: session.finishedAt?.toISOString() ?? null,
  });
}

async function findOwnedSession(
  centerId: string,
  studentId: string,
  sessionId: string,
): Promise<SessionRecord> {
  const session = await interviewRepository.findSession(centerId, studentId, sessionId);
  if (!session) {
    throw new AppError(404, "Intervyu topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return session;
}

export async function getSkills(centerId: string, studentId: string): Promise<InterviewSkill[]> {
  const skills = await interviewRepository.findInterviewSkills(centerId, studentId);
  return skills.map((skill) => {
    const state = skill.studentSkills[0];
    const mastery = state?.masteryScore ?? 50;
    return interviewSkillSchema.parse({
      id: skill.id,
      key: skill.key,
      name: skill.name,
      topicTitle: skill.topic.title,
      mastery,
      tier: skillTier(mastery, state?.attempts ?? 0),
      interviewCount: skill.interviews.length,
      lastScore: skill.interviews[0]?.score ?? null,
    });
  });
}

export async function getTracks(
  centerId: string,
  studentId: string,
): Promise<InterviewTrackInfo[]> {
  const sessions = await interviewRepository.findDoneTrackSessions(centerId, studentId);
  return INTERVIEW_TRACKS.map((track) => {
    const trackSessions = sessions.filter((session) => session.track === track);
    const scores = trackSessions.flatMap((session) =>
      session.score === null ? [] : [session.score],
    );
    return interviewTrackInfoSchema.parse({
      track,
      languages: [...INTERVIEW_TRACK_LANGUAGES[track]],
      interviewCount: trackSessions.length,
      lastScore: scores[0] ?? null,
      bestScore: scores.length === 0 ? null : Math.max(...scores),
    });
  });
}

export async function listSessions(
  centerId: string,
  studentId: string,
): Promise<InterviewListItem[]> {
  return (await interviewRepository.findStudentSessions(centerId, studentId)).map(mapListItem);
}

export async function getSession(
  centerId: string,
  studentId: string,
  sessionId: string,
): Promise<InterviewSession> {
  return mapSession(await findOwnedSession(centerId, studentId, sessionId));
}

export async function startInterview(
  centerId: string,
  studentId: string,
  body: StartInterviewBody,
): Promise<InterviewSession> {
  if (body.track !== "frontend" && body.skillId) {
    throw new AppError(
      400,
      "Skill faqat frontend intervyusida tanlanadi",
      API_ERROR_CODES.VALIDATION_ERROR,
    );
  }
  enforceRateLimit(
    startTimes,
    `${centerId}:${studentId}`,
    START_RATE_LIMIT,
    "Bir daqiqada 3 tadan ortiq intervyu boshlab bo'lmaydi",
  );
  const [skill, activeSession, platformPrompt, centerPrompt] = await Promise.all([
    body.skillId
      ? interviewRepository.findSkill(centerId, studentId, body.skillId)
      : Promise.resolve(null),
    interviewRepository.findActiveSession(centerId, studentId),
    settingsRepository.findPlatformPrompt(),
    settingsRepository.findCenterPrompt(centerId),
  ]);
  if (body.skillId && !skill) {
    throw new AppError(400, "Skill topilmadi", API_ERROR_CODES.VALIDATION_ERROR);
  }
  if (activeSession) {
    throw new AppError(409, "Tugallanmagan intervyu mavjud", API_ERROR_CODES.CONFLICT, {
      sessionId: activeSession.id,
    });
  }

  const mastery = skill ? (skill.studentSkills[0]?.masteryScore ?? 50) : null;
  const level = body.level ?? (mastery === null ? "medium" : levelForMastery(mastery));
  const question = await createAiProvider().interviewQuestion({
    skill: skill?.key ?? null,
    topic: skill?.topic.title ?? null,
    track: body.track,
    topics: INTERVIEW_TRACK_TOPICS[body.track],
    kind: questionKind(0),
    languages: INTERVIEW_TRACK_LANGUAGES[body.track],
    level,
    index: 0,
    total: INTERVIEW_QUESTION_COUNT,
    previous: [],
    platformPrompt: combinedPrompt(platformPrompt, centerPrompt),
  });
  const turns = [createTurn(body.track, 0, question)];
  return mapSession(
    await interviewRepository.createSession(centerId, studentId, {
      track: body.track,
      ...(skill ? { skillId: skill.id } : {}),
      level,
      questionCount: INTERVIEW_QUESTION_COUNT,
      turns,
      masteryBefore: mastery,
    }),
  );
}

export async function answerInterview(
  centerId: string,
  studentId: string,
  sessionId: string,
  body: AnswerInterviewBody,
): Promise<InterviewSession> {
  enforceRateLimit(
    answerTimes,
    `${centerId}:${studentId}`,
    ANSWER_RATE_LIMIT,
    "Bir daqiqada 20 tadan ortiq javob yuborib bo'lmaydi",
  );
  const session = await findOwnedSession(centerId, studentId, sessionId);
  if (session.status !== "IN_PROGRESS") {
    throw new AppError(409, "Intervyu allaqachon yakunlangan", API_ERROR_CODES.CONFLICT);
  }
  const turns = parseTurns(session.turns);
  const currentIndex = turns.findIndex((turn) => turn.answer === null);
  const current = turns[currentIndex];
  if (!current) {
    throw new AppError(409, "Javob kutilayotgan savol topilmadi", API_ERROR_CODES.CONFLICT);
  }
  if (current.kind === "theory" && body.answer.length > INTERVIEW_ANSWER_MAX) {
    throw new AppError(
      400,
      "Nazariy javob 2000 belgidan oshmasligi kerak",
      API_ERROR_CODES.VALIDATION_ERROR,
    );
  }
  const track = parseTrack(session.track);
  const [platformPrompt, centerPrompt] = await Promise.all([
    settingsRepository.findPlatformPrompt(),
    settingsRepository.findCenterPrompt(centerId),
  ]);
  const prompt = combinedPrompt(platformPrompt, centerPrompt);
  const provider = createAiProvider();
  const evaluation = await provider.interviewEvaluate({
    skill: session.skill?.key ?? null,
    track,
    level: session.level as InterviewLevel,
    kind: current.kind,
    language: current.language,
    starterCode: current.starterCode,
    question: current.question,
    answer: body.answer,
    platformPrompt: prompt,
  });
  const answeredTurn: InterviewTurn = {
    ...current,
    answer: body.answer,
    score: evaluation.score,
    feedback: evaluation.feedback,
    modelAnswer: evaluation.modelAnswer,
    answeredAt: new Date().toISOString(),
  };
  const updatedTurns = [...turns];
  updatedTurns[currentIndex] = answeredTurn;
  const answered = updatedTurns.filter(
    (turn): turn is InterviewTurn & { answer: string; score: number } =>
      turn.answer !== null && turn.score !== null,
  );

  if (answered.length < session.questionCount) {
    const nextIndex = updatedTurns.length;
    const question = await provider.interviewQuestion({
      skill: session.skill?.key ?? null,
      topic: session.skill?.topic.title ?? null,
      track,
      topics: INTERVIEW_TRACK_TOPICS[track],
      kind: questionKind(nextIndex),
      languages: INTERVIEW_TRACK_LANGUAGES[track],
      level: session.level as InterviewLevel,
      index: nextIndex,
      total: session.questionCount,
      previous: answered.map((turn) => ({
        question: turn.question,
        answer: turn.answer,
        score: turn.score,
      })),
      platformPrompt: prompt,
    });
    updatedTurns.push(createTurn(track, nextIndex, question));
    const saved = await interviewRepository.saveTurns(centerId, studentId, sessionId, updatedTurns);
    if (saved.count === 0) {
      throw new AppError(409, "Intervyu holati o'zgargan", API_ERROR_CODES.CONFLICT);
    }
    return getSession(centerId, studentId, sessionId);
  }

  const score = Math.round(answered.reduce((sum, turn) => sum + turn.score, 0) / answered.length);
  const summary = await provider.interviewSummary({
    skill: session.skill?.key ?? null,
    track,
    turns: answered.map((turn) => ({
      question: turn.question,
      answer: turn.answer,
      score: turn.score,
    })),
    platformPrompt: prompt,
  });
  const finished = await interviewRepository.finishSession(centerId, studentId, sessionId, {
    turns: updatedTurns,
    score,
    summary: summary.summary,
    strengths: summary.strengths,
    weaknesses: summary.weaknesses,
    finishedAt: new Date(),
  });
  if (finished.count === 0) {
    throw new AppError(409, "Intervyu holati o'zgargan", API_ERROR_CODES.CONFLICT);
  }
  if (session.skillId && session.skill) {
    await sdtService.updateStudentDigitalTwin(centerId, studentId, {
      source: "INTERVIEW",
      label: `AI intervyu: ${session.skill.name} (${score}%)`,
      evidences: [
        {
          skillId: session.skillId,
          evidence: score,
          targeted: false,
          correct: score >= 70,
        },
      ],
      detectedPatternCodes: [],
      cleanSkillIds: [],
    });
    const masteryAfter =
      (await interviewRepository.findStudentMastery(centerId, studentId, session.skillId))
        ?.masteryScore ??
      session.masteryBefore ??
      50;
    await interviewRepository.setMasteryAfter(centerId, studentId, sessionId, masteryAfter);
  }
  return getSession(centerId, studentId, sessionId);
}

export async function abandonInterview(
  centerId: string,
  studentId: string,
  sessionId: string,
): Promise<InterviewSession> {
  const session = await findOwnedSession(centerId, studentId, sessionId);
  if (session.status !== "IN_PROGRESS") {
    throw new AppError(409, "Intervyuni tark etib bo'lmaydi", API_ERROR_CODES.CONFLICT);
  }
  const abandoned = await interviewRepository.abandonSession(centerId, studentId, sessionId);
  if (abandoned.count === 0) {
    throw new AppError(409, "Intervyu holati o'zgargan", API_ERROR_CODES.CONFLICT);
  }
  return getSession(centerId, studentId, sessionId);
}

export async function listStudentSessionsForTeacher(
  centerId: string,
  studentId: string,
): Promise<InterviewListItem[]> {
  if (!(await interviewRepository.findActiveStudent(centerId, studentId))) {
    throw new AppError(404, "O'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return listSessions(centerId, studentId);
}
