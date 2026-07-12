import { assessmentSchema } from "../validators/assessment.validator.js";
import { createAssessmentPlan } from "../services/assessment.service.js";

export async function createAssessment(req, res, next) {
  try {
    const payload = assessmentSchema.parse(req.body);
    const result = await createAssessmentPlan(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
