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
      const error = new Error("Please upload a PDF resume.");
      error.statusCode = 400;
      return callback(error);
    }

    callback(null, true);
  }
});

router.post("/", createResume);
router.post("/upload", requireAuth, upload.single("resume"), uploadResume);

export default router;
