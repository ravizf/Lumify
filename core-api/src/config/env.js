export const env = {
  port: process.env.PORT || 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  allowedOrigins: (process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || "lumify-hackathon-demo-secret",
  databaseUrl: process.env.DATABASE_URL,
  agentEngineUrl: process.env.AGENT_ENGINE_URL || "http://localhost:8000",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
};
