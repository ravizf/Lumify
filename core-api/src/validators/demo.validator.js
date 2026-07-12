import { z } from "zod";

const answerSchema = z.object({
  question: z.string().min(8),
  text: z.string().optional().default(""),
  audioRef: z.string().optional().nullable(),
  videoRef: z.string().optional().nullable()
});

export const demoReportSchema = z.object({
  user: z.object({
    name: z.string().min(2),
    email: z.string().email()
  }),
  resumeName: z.string().min(3),
  jobDescription: z.string().min(40),
  saveInterviewDna: z.boolean().default(true),
  answers: z.array(answerSchema).min(1)
});
