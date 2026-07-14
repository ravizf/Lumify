import { randomUUID } from "node:crypto";
import { PDFParse } from "pdf-parse";
import { isPrismaConnectionError, prisma } from "./prisma.service.js";
import { store } from "./store.service.js";

export async function enqueueResumeAnalysis(payload) {
  return {
    resumeId: randomUUID(),
    status: "queued",
    next: "Agent Engine Resume Analyzer will extract skills and competency evidence.",
    payload
  };
}

export async function saveUploadedResume({ userId, file }) {
  if (!file) {
    const error = new Error("PDF resume is required");
    error.statusCode = 400;
    throw error;
  }

  let resumeText = "";

  try {
    const parser = new PDFParse({ data: file.buffer });
    const parsed = await parser.getText();
    await parser.destroy();
    resumeText = parsed.text.trim();
  } catch (_error) {
    resumeText = `Unable to extract text from ${file.originalname}. Add resume text manually before the demo if this PDF is scanned.`;
  }

  let resume = {
    id: randomUUID(),
    userId,
    resumeText,
    fileName: file.originalname,
    fileUrl: `upload://${file.originalname}`,
    createdAt: new Date().toISOString()
  };

  try {
    resume = await prisma.resume.create({
      data: {
        userId,
        fileUrl: `upload://${file.originalname}`,
        fileName: file.originalname,
        resumeText,
        parsedText: resumeText
      }
    });
  } catch (error) {
    if (!isPrismaConnectionError(error)) {
      throw error;
    }
  }

  store.resumes.push(resume);

  return {
    resume,
    preview: resumeText.slice(0, 1400),
    extraction: {
      characters: resumeText.length,
      status: resumeText.length > 80 ? "extracted" : "needs_review"
    }
  };
}
