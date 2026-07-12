# Deployment

## Local

Run services individually during development:

```bash
cd frontend && npm install && npm run dev
cd core-api && npm install && npm run dev
cd agent-engine && pip install -r requirements.txt && uvicorn main:app --reload
```

Or run the Docker skeleton:

```bash
docker compose up --build
```

## Production Story

```text
Frontend
  -> Vercel
  -> NGINX Gateway
  -> Render Core API
  -> Redis
  -> Render Agent Engine
  -> Gemini API
  -> Managed PostgreSQL
  -> pgvector
```

## Deployment Responsibilities

| Layer | Deployment Target |
| --- | --- |
| Frontend | Vercel static deployment |
| Gateway | NGINX reverse proxy |
| Core API | Render web service |
| Agent Engine | Render web service or worker |
| Redis | Managed Redis or Render Redis |
| Database | Managed PostgreSQL with pgvector |
| AI Provider | Gemini API |

## Environment Variables

```text
DATABASE_URL=
REDIS_URL=
GEMINI_API_KEY=
JWT_SECRET=
FRONTEND_ORIGIN=
```

## Future CI/CD

1. Run frontend build.
2. Run Core API tests and Prisma validation.
3. Run Agent Engine tests.
4. Build Docker images.
5. Deploy frontend to Vercel.
6. Deploy APIs to Render.
