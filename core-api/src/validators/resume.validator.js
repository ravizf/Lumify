import { z } from "zod";

export const resumeSchema = z.object({
  userId: z.string().uuid(),
  fileUrl: z.string().url(),
  targetRole: z.string().min(2),
  experienceLevel: z.enum(["fresher", "junior", "mid", "senior"])
});
