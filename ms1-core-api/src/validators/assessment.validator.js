import { z } from "zod";

export const assessmentSchema = z.object({
  userId: z.string().uuid(),
  resumeId: z.string().uuid(),
  targetRole: z.string().min(2),
  questionTarget: z.number().int().min(5).max(30).optional()
});
