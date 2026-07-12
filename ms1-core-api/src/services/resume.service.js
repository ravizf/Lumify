import { randomUUID } from "node:crypto";

export async function enqueueResumeAnalysis(payload) {
  return {
    resumeId: randomUUID(),
    status: "queued",
    next: "MS2 Resume Analyzer will extract skills and competency evidence.",
    payload
  };
}
