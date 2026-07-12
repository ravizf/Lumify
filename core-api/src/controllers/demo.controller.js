import { demoReportSchema } from "../validators/demo.validator.js";
import { buildInterviewReport } from "../services/demo.service.js";

export async function createDemoReport(req, res, next) {
  try {
    const payload = demoReportSchema.parse(req.body);
    const report = await buildInterviewReport(payload);
    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
}
