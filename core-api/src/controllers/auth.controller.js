import { loginSchema, signupSchema } from "../validators/auth.validator.js";
import * as authService from "../services/auth.service.js";
import { publicUser } from "../services/store.service.js";

export async function signup(req, res, next) {
  try {
    const payload = signupSchema.parse(req.body);
    const result = await authService.signup(payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export function profile(req, res) {
  res.json({ user: publicUser(req.user) });
}
