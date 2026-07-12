import { randomUUID } from "node:crypto";

export async function createAssessmentPlan(payload) {
  return {
    assessmentId: randomUUID(),
    status: "draft",
    questionTarget: payload.questionTarget ?? 10,
    agent: "adaptive-interview-planner"
  };
}
