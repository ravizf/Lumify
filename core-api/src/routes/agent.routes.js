import { Router } from "express";
import { runAgent } from "../controllers/agent.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/run", requireAuth, runAgent);

export default router;
