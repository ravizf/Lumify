export const env = {
  port: process.env.PORT || 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "lumify-hackathon-demo-secret",
  databaseUrl: process.env.DATABASE_URL,
  agentEngineUrl: process.env.AGENT_ENGINE_URL || "http://localhost:8000",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
};
