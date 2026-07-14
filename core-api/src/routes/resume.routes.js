import { Router } from "express";
import multer from "multer";
import { createResume, uploadResume } from "../controllers/resume.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, callback) {
    if (file.mimetype !== "application/pdf") {
      return callback(new Error("Only PDF resumes are supported"));
    }

    callback(null, true);
  }
});

router.post("/", createResume);
router.post("/upload", requireAuth, upload.single("resume"), uploadResume);

export default router;
