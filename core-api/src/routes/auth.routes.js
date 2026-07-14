import { Router } from "express";
import { login, profile, signup } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", requireAuth, profile);
router.get("/me", requireAuth, profile);

export default router;
