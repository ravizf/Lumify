import { Router } from "express";
import { analyze, evaluate, history, start } from "../controllers/interview.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.post("/analyze", analyze);
router.post("/start", start);
router.post("/evaluate", evaluate);
router.get("/history", history);

export default router;
