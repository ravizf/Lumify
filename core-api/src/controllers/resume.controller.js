import { resumeSchema } from "../validators/resume.validator.js";
import { enqueueResumeAnalysis, saveUploadedResume } from "../services/resume.service.js";

export async function createResume(req, res, next) {
  try {
    const payload = resumeSchema.parse(req.body);
    const result = await enqueueResumeAnalysis(payload);
    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
}

export async function uploadResume(req, res, next) {
  try {
    const result = await saveUploadedResume({
      userId: req.user.id,
      file: req.file
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
