import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import resumeRoutes from "./routes/resume.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import demoRoutes from "./routes/demo.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = env.port;

app.use(helmet());
app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json({ limit: "2mb" }));

app.use("/health", healthRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/demo", demoRoutes);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Core API listening on ${port}`);
});
