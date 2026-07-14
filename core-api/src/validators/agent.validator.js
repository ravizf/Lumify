import { z } from "zod";

export const runAgentSchema = z.object({
  input: z.string().trim().min(1, "input is required")
});
