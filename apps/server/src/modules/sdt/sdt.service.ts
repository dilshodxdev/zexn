import {
  API_ERROR_CODES,
  classDigitalTwinSchema,
  digitalTwinSchema,
  skillTier,
  studentProgressSchema,
  type AssignNextStepBody,
  type ClassDigitalTwin,
  type CreateTwinNextStepBody,
  type DigitalTwin,
  type SendTwinNoteBody,
  type SkillHistorySource,
  type StudentProgress,
} from "@zexn/shared";
import { AppError } from "../../lib/AppError.js";
import { buildSummary } from "./mastery.js";
import { detectPatterns } from "./pattern-detector.js";
import * as sdtRepository from "./sdt.repository.js";

export interface UpdateStudentDigitalTwinInput {
  source: SkillHistorySource;
  label: string;
  sourceAttemptId?: string;
  sourceSubmissionId?: string;
  evidences: Array<{
    skillId: string;
    evidence: number;
    targeted: boolean;
    correct?: boolean;
  }>;
  detectedPatternCodes: string[];
  cleanSkillIds: string[];
  completeNextStepAssignmentId?: string;
}

export async function updateStudentDigitalTwin(
  centerId: string,
  studentId: string,
  input: UpdateStudentDigitalTwinInput,
): Promise<void> {
  await sdtRepository.updateDigitalTwin(centerId, studentId, input);
}

export async function generateNextSteps(centerId: string, studentId: string): Promise<void> {
  await sdtRepository.generateNextSteps(centerId, studentId);
}

export async function getDigitalTwin(centerId: string, studentId: string): Promise<DigitalTwin> {
  const [membership, course] = await Promise.all([
    sdtRepository.findStudent(centerId, studentId),
    sdtRepository.findActiveCourse(),
  ]);
  if (!membership) {
    throw new AppError(404, "O'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  if (!course) {
    throw new AppError(404, "Faol kurs topilmadi", API_ERROR_CODES.NOT_FOUND);
  }

  const [skills, patterns, nextSteps, recentProgress] = await Promise.all([
    sdtRepository.findSkills(centerId, studentId, course.id),
    sdtRepository.findStudentPatterns(centerId, studentId),
    sdtRepository.findPendingNextSteps(centerId, studentId),
    sdtRepository.findRecentProgress(centerId, studentId),
  ]);
  const cards = skills.map((skill) => {
    const state = skill.studentSkills[0];
    const mastery = state?.masteryScore ?? 50;
    const attempts = state?.attempts ?? 0;
    return {
      id: skill.id,
      key: skill.key,
      name: skill.name,
      topicId: skill.topicId,
      topicTitle: skill.topic.title,
      mastery,
      confidence: state?.confidence ?? 0,
      attempts,
      tier: skillTier(mastery, attempts),
      lastActivityAt: state?.lastActivityAt?.toISOString() ?? null,
    };
  });
  const assessed = cards.filter((card) => card.attempts > 0);
  const strongSkills = cards.filter((card) => card.tier === "strong");
  const developingSkills = cards.filter((card) => card.tier === "developing");
  const weakSkills = cards.filter((card) => card.tier === "weak");
  const unassessedSkills = cards.filter((card) => card.tier === "unassessed");
  const mapPattern = (item: (typeof patterns)[number]) => ({
    id: item.id,
    patternId: item.patternId,
    code: item.pattern.code,
    name: item.pattern.name,
    description: item.pattern.description,
    skillId: item.pattern.skillId,
    skillName: item.pattern.skill.name,
    occurrences: item.occurrences,
    resolvedCount: item.resolvedCount,
    status: item.status,
    lastDetectedAt: item.lastDetectedAt.toISOString(),
  });
  const updatedTimes = skills.flatMap((skill) =>
    skill.studentSkills[0] ? [skill.studentSkills[0].updatedAt.getTime()] : [],
  );

  return digitalTwinSchema.parse({
    student: membership.user,
    course: { ...course, level: "React Beginner" },
    overallMastery:
      assessed.length === 0
        ? null
        : Math.round(assessed.reduce((sum, skill) => sum + skill.mastery, 0) / assessed.length),
    confidence:
      assessed.length === 0
        ? 0
        : assessed.reduce((sum, skill) => sum + skill.confidence, 0) / assessed.length,
    summary: buildSummary(
      strongSkills.map((skill) => skill.name),
      weakSkills.map((skill) => skill.name),
    ),
    strongSkills,
    developingSkills,
    weakSkills,
    unassessedSkills,
    activePatterns: patterns
      .filter((item) => item.status === "ACTIVE" || item.status === "IMPROVING")
      .map(mapPattern),
    resolvedPatterns: patterns.filter((item) => item.status === "RESOLVED").map(mapPattern),
    nextSteps: nextSteps.map((step) => ({
      id: step.id,
      skillId: step.skillId,
      skillName: step.skill?.name,
      actionType: step.actionType,
      priority: step.priority,
      reason: step.reason ?? "",
      instruction: step.instruction,
      status: step.status,
      assignmentId: step.assignmentId,
      createdAt: step.createdAt.toISOString(),
    })),
    recentProgress: recentProgress.map((point) => ({
      id: point.id,
      skillId: point.skillId,
      skillName: point.skill.name,
      previousScore: point.previousScore,
      newScore: point.newScore,
      source: point.source,
      label: point.label,
      createdAt: point.createdAt.toISOString(),
    })),
    updatedAt: updatedTimes.length === 0 ? null : new Date(Math.max(...updatedTimes)).toISOString(),
  });
}

export async function getProgress(centerId: string, studentId: string): Promise<StudentProgress> {
  if (!(await sdtRepository.findStudent(centerId, studentId))) {
    throw new AppError(404, "O'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  const skills = await sdtRepository.findProgress(centerId, studentId);
  return studentProgressSchema.parse({
    skills: skills
      .filter((skill) => skill.histories.length > 0)
      .map((skill) => ({
        skillId: skill.id,
        skillName: skill.name,
        points: [...skill.histories].reverse().map((point) => ({
          score: point.newScore,
          source: point.source,
          label: point.label,
          createdAt: point.createdAt.toISOString(),
        })),
      })),
  });
}

export async function getClassDigitalTwin(centerId: string): Promise<ClassDigitalTwin> {
  const { memberships, studentSkills, studentPatterns } =
    await sdtRepository.findClassDigitalTwinData(centerId);
  const skillsByStudent = new Map<string, typeof studentSkills>();
  const patternsByStudent = new Map<string, typeof studentPatterns>();
  for (const skill of studentSkills) {
    const items = skillsByStudent.get(skill.studentId) ?? [];
    items.push(skill);
    skillsByStudent.set(skill.studentId, items);
  }
  for (const pattern of studentPatterns) {
    const items = patternsByStudent.get(pattern.studentId) ?? [];
    items.push(pattern);
    patternsByStudent.set(pattern.studentId, items);
  }

  const students = memberships.map(({ user }) => {
    const assessed = (skillsByStudent.get(user.id) ?? []).filter((item) => item.attempts > 0);
    const activePatterns = (patternsByStudent.get(user.id) ?? []).filter(
      (item) => item.status === "ACTIVE" || item.status === "IMPROVING",
    );
    const weakest = [...assessed].sort((left, right) => left.masteryScore - right.masteryScore)[0];
    const overallMastery =
      assessed.length === 0
        ? null
        : Math.round(assessed.reduce((sum, item) => sum + item.masteryScore, 0) / assessed.length);
    const confidence =
      assessed.length === 0
        ? 0
        : assessed.reduce((sum, item) => sum + item.confidence, 0) / assessed.length;
    const updatedTimes = [
      ...assessed.map((item) => item.updatedAt.getTime()),
      ...activePatterns.map((item) => item.lastDetectedAt.getTime()),
    ];
    return {
      id: user.id,
      fullName: user.fullName,
      login: user.login,
      overallMastery,
      confidence,
      weakestSkill: weakest
        ? { id: weakest.skillId, name: weakest.skill.name, mastery: weakest.masteryScore }
        : null,
      activePatternCount: activePatterns.length,
      atRisk: (overallMastery !== null && overallMastery < 50) || activePatterns.length >= 2,
      updatedAt:
        updatedTimes.length === 0 ? null : new Date(Math.max(...updatedTimes)).toISOString(),
    };
  });
  students.sort((left, right) => {
    if (left.atRisk !== right.atRisk) return left.atRisk ? -1 : 1;
    if (left.overallMastery === null && right.overallMastery !== null) return 1;
    if (left.overallMastery !== null && right.overallMastery === null) return -1;
    if (left.overallMastery !== right.overallMastery) {
      return (left.overallMastery ?? 0) - (right.overallMastery ?? 0);
    }
    return left.fullName.localeCompare(right.fullName);
  });

  const weakSkillGroups = new Map<
    string,
    { skillId: string; name: string; studentIds: Set<string>; masteryTotal: number }
  >();
  for (const item of studentSkills) {
    if (skillTier(item.masteryScore, item.attempts) !== "weak") continue;
    const group = weakSkillGroups.get(item.skillId) ?? {
      skillId: item.skillId,
      name: item.skill.name,
      studentIds: new Set<string>(),
      masteryTotal: 0,
    };
    if (!group.studentIds.has(item.studentId)) {
      group.studentIds.add(item.studentId);
      group.masteryTotal += item.masteryScore;
    }
    weakSkillGroups.set(item.skillId, group);
  }
  const weakThreshold = students.length === 1 ? 1 : 2;
  const commonWeakSkills = [...weakSkillGroups.values()]
    .filter((group) => group.studentIds.size >= weakThreshold)
    .map((group) => ({
      skillId: group.skillId,
      name: group.name,
      studentCount: group.studentIds.size,
      avgMastery: Math.round(group.masteryTotal / group.studentIds.size),
    }))
    .sort(
      (left, right) =>
        right.studentCount - left.studentCount || left.name.localeCompare(right.name),
    )
    .slice(0, 5);

  const patternGroups = new Map<
    string,
    {
      patternId: string;
      code: string;
      name: string;
      skillId: string;
      skillName: string;
      studentIds: Set<string>;
    }
  >();
  for (const item of studentPatterns) {
    if (item.status !== "ACTIVE" && item.status !== "IMPROVING") continue;
    const group = patternGroups.get(item.patternId) ?? {
      patternId: item.patternId,
      code: item.pattern.code,
      name: item.pattern.name,
      skillId: item.pattern.skillId,
      skillName: item.pattern.skill.name,
      studentIds: new Set<string>(),
    };
    group.studentIds.add(item.studentId);
    patternGroups.set(item.patternId, group);
  }
  const rankedPatterns = [...patternGroups.values()].sort(
    (left, right) =>
      right.studentIds.size - left.studentIds.size || left.name.localeCompare(right.name),
  );
  const commonPatterns = rankedPatterns.slice(0, 5).map((group) => ({
    patternId: group.patternId,
    code: group.code,
    name: group.name,
    studentCount: group.studentIds.size,
  }));

  const recommendedActions: ClassDigitalTwin["recommendedActions"] = [];
  const commonWeakSkill = commonWeakSkills[0];
  if (commonWeakSkill) {
    recommendedActions.push({
      type: "GROUP_LESSON",
      skillId: commonWeakSkill.skillId,
      skillName: commonWeakSkill.name,
      text: `${commonWeakSkill.name} bo'yicha qisqa guruh darsi o'tkazing (${commonWeakSkill.studentCount} o'quvchi)`,
    });
  }
  const commonPattern = rankedPatterns[0];
  if (commonPattern) {
    recommendedActions.push({
      type: "TARGETED_TASKS",
      skillId: commonPattern.skillId,
      skillName: commonPattern.skillName,
      text: `${commonPattern.name} ko'p uchrayapti: ${commonPattern.skillName} bo'yicha maqsadli vazifalar yuboring`,
    });
  }
  const atRiskStudents = students.filter((student) => student.atRisk);
  const riskWeakSkills = new Map<string, { id: string; name: string; count: number }>();
  for (const student of atRiskStudents) {
    if (!student.weakestSkill) continue;
    const item = riskWeakSkills.get(student.weakestSkill.id) ?? {
      id: student.weakestSkill.id,
      name: student.weakestSkill.name,
      count: 0,
    };
    item.count += 1;
    riskWeakSkills.set(item.id, item);
  }
  const riskWeakSkill = [...riskWeakSkills.values()].sort(
    (left, right) => right.count - left.count || left.name.localeCompare(right.name),
  )[0];
  if (riskWeakSkill) {
    recommendedActions.push({
      type: "RETEST",
      skillId: riskWeakSkill.id,
      skillName: riskWeakSkill.name,
      text: `${atRiskStudents.length} o'quvchi xavfda: ${riskWeakSkill.name} testini qayta topshirtiring`,
    });
  }

  return classDigitalTwinSchema.parse({
    students,
    studentsAtRisk: atRiskStudents.length,
    commonWeakSkills,
    commonPatterns,
    recommendedActions,
  });
}

export async function createNextStep(
  centerId: string,
  studentId: string,
  body: CreateTwinNextStepBody,
): Promise<DigitalTwin> {
  const result = await sdtRepository.createManualNextStep(centerId, studentId, {
    ...body,
    reason: body.reason ?? "O'qituvchi tavsiyasi",
  });
  if (result.kind === "student_not_found") {
    throw new AppError(404, "O'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  if (result.kind === "skill_not_found") {
    throw new AppError(400, "Skill topilmadi", API_ERROR_CODES.VALIDATION_ERROR);
  }
  if (result.kind === "conflict") {
    throw new AppError(409, "Bu tavsiya allaqachon mavjud", API_ERROR_CODES.CONFLICT);
  }
  return getDigitalTwin(centerId, studentId);
}

export async function assignNextStep(
  centerId: string,
  studentId: string,
  nextStepId: string,
  createdByUserId: string,
  body: AssignNextStepBody,
): Promise<DigitalTwin> {
  const result = await sdtRepository.assignNextStep(
    centerId,
    studentId,
    nextStepId,
    createdByUserId,
    body.dueInDays,
  );
  if (result.kind === "not_found") {
    throw new AppError(404, "Keyingi qadam topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  if (result.kind === "conflict") {
    throw new AppError(409, "Vazifa allaqachon yuborilgan", API_ERROR_CODES.CONFLICT);
  }
  return getDigitalTwin(centerId, studentId);
}

export async function sendTeacherNote(
  centerId: string,
  studentId: string,
  body: SendTwinNoteBody,
): Promise<DigitalTwin> {
  if (!(await sdtRepository.createTeacherNote(centerId, studentId, body.text))) {
    throw new AppError(404, "O'quvchi topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  return getDigitalTwin(centerId, studentId);
}

export async function onAttemptFinished(
  centerId: string,
  studentId: string,
  input: { attemptId: string; topicScores: Array<{ topicId: string; score: number }> },
): Promise<void> {
  const skills = await sdtRepository.findSkillsByTopicIds(
    input.topicScores.map((item) => item.topicId),
  );
  for (const topicScore of input.topicScores) {
    const topicSkills = skills.filter((skill) => skill.topicId === topicScore.topicId);
    if (topicSkills.length === 0) continue;
    await updateStudentDigitalTwin(centerId, studentId, {
      source: "ATTEMPT",
      label: `Test: ${topicSkills[0]!.topic.title} (${topicScore.score}%)`,
      sourceAttemptId: input.attemptId,
      evidences: topicSkills.map((skill) => ({
        skillId: skill.id,
        evidence: topicScore.score,
        targeted: false,
        correct: topicScore.score >= 70,
      })),
      detectedPatternCodes: [],
      cleanSkillIds: [],
    });
  }
}

export async function onSubmissionSubmitted(
  centerId: string,
  studentId: string,
  input: {
    submissionId: string;
    assignmentId: string;
    content: string;
    skillId: string | null;
    topicId: string | null;
  },
): Promise<void> {
  const detectedPatternCodes = detectPatterns(input.content);
  if (detectedPatternCodes.length === 0) return;
  const assignment = await sdtRepository.findAssignment(centerId, input.assignmentId);
  if (!assignment) {
    throw new AppError(404, "Vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  await updateStudentDigitalTwin(centerId, studentId, {
    source: "SUBMISSION",
    label: `Vazifa topshirildi: ${assignment.title}`,
    sourceSubmissionId: input.submissionId,
    evidences: [],
    detectedPatternCodes,
    cleanSkillIds: [],
  });
}

export async function onSubmissionReviewed(
  centerId: string,
  studentId: string,
  input: {
    submissionId: string;
    assignmentId: string;
    content: string;
    score: number;
    skillId: string | null;
    topicId: string | null;
    targeted: boolean;
  },
): Promise<void> {
  const assignment = await sdtRepository.findAssignment(centerId, input.assignmentId);
  if (!assignment) {
    throw new AppError(404, "Vazifa topilmadi", API_ERROR_CODES.NOT_FOUND);
  }
  const skills = input.skillId
    ? await sdtRepository.findSkillsByIds([input.skillId])
    : input.topicId
      ? await sdtRepository.findSkillsByTopicIds([input.topicId])
      : [];
  const detected = detectPatterns(input.content);
  const detectedPatternSkills = await sdtRepository.findPatternSkills(detected);
  const dirtySkillIds = new Set(detectedPatternSkills.map((pattern) => pattern.skillId));

  await updateStudentDigitalTwin(centerId, studentId, {
    source: "REVIEW",
    label: `Vazifa qabul qilindi: ${assignment.title} (${input.score} ball)`,
    sourceSubmissionId: input.submissionId,
    evidences: skills.map((skill) => ({
      skillId: skill.id,
      evidence: input.score,
      targeted: input.targeted,
      correct: input.score >= 70,
    })),
    detectedPatternCodes: [],
    cleanSkillIds: skills.map((skill) => skill.id).filter((skillId) => !dirtySkillIds.has(skillId)),
    completeNextStepAssignmentId: input.assignmentId,
  });
}
