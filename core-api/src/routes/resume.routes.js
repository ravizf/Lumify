import { Router } from "express";
import { createResume } from "../controllers/resume.controller.js";

const router = Router();

router.post("/", createResume);

export default router;
