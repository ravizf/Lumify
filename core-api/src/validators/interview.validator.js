import { z } from "zod";

export const analyzeSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: z.string().min(40)
});

export const startSchema = z.object({
  sessionId: z.string().uuid()
});

export const evaluateSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  candidateAnswer: z.string().min(10)
});
