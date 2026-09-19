import { Prisma } from "@prisma/client";
import type { InterviewLevel, InterviewTrack, InterviewTurn } from "@zexn/shared";
import { prisma } from "../../lib/prisma.js";

const sessionInclude = {
  skill: { include: { topic: { select: { title: true } } } },
} satisfies Prisma.InterviewSessionInclude;

export function findInterviewSkills(centerId: string, studentId: string) {
  return prisma.skill.findMany({
    orderBy: { order: "asc" },
    include: {
      topic: { select: { title: true } },
      studentSkills: { where: { centerId, studentId }, take: 1 },
      interviews: {
        where: { centerId, studentId, track: "frontend", status: "DONE" },
        orderBy: { finishedAt: "desc" },
        select: { score: true },
      },
    },
  });
}

export function findDoneTrackSessions(centerId: string, studentId: string) {
  return prisma.interviewSession.findMany({
    where: { centerId, studentId, status: "DONE" },
    orderBy: { finishedAt: "desc" },
    select: { track: true, score: true, finishedAt: true },
  });
}

export function findSkill(centerId: string, studentId: string, skillId: string) {
  return prisma.skill.findFirst({
    where: { id: skillId },
    include: {
      topic: { select: { title: true } },
      studentSkills: { where: { centerId, studentId }, take: 1 },
    },
  });
}

export function findActiveSession(centerId: string, studentId: string) {
  return prisma.interviewSession.findFirst({
    where: { centerId, studentId, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
}

export function createSession(
  centerId: string,
  studentId: string,
  input: {
    track: InterviewTrack;
    skillId?: string;
    level: InterviewLevel;
    questionCount: number;
    turns: InterviewTurn[];
    masteryBefore: number | null;
  },
) {
  return prisma.interviewSession.create({
    data: {
      centerId,
      studentId,
      track: input.track,
      skillId: input.skillId,
      level: input.level,
      questionCount: input.questionCount,
      turns: input.turns as Prisma.InputJsonValue,
      masteryBefore: input.masteryBefore,
    },
    include: sessionInclude,
  });
}

export function findSession(centerId: string, studentId: string, sessionId: string) {
  return prisma.interviewSession.findFirst({
    where: { id: sessionId, centerId, studentId },
    include: sessionInclude,
  });
}

export function findStudentSessions(centerId: string, studentId: string) {
  return prisma.interviewSession.findMany({
    where: { centerId, studentId },
    orderBy: { startedAt: "desc" },
    include: { skill: { select: { id: true, name: true } } },
  });
}

export function saveTurns(
  centerId: string,
  studentId: string,
  sessionId: string,
  turns: InterviewTurn[],
) {
  return prisma.interviewSession.updateMany({
    where: { id: sessionId, centerId, studentId, status: "IN_PROGRESS" },
    data: { turns: turns as Prisma.InputJsonValue },
  });
}

export function finishSession(
  centerId: string,
  studentId: string,
  sessionId: string,
  input: {
    turns: InterviewTurn[];
    score: number;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    finishedAt: Date;
  },
) {
  return prisma.interviewSession.updateMany({
    where: { id: sessionId, centerId, studentId, status: "IN_PROGRESS" },
    data: {
      turns: input.turns as Prisma.InputJsonValue,
      score: input.score,
      summary: input.summary,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      status: "DONE",
      finishedAt: input.finishedAt,
    },
  });
}

export function setMasteryAfter(
  centerId: string,
  studentId: string,
  sessionId: string,
  masteryAfter: number,
) {
  return prisma.interviewSession.updateMany({
    where: { id: sessionId, centerId, studentId, status: "DONE" },
    data: { masteryAfter },
  });
}

export function findStudentMastery(centerId: string, studentId: string, skillId: string) {
  return prisma.studentSkill.findFirst({
    where: { centerId, studentId, skillId },
    select: { masteryScore: true },
  });
}

export function abandonSession(centerId: string, studentId: string, sessionId: string) {
  return prisma.interviewSession.updateMany({
    where: { id: sessionId, centerId, studentId, status: "IN_PROGRESS" },
    data: { status: "ABANDONED", finishedAt: new Date() },
  });
}

export function findActiveStudent(centerId: string, studentId: string) {
  return prisma.membership.findFirst({
    where: { centerId, userId: studentId, role: "STUDENT", isActive: true },
    select: { id: true },
  });
}
