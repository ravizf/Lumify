import {
  analyzeSchema,
  evaluateSchema,
  startSchema
} from "../validators/interview.validator.js";
import {
  analyzeInterview,
  evaluateAnswer,
  interviewHistory,
  startInterview
} from "../services/interview.service.js";

export async function analyze(req, res, next) {
  try {
    const payload = analyzeSchema.parse(req.body);
    res.status(201).json(await analyzeInterview({ userId: req.user.id, ...payload }));
  } catch (error) {
    next(error);
  }
}

export function start(req, res, next) {
  try {
    const payload = startSchema.parse(req.body);
    res.json(startInterview({ userId: req.user.id, ...payload }));
  } catch (error) {
    next(error);
  }
}

export function evaluate(req, res, next) {
  try {
    const payload = evaluateSchema.parse(req.body);
    res.json(evaluateAnswer({ userId: req.user.id, ...payload }));
  } catch (error) {
    next(error);
  }
}

export function history(req, res) {
  res.json({ sessions: interviewHistory(req.user.id) });
}
