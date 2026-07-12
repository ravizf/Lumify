import { resumeSchema } from "../validators/resume.validator.js";
import { enqueueResumeAnalysis } from "../services/resume.service.js";

export async function createResume(req, res, next) {
  try {
    const payload = resumeSchema.parse(req.body);
    const result = await enqueueResumeAnalysis(payload);
    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
}
