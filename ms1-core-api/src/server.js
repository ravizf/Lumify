import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import healthRoutes from "./routes/health.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

app.use("/health", healthRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`MS1 Core API listening on ${port}`);
});
