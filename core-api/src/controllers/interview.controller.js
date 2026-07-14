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

export async function start(req, res, next) {
  try {
    const payload = startSchema.parse(req.body);
    res.json(await startInterview({ userId: req.user.id, ...payload }));
  } catch (error) {
    next(error);
  }
}

export async function evaluate(req, res, next) {
  try {
    const payload = evaluateSchema.parse(req.body);
    res.json(await evaluateAnswer({ userId: req.user.id, ...payload }));
  } catch (error) {
    next(error);
  }
}

export async function history(req, res, next) {
  try {
    res.json({ sessions: await interviewHistory(req.user.id) });
  } catch (error) {
    next(error);
  }
}
