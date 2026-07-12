# Deployment

## Local

Run services individually during development:

```bash
cd frontend && npm install && npm run dev
cd ms1-core-api && npm install && npm run dev
cd ms2-agent-service && pip install -r requirements.txt && uvicorn main:app --reload
```

Or run the Docker skeleton:

```bash
docker compose up --build
```

## Production Direction

1. Build the React app and serve it behind NGINX.
2. Route `/api/*` to MS1 Core API.
3. Route `/agents/*` to MS2 AI Agent.
4. Use managed PostgreSQL with pgvector enabled.
5. Store resume files in object storage.
6. Use GitHub Actions for lint, test, build, and image publishing.
7. Configure secrets for database URL, Gemini API key, JWT signing key, and file storage.
