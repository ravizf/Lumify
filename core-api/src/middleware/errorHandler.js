import { ZodError } from "zod";

export function errorHandler(error, _req, res, _next) {
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Resume PDF must be 5 MB or smaller." });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues
    });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
}
