import {
  ERROR_PATTERN_CODES,
  INTERVIEW_CODE_INDEXES,
  INTERVIEW_QUESTION_COUNT,
  INTERVIEW_TRACK_LANGUAGES,
  INTERVIEW_TRACK_TOPICS,
  INTERVIEW_TRACKS,
  SDT_WEIGHTS,
  SKILL_TIER_THRESHOLDS,
  type InterviewLanguage,
  type InterviewLevel,
  type InterviewQuestionKind,
  type InterviewTrack,
} from "@zexn/shared";
import type { RootCauseInput } from "./AiProvider.js";

/**
 * AI KONTEKST YIG'UVCHI - AI bilan ishlaydigan HAMMA joy (mentor chat, salomlashuv, intervyu, xato ildizi
 * tushuntirish, prompt sinovi) system prompt'ni faqat shu fayldan oladi. Boshqa joyda prompt matni yozilmaydi.
 *
 * Uch qatlam, har doim shu tartibda:
 *   1. SHAXS   - platforma prompt'i (super admin, DB) yoki bo'sh bo'lsa MENTOR_PERSONA (kod), + markaz prompt'i (o'qituvchi, DB)
 *   2. FAKTLAR - ZEXN_FACTS: platforma haqida aniq, o'zgarmas ma'lumot (kodda, shared konstantalardan hisoblanadi)
 *   3. VAZIYAT - hozirgi o'quvchi / kurs / intervyu / xato haqidagi jonli ma'lumot (chaqiruvchi beradi)
 *
 * MockAiProvider.chat `- mavzu | material | url` va `Joriy keyingi qadam: ` qatorlarini o'qiydi - shu shakl o'zgarmaydi;
 * faktlar bloki shuning uchun `*` bilan yoziladi (mock uni mavzu deb o'qimasin).
 */

/* ------------------------------------------------------------------ */
/* 1. Aniq faktlar                                                     */
/* ------------------------------------------------------------------ */

export const ZEXN_FACTS = {
  name: "ZEXN.ai",
  slogan: "Bir sinf. O'ttiz xil yo'l.",
  mission:
    "Har bir o'quvchining bilimidagi bo'shliqni (xato ildizini) skill darajasida aniqlab, unga mos keyingi o'quv qadamini beradigan AI platforma.",
  pilot: "IT Park Xorazm (birinchi pilot markaz)",
  course: {
    title: "Frontend - React",
    level: "React Beginner",
    topicCount: 20,
    topicsPreview:
      "React asoslari, JSX va markup, Component arxitekturasi, Props, Shartli rendering, Ro'yxatlar va key, Interaktivlik va hodisalar, State asoslari, Rendering jarayoni, State yangilanishlari, Obyekt va massiv state, Formalar, State strukturasi, State flow, Reducer, Context, Refs va DOM, Effects, API va custom hooklar",
  },
  roles: {
    student:
      "O'quvchi: test topshiradi, vazifa bajaradi, AI mentor bilan gaplashadi, AI intervyu topshiradi.",
    teacher:
      "O'qituvchi: vazifa beradi va tekshiradi, o'quvchining raqamli egizagini (SDT) ko'radi, maqsadli vazifa yuboradi, izoh yozadi.",
    centerAdmin:
      "Markaz admini: o'quvchi/o'qituvchi/guruhlarni boshqaradi, markaz uchun AI ohangini sozlaydi.",
    superAdmin: "Super admin: platforma markazlari va umumiy AI system prompt'i.",
  },
  modules: [
    "Bilim xaritasi: 20 mavzu, prerequisite graf, har mavzuda test; test natijasidan xato ildizi (zaif prerequisite) topiladi",
    "Vazifalar (assignments): o'qituvchi beradi, o'quvchi topshiradi, o'qituvchi qabul qiladi yoki qaytaradi (ball 0-100)",
    "AI mentor chat: qisqa o'zbekcha javob, kod bloki yuborilsa kod review rejimi",
    "SDT (Student Digital Twin): har o'quvchining skill darajasidagi bilim modeli - kuchli/zaif skill'lar, xato patternlar, keyingi qadam, progress tarixi",
    "AI intervyu: soha bo'yicha 5 savol (3 nazariy + 2 kod), Monaco muharrirda kod, AI baholaydi",
  ],
  sdt: {
    skills:
      "12 skill: JSX, Props, Komponentlar, Ro'yxatlar va key, Shartli rendering, State, State immutability, Hodisalar, Formalar, useEffect, API so'rovlar, Komponent arxitekturasi",
    formula: `yangi mastery = eski * ${SDT_WEIGHTS.historical} + dalil * ${SDT_WEIGHTS.evidence} (maqsadli vazifada ${SDT_WEIGHTS.targetedHistorical} / ${SDT_WEIGHTS.targetedEvidence}); yangi skill prior ${SDT_WEIGHTS.priorMastery}; xato pattern topilsa dalil ${SDT_WEIGHTS.patternEvidence}`,
    tiers: `strong >= ${SKILL_TIER_THRESHOLDS.strong}, weak < ${SKILL_TIER_THRESHOLDS.weak}, o'rtasi developing; confidence = min(1, urinishlar / ${SDT_WEIGHTS.confidenceAttempts})`,
    patterns: ERROR_PATTERN_CODES.join(", "),
    patternNames: {
      DIRECT_STATE_MUTATION:
        "State'ni to'g'ridan-to'g'ri o'zgartirish (user.name = ...; setUser(user))",
      MISSING_KEY_PROP: "map() ichida JSX'ga key berilmagan",
      INDEX_AS_KEY: "key sifatida massiv indeksi ishlatilgan",
      MISSING_EFFECT_DEPS: "useEffect'da dependency massivi yo'q",
      NUMBER_AND_RENDER: "{count && <...>} - 0 ekranga chiqib qoladi",
    },
    sources:
      "Dalil manbalari: test (ATTEMPT), vazifa topshirish (SUBMISSION), o'qituvchi qabul qilishi (REVIEW), AI intervyu (INTERVIEW)",
    nextSteps:
      "Keyingi qadam turlari: TARGETED_TASK (maqsadli vazifa), RETEST (qayta test), REVIEW_MATERIAL (materialni takrorlash)",
  },
  interview: {
    questionCount: INTERVIEW_QUESTION_COUNT,
    codeIndexes: INTERVIEW_CODE_INDEXES.map((i) => i + 1).join(" va "),
    tracks: INTERVIEW_TRACKS.map(
      (track) =>
        `${track}: ${INTERVIEW_TRACK_TOPICS[track]} (tillar: ${INTERVIEW_TRACK_LANGUAGES[track].join(", ")})`,
    ),
  },
} as const;

/** Barcha AI javoblari uchun o'zgarmas til qoidalari */
export const LANGUAGE_RULES = [
  "Faqat o'zbek tilida (lotin), texnik atamalar inglizcha qolishi mumkin.",
  "Uzun chiziq belgilarini ishlatma, oddiy '-' ishlat.",
  "Markdown sarlavha (#), jadval, uzun ro'yxat yo'q. Oddiy matn, kerak bo'lsa 2-3 qisqa bullet.",
  "Kod kerak bo'lsa qisqa kod bloki (```tsx yoki tegishli til), faqat kerakli qismi.",
  "Bilmagan narsani o'ylab topma.",
] as const;

/**
 * Platforma prompt'i bo'sh bo'lganda ishlatiladigan mentor shaxsi (super admin DB'da o'zgartirsa - o'shanisi ustun).
 * Manba: docs/prompts/mentor-system-prompt.md (egasi tasdiqlagan, 2026-09-19).
 */
export const MENTOR_PERSONA = [
  'Sen ZEXN platformasining AI mentorisan. Ismingni aytma, o\'zingni oddiy "mentor" deb tut.',
  "USLUB",
  "- Tirik, iliq, do'stona o'zbek tilida gaplash: xuddi tajribali, sabrli mentor o'z shogirdi bilan gaplashgandek. Rasmiy, quruq ohang yo'q.",
  '- O\'quvchiga "sen" deb murojaat qil, ismi bilan chaqir (kontekstda berilgan).',
  "- Qisqa yoz: odatda 2-5 gap. Uzun ma'ruza o'rniga bitta aniq fikr + bitta kichik qadam.",
  "- Har javobda 1-2 ta emoji ishlat - salomlashganda 👋, g'oya berganda 💡, to'g'ri bo'lsa ✅, xatoni ko'rsatganda 🔍 yoki ⚠️, rag'batlantirganda 🚀 🎯 🙂. Har gapga emas, lekin har xabarda kamida bitta bo'lsin.",
  "- Avval qisqa tan olish yoki maqtov (haqiqiy bo'lsa), keyin mohiyat, oxirida kichik savol yoki keyingi qadam taklifi - suhbat davom etsin.",
  "- Tayyor javobni darrov bermaslikka harakat qil: yo'naltiruvchi savol ber, o'quvchi o'zi topsin. Lekin u qiynalsa yoki aniq so'rasa - to'g'ridan-to'g'ri tushuntir.",
  "- Tushuntirganda kundalik hayotdan sodda o'xshatish ishlat (masalan, state = komponentning xotirasi, props = ota-onadan kelgan sovg'a).",
  "- Xatoni ko'rsatganda ayblama: \"bu yerda kichkina tuzoq bor\" kabi yumshoq ayt, keyin nega xato ekanini va to'g'risini ko'rsat.",
  '- Haqiqiy mentor kabi suhbatni o\'zing ham boshqar: o\'quvchi salomlashsa yoki bo\'sh gap yozsa - hol-ahvol so\'ra ("Ishlar yaxshimi?", "Kecha nima qildik, esingdami?"), keyin bugungi rejani so\'ra: "Bugun nima o\'tamiz - o\'zing aytasanmi yoki men taklif qilaymi?". U "sen ayt" desa - kontekstdagi keyingi qadam yoki eng zaif mavzudan bittasini taklif qil va nega aynan shuni tanlaganingni bir gapda ayt.',
  '- Suhbat o\'rtasida ham vaqti-vaqti bilan tekshirib tur: "Tushunarlimi?", "Davom etamizmi yoki misol keltiraymi?" - lekin har xabarda emas.',
  "- Suhbat oxirida (o'quvchi xayrlashsa) bugun nima o'rganganini 1 gapda eslat va ertangi kichik reja taklif qil.",
  "MAZMUN",
  "- Kontekstda berilgan zaif mavzular va keyingi qadamga tayan: o'quvchi nima so'rasa ham, imkon bo'lsa uni o'z keyingi qadamiga yumshoq yo'naltir.",
  "- Kurs doirasidan tashqari savolga qisqa javob berib, kursga qaytar.",
  '- "Men AI modelman" kabi jumlalar yo\'q.',
].join("\n");

/* ------------------------------------------------------------------ */
/* 2. Umumiy qatlamlar                                                 */
/* ------------------------------------------------------------------ */

/** DB'dan keladigan sozlanadigan prompt'lar (settings.repository). Bo'sh string = sozlanmagan. */
export interface PromptSettings {
  platformPrompt: string;
  centerPrompt: string;
}

export const EMPTY_SETTINGS: PromptSettings = { platformPrompt: "", centerPrompt: "" };

/** ZEXN haqidagi faktlar bloki - har AI chaqiruviga kiradi (qisqa, `*` bilan). */
export function factsBlock(): string {
  return [
    `ZEXN HAQIDA ANIQ MA'LUMOT`,
    `* Platforma: ${ZEXN_FACTS.name}. ${ZEXN_FACTS.mission}`,
    `* Shior: ${ZEXN_FACTS.slogan}. Pilot: ${ZEXN_FACTS.pilot}.`,
    `* Kurs: ${ZEXN_FACTS.course.title} (${ZEXN_FACTS.course.level}), ${ZEXN_FACTS.course.topicCount} mavzu: ${ZEXN_FACTS.course.topicsPreview}.`,
    `* Modullar: ${ZEXN_FACTS.modules.join("; ")}.`,
    `* SDT skill'lari: ${ZEXN_FACTS.sdt.skills}. Darajalar: ${ZEXN_FACTS.sdt.tiers}.`,
    `* SDT formulasi: ${ZEXN_FACTS.sdt.formula}. ${ZEXN_FACTS.sdt.sources}. ${ZEXN_FACTS.sdt.nextSteps}.`,
    `* Xato patternlar: ${Object.entries(ZEXN_FACTS.sdt.patternNames)
      .map(([code, name]) => `${code} = ${name}`)
      .join("; ")}.`,
    `* AI intervyu: ${ZEXN_FACTS.interview.questionCount} savol, ${ZEXN_FACTS.interview.codeIndexes}-savollar kod topshirig'i. Sohalar: ${ZEXN_FACTS.interview.tracks.join(" | ")}.`,
  ].join("\n");
}

function personaLayer(settings: PromptSettings, fallback: string): string[] {
  return [
    settings.platformPrompt.trim() || fallback,
    ...(settings.centerPrompt.trim() ? [settings.centerPrompt.trim()] : []),
  ];
}

function rulesBlock(): string {
  return ["QOIDALAR", ...LANGUAGE_RULES.map((rule) => `* ${rule}`)].join("\n");
}

/* ------------------------------------------------------------------ */
/* 3. Vaziyat kontekstlari                                             */
/* ------------------------------------------------------------------ */

export interface StudentContext {
  fullName: string;
  courseTitle: string;
  weakTopics: Array<{ title: string; material: { title: string; url: string } | null }>;
  nextStepInstruction: string;
  /** SDT xulosasi bo'lsa (ixtiyoriy) - mentor aniq skill'larga tayanadi */
  twin?: {
    overallMastery: number | null;
    strongSkills: string[];
    weakSkills: string[];
    activePatterns: string[];
  };
}

/** Mock provayder o'qiydigan qatorlar shu yerda - shaklni o'zgartirma. */
function studentBlock(student: StudentContext): string[] {
  const weakTopicLines = student.weakTopics.length
    ? student.weakTopics.map(
        ({ title, material }) =>
          `- ${title}${material ? ` | ${material.title} | ${material.url}` : ""}`,
      )
    : ["Zaif mavzu aniqlanmagan."];
  const twin = student.twin;
  const twinLines = twin
    ? [
        `SDT: umumiy mastery ${twin.overallMastery === null ? "hali yo'q" : `${twin.overallMastery}%`}; ` +
          `kuchli: ${twin.strongSkills.join(", ") || "yo'q"}; zaif: ${twin.weakSkills.join(", ") || "yo'q"}; ` +
          `faol xato patternlar: ${twin.activePatterns.join(", ") || "yo'q"}`,
      ]
    : [];
  return [
    "HOZIRGI O'QUVCHI",
    `O'quvchi: ${student.fullName}`,
    `Kurs: ${student.courseTitle}`,
    "Zaif mavzular va materiallar:",
    ...weakTopicLines,
    `Joriy keyingi qadam: ${student.nextStepInstruction}`,
    ...twinLines,
  ];
}

/** Mentor chat: har xabarda. `codeReview` - o'quvchi kod bloki yuborgan. */
export function buildMentorContext(input: {
  settings: PromptSettings;
  student: StudentContext;
  codeReview: boolean;
}): string {
  const parts = [
    ...personaLayer(input.settings, MENTOR_PERSONA),
    factsBlock(),
    ...studentBlock(input.student),
    rulesBlock(),
  ];
  if (input.codeReview) {
    parts.push(
      "KOD REVIEW REJIMI FAOL",
      "Kodni bajarma. Sintaksis, mantiq, React amaliyoti, xavfsizlik va o'qiluvchanlikni tekshir.",
      "Javobni uch qismda ber: Xulosa, Muammolar, Tavsiyalar. Har muammoni aniq kod bo'lagi bilan tushuntir.",
      `Agar quyidagi patternlardan birini ko'rsang, nomini ayt: ${ZEXN_FACTS.sdt.patterns}.`,
    );
  }
  return parts.join("\n");
}

/** Kunlik salomlashuv (T-026): o'quvchi hali hech narsa yozmagan. */
export function buildGreetingContext(input: {
  settings: PromptSettings;
  student: StudentContext;
}): { system: string; message: string; fallback: string } {
  const system = [
    buildMentorContext({ settings: input.settings, student: input.student, codeReview: false }),
    "Bu suhbatning birinchi xabari. O'quvchi hali hech narsa yozmagan.",
  ].join("\n");
  const firstName = input.student.fullName.trim().split(/\s+/)[0] ?? input.student.fullName;
  return {
    system,
    message:
      "[tizim] O'quvchi chatni ochdi. Salomlash, hol-ahvol so'ra, bugungi reja haqida so'ra (o'zi aytadimi yoki sen taklif qilasanmi). 2-3 gap.",
    fallback: `Salom, ${firstName}! 👋 Ishlar yaxshimi? Bugun nima o'tamiz - o'zing aytasanmi yoki men taklif qilaymi? (Keyingi qadaming: ${input.student.nextStepInstruction})`,
  };
}

/* ---------- Intervyu ---------- */

const INTERVIEWER_PERSONA =
  "Sen ZEXN platformasining texnik intervyu oluvchisisan: talabchan, lekin xushmuomala. Savollar amaliy, real ish sharoitidan. Baholash adolatli va tushuntirilgan.";

function interviewBase(
  settings: PromptSettings,
  track: InterviewTrack,
  level: InterviewLevel,
): string[] {
  return [
    ...personaLayer(settings, INTERVIEWER_PERSONA),
    factsBlock(),
    "INTERVYU",
    `Soha: ${track}. Mavzular: ${INTERVIEW_TRACK_TOPICS[track]}.`,
    `Ruxsat etilgan tillar: ${INTERVIEW_TRACK_LANGUAGES[track].join(", ")}.`,
    `Daraja: ${level} (easy - boshlang'ich, medium - junior, hard - middle).`,
    rulesBlock(),
  ];
}

export function buildInterviewQuestionContext(input: {
  settings: PromptSettings;
  track: InterviewTrack;
  level: InterviewLevel;
  kind: InterviewQuestionKind;
  index: number;
  total: number;
  previous: Array<{ question: string; answer: string; score: number }>;
}): { system: string; message: string } {
  const previousLines = input.previous.length
    ? input.previous.map((p, i) => `${i + 1}. ${p.question} -> ball ${p.score}`)
    : ["(hali savol berilmagan)"];
  const shape =
    input.kind === "code"
      ? `{"question": "topshiriq matni (2-4 gap, nima qilish kerak aniq)", "language": "${INTERVIEW_TRACK_LANGUAGES[input.track][0]}", "starterCode": "3-15 qatorlik boshlang'ich kod, ichida // TODO izoh"}`
      : `{"question": "bitta nazariy savol (1-2 gap)"}`;
  const system = [
    ...interviewBase(input.settings, input.track, input.level),
    "FAQAT JSON qaytar, boshqa matn yo'q. Shakl:",
    shape,
  ].join("\n");
  const message = [
    `${input.index + 1}-savol (jami ${input.total}). Tur: ${input.kind === "code" ? "KOD TOPSHIRIG'I" : "NAZARIY"}.`,
    "Oldingi savollar (takrorlama, mavzuni o'zgartir):",
    ...previousLines,
    input.kind === "code"
      ? `Til ro'yxatdan: ${INTERVIEW_TRACK_LANGUAGES[input.track].join(", ")}. Topshiriq 5-10 daqiqada yechiladigan bo'lsin.`
      : "Savol qisqa, javobi 2-5 gapda beriladigan bo'lsin.",
  ].join("\n");
  return { system, message };
}

export function buildInterviewEvaluateContext(input: {
  settings: PromptSettings;
  track: InterviewTrack;
  level: InterviewLevel;
  kind: InterviewQuestionKind;
  language: InterviewLanguage | null;
  question: string;
  answer: string;
}): { system: string; message: string } {
  const criteria =
    input.kind === "code"
      ? "Mezonlar: to'g'rilik (40), chekka holatlar (20), o'qiluvchanlik va nomlash (20), soha amaliyoti - masalan Kotlin'da null-safety, React'da immutability, SQL'da injection (20). Kodni bajarma, o'qib baho ber."
      : "Mezonlar: to'g'rilik (50), to'liqlik (30), aniqlik va misol (20).";
  const system = [
    ...interviewBase(input.settings, input.track, input.level),
    criteria,
    'FAQAT JSON qaytar: {"score": 0-100 butun son, "feedback": "1-2 gap, \\"sen\\" bilan, iliq, aniq nima yaxshi/nima yetishmadi", "modelAnswer": "score < 70 bo\'lsa qisqa to\'g\'ri javob yoki namuna kod, aks holda null"}',
  ].join("\n");
  const message = [
    `Savol${input.language ? ` (${input.language})` : ""}: ${input.question}`,
    "O'quvchi javobi:",
    input.answer,
  ].join("\n");
  return { system, message };
}

export function buildInterviewSummaryContext(input: {
  settings: PromptSettings;
  track: InterviewTrack;
  level: InterviewLevel;
  turns: Array<{ kind: InterviewQuestionKind; question: string; answer: string; score: number }>;
}): { system: string; message: string } {
  const system = [
    ...interviewBase(input.settings, input.track, input.level),
    'FAQAT JSON qaytar: {"summary": "2-3 gap umumiy xulosa, \\"sen\\" bilan", "strengths": ["max 3 ta qisqa"], "weaknesses": ["max 3 ta qisqa, har biri nimani o\'rganish kerakligini aytsin"]}',
  ].join("\n");
  const message = input.turns
    .map(
      (t, i) =>
        `${i + 1}. [${t.kind}] ${t.question}\nJavob: ${t.answer.slice(0, 600)}\nBall: ${t.score}`,
    )
    .join("\n\n");
  return { system, message };
}

/* ---------- Xato ildizi (test tahlili) ---------- */

export function buildRootCauseContext(input: RootCauseInput & { settings?: PromptSettings }): {
  system: string;
  message: string;
} {
  const system = [
    ...personaLayer(input.settings ?? EMPTY_SETTINGS, MENTOR_PERSONA),
    factsBlock(),
    "VAZIFA: test natijasidan xato ildizini o'quvchiga 2-3 gapda tushuntir. Deterministik tahlil zaif prerequisite'ni topgan - shuni tasdiqla yoki (dalil bo'lmasa) mavzuning o'zini takrorlashni ayt.",
    'FAQAT JSON qaytar: {"explanation": "2-3 gap o\'zbekcha", "confidence": 0..1}',
    rulesBlock(),
  ].join("\n");
  const mistakes = input.mistakes.length
    ? input.mistakes.map(
        (m) => `- Savol: ${m.question} | berilgan: ${m.given} | to'g'ri: ${m.correct}`,
      )
    : ["- (xato javoblar ro'yxati bo'sh)"];
  const message = [
    `Mavzu: ${input.topic}`,
    `Zaif prerequisite mavzular: ${input.weakPrerequisites.join(", ") || "topilmadi"}`,
    "Xato javoblar:",
    ...mistakes,
  ].join("\n");
  return { system, message };
}

/* ---------- Prompt sinovi (o'qituvchi / super admin sozlamalari) ---------- */

/** "Sinab ko'rish": saqlanmagan qoralama prompt bilan bitta xabar. O'quvchi konteksti yo'q. */
export function buildPromptTestContext(input: {
  platformPrompt: string;
  draftPrompt: string;
  scope: "center" | "platform";
}): string {
  const settings: PromptSettings =
    input.scope === "platform"
      ? { platformPrompt: input.draftPrompt, centerPrompt: "" }
      : { platformPrompt: input.platformPrompt, centerPrompt: input.draftPrompt };
  return [
    ...personaLayer(settings, MENTOR_PERSONA),
    factsBlock(),
    "SINOV REJIMI: bu o'qituvchi yoki admin promptni sinayapti, o'quvchi konteksti yo'q. Oddiy o'quvchi yozgandek javob ber.",
    rulesBlock(),
  ].join("\n");
}
