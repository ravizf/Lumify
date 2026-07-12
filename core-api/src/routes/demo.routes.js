import { Router } from "express";
import { createDemoReport } from "../controllers/demo.controller.js";

const router = Router();

router.post("/interview-report", createDemoReport);

export default router;
