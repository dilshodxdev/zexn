import type {
  InterviewTrackInfo,
  InterviewSkill,
  InterviewSession,
  InterviewListItem,
  InterviewLanguage,
  StartInterviewBody,
  AnswerInterviewBody,
} from "@zexn/shared";

export const MOCK_INTERVIEW_TRACKS: InterviewTrackInfo[] = [
  {
    track: "frontend",
    languages: ["tsx", "typescript", "javascript", "html", "css"],
    interviewCount: 2,
    lastScore: 88,
    bestScore: 92,
  },
  {
    track: "backend",
    languages: ["typescript", "javascript", "python", "sql"],
    interviewCount: 1,
    lastScore: 75,
    bestScore: 75,
  },
  {
    track: "mobile",
    languages: ["dart", "kotlin", "swift"],
    interviewCount: 0,
    lastScore: null,
    bestScore: null,
  },
  {
    track: "fullstack",
    languages: ["typescript", "tsx", "sql"],
    interviewCount: 0,
    lastScore: null,
    bestScore: null,
  },
  {
    track: "android",
    languages: ["kotlin", "java"],
    interviewCount: 0,
    lastScore: null,
    bestScore: null,
  },
  {
    track: "ios",
    languages: ["swift"],
    interviewCount: 0,
    lastScore: null,
    bestScore: null,
  },
];

export const MOCK_INTERVIEW_SKILLS: InterviewSkill[] = [
  {
    id: "skill-jsx",
    key: "jsx",
    name: "JSX va elementlar",
    topicTitle: "React asoslari",
    mastery: 85,
    tier: "strong",
    interviewCount: 2,
    lastScore: 90,
  },
  {
    id: "skill-props",
    key: "props",
    name: "Props va State",
    topicTitle: "React asoslari",
    mastery: 64,
    tier: "developing",
    interviewCount: 1,
    lastScore: 70,
  },
  {
    id: "skill-useeffect",
    key: "useeffect",
    name: "useEffect va hayot sikli",
    topicTitle: "React Hooklari",
    mastery: 38,
    tier: "weak",
    interviewCount: 0,
    lastScore: null,
  },
  {
    id: "skill-forms",
    key: "forms",
    name: "Formalar va boshqariladigan komponentlar",
    topicTitle: "React asoslari",
    mastery: 52,
    tier: "developing",
    interviewCount: 0,
    lastScore: null,
  },
];

export const PRESET_TURNS: Array<{
  kind: "theory" | "code";
  question: string;
  language: InterviewLanguage | null;
  starterCode: string | null;
}> = [
  {
    kind: "theory",
    question:
      "React'da state va props o'rtasidagi asosiy farq nimada? Qaysi biri tashqaridan uzatiladi?",
    language: null,
    starterCode: null,
  },
  {
    kind: "code",
    question:
      "Quyidagi Counter komponentini to'ldiring: tugma bosilganda son 1 ga oshsin va ekranda yangilansin.",
    language: "tsx",
    starterCode:
      "import React, { useState } from 'react';\n\nexport function Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <p>Sanoq: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Oshirish</button>\n    </div>\n  );\n}",
  },
  {
    kind: "theory",
    question:
      "Nega state'ni to'g'ridan-to'g'ri (masalan, state.count = 5) o'zgartirish mumkin emas? Immutability nima uchun muhim?",
    language: null,
    starterCode: null,
  },
  {
    kind: "code",
    question:
      "Foydalanuvchi ismini qabul qilib, 'Salom, [ism]!' yozuvini chiqaruvchi Greeting komponentini yozing.",
    language: "tsx",
    starterCode:
      "import React from 'react';\n\ninterface GreetingProps {\n  name: string;\n}\n\nexport function Greeting({ name }: GreetingProps) {\n  return <h1>Salom, {name}!</h1>;\n}",
  },
  {
    kind: "theory",
    question:
      "Controlled va Uncontrolled komponentlar o'rtasidagi farqni tushuntiring. Ulardan qaysi biri kengroq tavsiya etiladi?",
    language: null,
    starterCode: null,
  },
];

const mockSessionsStore: Record<string, InterviewSession> = {};

// Initial completed session
const initialDoneSession: InterviewSession = {
  id: "session-done-1",
  track: "frontend",
  skill: {
    id: "skill-jsx",
    name: "JSX va elementlar",
    topicTitle: "React asoslari",
  },
  level: "hard",
  status: "DONE",
  questionCount: 5,
  answeredCount: 5,
  turns: PRESET_TURNS.map((pt, idx) => ({
    index: idx + 1,
    kind: pt.kind,
    question: pt.question,
    language: pt.language,
    starterCode: pt.starterCode,
    answer:
      pt.kind === "code"
        ? (pt.starterCode ?? "export default function Component() {}")
        : "React elementlari virtual DOM orqali render qilinadi va samarali yangilanadi.",
    score: pt.kind === "code" ? 85 : 90,
    feedback:
      pt.kind === "code"
        ? "Kod toza va to'g'ri tuzilgan. React komponent sintaksisiga to'liq mos keladi."
        : "Nazariy tushuncha juda to'g'ri va aniq ifodalangan.",
    modelAnswer: null,
    answeredAt: new Date(Date.now() - 3600000 * (5 - idx)).toISOString(),
  })),
  result: {
    score: 88,
    theoryScore: 90,
    codeScore: 85,
    summary: "Frontend dasturlash bo'yicha nazariy va amaliy ko'nikmalaringiz mustahkam darajada.",
    strengths: ["React komponent arxitekturasi", "Immutability tushunchasi"],
    weaknesses: ["Kodni chuqurroq optimallashtirish"],
    masteryBefore: 78,
    masteryAfter: 85,
  },
  startedAt: new Date(Date.now() - 86400000).toISOString(),
  finishedAt: new Date(Date.now() - 86400000 + 900000).toISOString(),
};

mockSessionsStore[initialDoneSession.id] = initialDoneSession;

export function fixtureGetTracks(): InterviewTrackInfo[] {
  return MOCK_INTERVIEW_TRACKS;
}

export function fixtureGetSkills(): InterviewSkill[] {
  return MOCK_INTERVIEW_SKILLS;
}

export function fixtureGetStudentInterviews(): InterviewListItem[] {
  return Object.values(mockSessionsStore)
    .map((s) => ({
      id: s.id,
      track: s.track,
      skill: s.skill ? { id: s.skill.id, name: s.skill.name } : null,
      level: s.level,
      status: s.status,
      answeredCount: s.answeredCount,
      questionCount: s.questionCount,
      score: s.result?.score ?? null,
      startedAt: s.startedAt,
      finishedAt: s.finishedAt,
    }))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

export function fixtureStartInterview(body: StartInterviewBody): InterviewSession {
  // Check active session
  const active = Object.values(mockSessionsStore).find((s) => s.status === "IN_PROGRESS");
  if (active) {
    const err = new Error("Active session already exists") as Error & {
      status?: number;
      meta?: { sessionId: string };
    };
    err.status = 409;
    err.meta = { sessionId: active.id };
    throw err;
  }

  const track = body.track;
  const matchedSkill = body.skillId
    ? (MOCK_INTERVIEW_SKILLS.find((s) => s.id === body.skillId) ?? null)
    : null;

  const level =
    body.level ??
    (matchedSkill
      ? matchedSkill.mastery >= 75
        ? "hard"
        : matchedSkill.mastery >= 60
          ? "medium"
          : "easy"
      : "medium");

  const newId = `session-${Date.now()}`;
  const firstTurnData = PRESET_TURNS[0] ?? {
    kind: "theory" as const,
    question: "Dasturlash sohangizdagi asosiy texnologiyalar haqida so'zlab bering.",
    language: null,
    starterCode: null,
  };

  const session: InterviewSession = {
    id: newId,
    track,
    skill: matchedSkill
      ? {
          id: matchedSkill.id,
          name: matchedSkill.name,
          topicTitle: matchedSkill.topicTitle,
        }
      : null,
    level,
    status: "IN_PROGRESS",
    questionCount: 5,
    answeredCount: 0,
    turns: [
      {
        index: 1,
        kind: firstTurnData.kind,
        question: firstTurnData.question,
        language: firstTurnData.language,
        starterCode: firstTurnData.starterCode,
        answer: null,
        score: null,
        feedback: null,
        modelAnswer: null,
        answeredAt: null,
      },
    ],
    result: null,
    startedAt: new Date().toISOString(),
    finishedAt: null,
  };

  mockSessionsStore[newId] = session;
  return session;
}

export function fixtureGetInterviewSession(sessionId: string): InterviewSession {
  const session = mockSessionsStore[sessionId];
  if (!session) {
    const err = new Error("Session not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  return session;
}

export function fixtureAnswerInterview(
  sessionId: string,
  body: AnswerInterviewBody,
): InterviewSession {
  const session = mockSessionsStore[sessionId];
  if (!session || session.status !== "IN_PROGRESS") {
    const err = new Error("Session not found or not active") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  const currentTurnIndex = session.turns.length - 1;
  const currentTurn = session.turns[currentTurnIndex];
  if (!currentTurn) {
    const err = new Error("Current turn not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }

  // Grade current turn
  const score = Math.floor(Math.random() * 25) + 75; // 75..99
  currentTurn.answer = body.answer;
  currentTurn.score = score;
  currentTurn.feedback =
    currentTurn.kind === "code"
      ? "Kod muvaffaqiyatli tekshirildi. Sintaksis to'g'ri va asosiy funksionallik bajarilgan."
      : "Javobingiz tahlil qilindi. Asosiy tamoyillar to'g'ri keltirilgan.";
  currentTurn.answeredAt = new Date().toISOString();

  if (score < 80) {
    currentTurn.modelAnswer =
      currentTurn.kind === "code"
        ? "// Tavsiya etilgan optimal yechim:\nexport function Solution() {\n  return <div>Toza kod</div>;\n}"
        : "Qo'shimcha: Ushbu holatda toza funksiyalar va doimiy immutability prinsiplariga tayanish kutilgan edi.";
  }

  session.answeredCount = session.turns.length;

  if (session.answeredCount < session.questionCount) {
    // Add next question turn
    const nextTurnData = PRESET_TURNS[session.answeredCount] ?? {
      kind: "theory" as const,
      question: "Keyingi mavzudagi amaliyot haqida ma'lumot bering.",
      language: null,
      starterCode: null,
    };

    session.turns.push({
      index: session.answeredCount + 1,
      kind: nextTurnData.kind,
      question: nextTurnData.question,
      language: nextTurnData.language,
      starterCode: nextTurnData.starterCode,
      answer: null,
      score: null,
      feedback: null,
      modelAnswer: null,
      answeredAt: null,
    });
  } else {
    // All questions answered -> Finalize session
    session.status = "DONE";
    session.finishedAt = new Date().toISOString();

    const theoryTurns = session.turns.filter((t) => t.kind === "theory");
    const codeTurns = session.turns.filter((t) => t.kind === "code");

    const theoryScores = theoryTurns.map((t) => t.score ?? 80);
    const codeScores = codeTurns.map((t) => t.score ?? 80);

    const theoryScore = Math.round(
      theoryScores.reduce((a, b) => a + b, 0) / (theoryScores.length || 1),
    );
    const codeScore = Math.round(codeScores.reduce((a, b) => a + b, 0) / (codeScores.length || 1));
    const overallScore = Math.round(
      session.turns.map((t) => t.score ?? 80).reduce((a, b) => a + b, 0) / session.turns.length,
    );

    let masteryBefore: number | null = null;
    let masteryAfter: number | null = null;

    if (session.skill) {
      const skill = MOCK_INTERVIEW_SKILLS.find((s) => s.id === session.skill?.id);
      const before = skill?.mastery ?? 60;
      const diff =
        overallScore >= 70
          ? Math.round((overallScore - 60) / 4)
          : -Math.round((60 - overallScore) / 4);
      masteryBefore = before;
      masteryAfter = Math.min(100, Math.max(0, before + diff));
    }

    session.result = {
      score: overallScore,
      theoryScore,
      codeScore,
      summary: `${session.track.toUpperCase()} yo'nalishi bo'yicha berilgan nazariy va amaliy savollarga muvaffaqiyatli javob berdingiz.`,
      strengths: ["Nazariy asoslar", "Mantiqiy yondashuv"],
      weaknesses: ["Kodni chuqurroq optimallashtirish"],
      masteryBefore,
      masteryAfter,
    };
  }

  return session;
}

export function fixtureAbandonInterview(sessionId: string): InterviewSession {
  const session = mockSessionsStore[sessionId];
  if (!session) {
    const err = new Error("Session not found") as Error & { status?: number };
    err.status = 404;
    throw err;
  }
  session.status = "ABANDONED";
  session.finishedAt = new Date().toISOString();
  return session;
}

export function fixtureGetTeacherStudentInterviews(_studentId: string): InterviewListItem[] {
  return [
    {
      id: "interview-t-1",
      track: "frontend",
      skill: { id: "skill-props", name: "Props va State" },
      level: "medium",
      status: "DONE",
      answeredCount: 5,
      questionCount: 5,
      score: 76,
      startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      finishedAt: new Date(Date.now() - 86400000 * 2 + 900000).toISOString(),
    },
    {
      id: "interview-t-2",
      track: "backend",
      skill: null,
      level: "hard",
      status: "DONE",
      answeredCount: 5,
      questionCount: 5,
      score: 92,
      startedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      finishedAt: new Date(Date.now() - 86400000 * 5 + 800000).toISOString(),
    },
  ];
}
