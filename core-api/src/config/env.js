export const env = {
  port: process.env.PORT || 4000,
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379"
};
