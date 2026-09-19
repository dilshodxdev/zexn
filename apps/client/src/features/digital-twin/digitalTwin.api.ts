import { api } from "@/lib/api";
import {
  assignNextStepBodySchema,
  classDigitalTwinSchema,
  createTwinNextStepBodySchema,
  digitalTwinSchema,
  sendTwinNoteBodySchema,
  studentProgressSchema,
  type AssignNextStepBody,
  type ClassDigitalTwin,
  type CreateTwinNextStepBody,
  type DigitalTwin,
  type SendTwinNoteBody,
  type StudentProgress,
} from "@zexn/shared";
import { classFixture, fixtureDigitalTwin, fixtureStudentProgress } from "./twin.fixture";

const isFixture = import.meta.env.VITE_TWIN_FIXTURE === "true";

export async function getDigitalTwin(studentId: string): Promise<DigitalTwin> {
  if (isFixture) {
    const classStudent = classFixture.students.find((student) => student.id === studentId);
    return Promise.resolve({
      ...fixtureDigitalTwin,
      student: {
        ...fixtureDigitalTwin.student,
        id: studentId,
        ...(classStudent ? { fullName: classStudent.fullName, login: classStudent.login } : {}),
      },
      overallMastery: classStudent?.overallMastery ?? fixtureDigitalTwin.overallMastery,
      confidence: classStudent?.confidence ?? fixtureDigitalTwin.confidence,
    });
  }

  const { data } = await api.get(`/digital-twin/${studentId}`);
  return digitalTwinSchema.parse(data);
}

export async function getClassDigitalTwin(): Promise<ClassDigitalTwin> {
  if (isFixture) return Promise.resolve(classFixture);
  const { data } = await api.get("/digital-twin/class");
  return classDigitalTwinSchema.parse(data);
}

export async function getStudentProgress(studentId: string): Promise<StudentProgress> {
  if (isFixture) {
    return Promise.resolve(fixtureStudentProgress);
  }

  const { data } = await api.get(`/digital-twin/${studentId}/progress`);
  return studentProgressSchema.parse(data);
}

export async function createTwinNextStep(
  studentId: string,
  body: CreateTwinNextStepBody,
): Promise<DigitalTwin> {
  const validBody = createTwinNextStepBodySchema.parse(body);

  if (isFixture) {
    return Promise.resolve(fixtureDigitalTwin);
  }

  const { data } = await api.post(`/digital-twin/${studentId}/next-steps`, validBody);
  return digitalTwinSchema.parse(data);
}

export async function assignNextStep(
  studentId: string,
  nextStepId: string,
  body?: AssignNextStepBody,
): Promise<DigitalTwin> {
  const validBody = body ? assignNextStepBodySchema.parse(body) : { dueInDays: 2 };

  if (isFixture) {
    return Promise.resolve({
      ...fixtureDigitalTwin,
      nextSteps: fixtureDigitalTwin.nextSteps.map((step) =>
        step.id === nextStepId ? { ...step, assignmentId: "demo-assignment-1" } : step,
      ),
    });
  }

  const { data } = await api.post(
    `/digital-twin/${studentId}/next-steps/${nextStepId}/assign`,
    validBody,
  );
  return digitalTwinSchema.parse(data);
}

export async function sendTwinNote(
  studentId: string,
  body: SendTwinNoteBody,
): Promise<DigitalTwin> {
  const validBody = sendTwinNoteBodySchema.parse(body);

  if (isFixture) {
    return Promise.resolve(fixtureDigitalTwin);
  }

  const { data } = await api.post(`/digital-twin/${studentId}/notes`, validBody);
  return digitalTwinSchema.parse(data);
}
