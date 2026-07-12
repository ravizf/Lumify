import { Router } from "express";
import { createAssessment } from "../controllers/assessment.controller.js";

const router = Router();

router.post("/", createAssessment);

export default router;
