import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import interviewRoutes from "./routes/interview.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = env.port;

app.use(helmet());
app.use(cors({ origin: env.allowedOrigins }));
app.use(express.json({ limit: "2mb" }));

app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/agent", agentRoutes);
app.use("/resume", resumeRoutes);
app.use("/interview", interviewRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Core API listening on ${port}`);
});
