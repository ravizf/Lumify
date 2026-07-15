# Lumify

AI Interview Intelligence Platform for resume-based interview preparation.

Lumify is an AI-powered interview preparation platform that helps candidates prepare for technical interviews through resume intelligence, competency analysis, AI-powered mock interviews, and personalized InterviewDNA insights.

This repository is currently focused on **Milestone 2**: authentication, frontend-backend communication, resume upload, protected interview analysis, and a working LangGraph agent workflow through the Agent Engine.

## Milestone 2 Status

Completed for Milestone 2:

- React + Vite frontend demo flow
- Express.js Core API
- JWT authentication with bcrypt password hashing
- Protected profile and interview routes
- PDF resume upload using `multer` and `pdf-parse`
- Resume text extraction and preview
- Job description input
- Protected `/api/interview/analyze` endpoint
- Core API to Agent Engine communication
- FastAPI Agent Engine
- LangGraph workflow for interview analysis
- Gemini-compatible Agent Engine integration with deterministic fallback
- Interview session start endpoint
- Answer evaluation endpoint
- Interview history endpoint
- InterviewDNA profile foundation
- Final report UI with match score, strengths, gaps, feedback, and learning recommendations

Not included in Milestone 2:

- Video analysis
- Speech analysis
- MediaPipe
- Redis queues
- pgvector RAG
- Calendar integration
- Notifications
- Recruiter dashboard
- Enterprise features

## Why Lumify?

Unlike traditional interview preparation platforms that focus only on asking questions, Lumify provides an AI-powered interview intelligence experience.

Current Milestone 2 capabilities include:

- Resume Intelligence
- Job Description Analysis
- Competency Gap Analysis
- Personalized Interview Question Generation
- AI Answer Evaluation
- InterviewDNA Profile
- Learning Recommendations
- Interview Intelligence Report

Future capabilities are listed under the Milestone 3+ Future Roadmap.

## Architecture

```text
Frontend (React + Vite)
        |
        v
Core API (Express.js)
        |
        +--> PostgreSQL (Prisma)
        |
        v
Agent Engine (FastAPI + LangGraph)
        |
        v
Gemini AI
        |
        v
Core API
        |
        v
Frontend
```

The Core API owns authentication, resume upload, session state, and frontend-facing endpoints. The Agent Engine owns the AI workflow and can use Gemini when a Gemini API key is configured. If the Agent Engine or Gemini key is unavailable during a demo, Lumify falls back to deterministic local analysis so the hackathon flow remains reliable.

## LangGraph Workflow

Milestone 2 uses the following Agent Engine workflow:

```text
Resume Parser
      |
      v
JD Parser
      |
      v
Skill Extraction
      |
      v
Gap Analysis
      |
      v
Question Generator
```

The workflow returns structured JSON:

```json
{
  "graph": "InterviewAnalysisGraph",
  "poweredBy": "gemini",
  "matchScore": 86,
  "strengths": ["react", "node", "express"],
  "missingSkills": ["docker", "redis"],
  "recommendations": [
    "Learn docker and prepare one resume-backed story."
  ],
  "questions": [
    {
      "question": "Explain docker using a project from your resume.",
      "topic": "docker"
    }
  ]
}
```

## InterviewDNA Module

Lumify includes InterviewDNA as a personalized interview profile module. It captures interview summaries, answer feedback, competency gaps, strengths, and learning recommendations so each user can track progress over time.

Lumify updates the InterviewDNA profile after every interview, allowing users to track their interview progress and receive personalized recommendations.

## Authentication Flow

Lumify uses JWT authentication for protected API access.

1. User registers with name, email, and password.
2. Core API hashes the password using bcrypt.
3. Core API returns a JWT.
4. Frontend stores the JWT for the current demo session.
5. Protected requests include:

```http
Authorization: Bearer <token>
```

Protected routes verify the JWT before allowing resume, interview, profile, or agent workflow requests.

## API Endpoints

Base URL:

```text
http://localhost:4000
```

### Health

#### `GET /health`

Returns Core API health status.

```json
{
  "status": "ok",
  "service": "core-api"
}
```

### Authentication

#### `POST /auth/signup`

Creates a user account and returns a JWT.

Request:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "user-id",
    "name": "Demo User",
    "email": "demo@example.com"
  }
}
```

Alias: `POST /api/auth/signup`

#### `POST /auth/login`

Logs in an existing user and returns a JWT.

Request:

```json
{
  "email": "demo@example.com",
  "password": "secret123"
}
```

Alias: `POST /api/auth/login`

#### `GET /auth/profile`

Protected route. Returns the authenticated user profile.

Aliases:

```text
GET /auth/me
GET /api/auth/profile
GET /api/auth/me
```

### Resume

#### `POST /resume/upload`

Protected route. Uploads a PDF resume, extracts text, saves it to the demo data store, and returns a preview.

Request:

```text
Content-Type: multipart/form-data
Field name: resume
File type: PDF
```

Response:

```json
{
  "resume": {
    "id": "resume-id",
    "userId": "user-id",
    "resumeText": "...",
    "fileName": "resume.pdf",
    "createdAt": "2026-07-15T00:00:00.000Z"
  },
  "preview": "Extracted resume text preview...",
  "extraction": {
    "characters": 1200,
    "status": "extracted"
  }
}
```

Aliases:

```text
POST /api/resume/upload
POST /api/resumes/upload
```

### Interview

#### `POST /api/interview/analyze`

Protected route. This is the main Milestone 2 analysis endpoint.

Flow:

```text
Frontend
  -> Core API
  -> Agent Engine
  -> LangGraph workflow
  -> Gemini API when configured
  -> Core API
  -> Frontend
```

Request:

```json
{
  "resumeId": "resume-id",
  "jobDescription": "We are hiring a full-stack developer with React, Node.js, Docker, Redis, and PostgreSQL experience..."
}
```

Response:

```json
{
  "sessionId": "session-id",
  "graph": "InterviewAnalysisGraph",
  "poweredBy": "gemini",
  "agentFlow": [
    "Resume Parser",
    "JD Parser",
    "Skill Extraction",
    "Gap Analysis",
    "Question Generator",
    "Learning Planner"
  ],
  "matchScore": 86,
  "strengths": ["react", "node", "express"],
  "missingSkills": ["docker", "redis"],
  "recommendations": [
    "Learn docker and prepare one resume-backed story."
  ],
  "questions": [
    {
      "id": "question-id",
      "question": "Explain docker using a project from your resume.",
      "topic": "docker",
      "difficulty": "easy"
    }
  ]
}
```

Alias: `POST /interview/analyze`

#### `POST /api/interview/start`

Protected route. Starts an interview session and returns generated questions.

Request:

```json
{
  "sessionId": "session-id"
}
```

#### `POST /api/interview/evaluate`

Protected route. Evaluates a candidate answer.

Request:

```json
{
  "sessionId": "session-id",
  "questionId": "question-id",
  "candidateAnswer": "I used Docker to package the API and keep deployment consistent across environments."
}
```

Response:

```json
{
  "score": 82,
  "feedback": "Strong answer...",
  "idealAnswer": "A strong answer defines the topic, gives a resume-backed example, and explains one tradeoff.",
  "confidence": 0.86
}
```

#### `GET /api/interview/history`

Protected route. Returns prior interview sessions for the authenticated user.

### Agent Compatibility

#### `POST /api/agent/run`

Protected route added from the Milestone 2 zip as a compatibility endpoint. It runs a Core API LangGraph check and confirms the protected agent workflow path is working. The primary Milestone 2 analysis flow remains `/api/interview/analyze`.

Request:

```json
{
  "input": "React Node Express resume targeting Docker Redis JWT APIs"
}
```

## Agent Engine Endpoints

Base URL:

```text
http://localhost:8000
```

### `GET /health`

Returns Agent Engine health, graph name, configured nodes, and whether Gemini credentials are configured.

### `POST /agents/interview-analysis`

Called by the Core API. Runs the LangGraph interview analysis workflow.

Request:

```json
{
  "resume_text": "Candidate resume text...",
  "job_description": "Target job description..."
}
```

## Setup

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL for Prisma-backed production persistence
- Gemini API key for AI-powered Agent Engine responses

Milestone 2 persists users, resumes, interview sessions, interview questions, and learning roadmap rows through PostgreSQL using Prisma. The Core API still has a deterministic fallback for AI analysis when the Agent Engine or Gemini key is unavailable, but database persistence is part of the working demo path.

### 1. Install Root Dependencies

```bash
npm install
```

### 2. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

### 3. Core API Setup

```bash
cd core-api
cp .env.example .env
npm install
npm run dev
```

Core API URL:

```text
http://localhost:4000
```

Optional Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Agent Engine Setup

```bash
cd agent-engine
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Agent Engine URL:

```text
http://localhost:8000
```

### 5. Run Frontend and Core API from Root

From the repository root:

```bash
npm run dev:api
npm run dev:frontend
```

Run the Agent Engine separately from `agent-engine/`.

## Environment Examples

### `frontend/.env.local`

```env
VITE_API_URL=http://localhost:4000
```

### `core-api/.env`

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-long-random-string
DATABASE_URL=postgresql://user:password@localhost:5432/lumify?schema=public
AGENT_ENGINE_URL=http://localhost:8000
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

### `agent-engine/.env`

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
```

## Folder Structure

```text
Lumify/
  frontend/       React + Vite frontend
  core-api/       Express.js API, auth, resume upload, interview routes
  agent-engine/   FastAPI + LangGraph + Gemini-compatible agent service
  shared/         Shared schemas/constants placeholders
  docs/           Project documentation
  infra/          Deployment and infrastructure files
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React + Vite |
| Styling | CSS, Tailwind-ready UI structure |
| Core API | Express.js |
| Authentication | JWT, bcrypt |
| Validation | Zod, Pydantic |
| Resume Upload | multer, pdf-parse |
| Agent Engine | FastAPI, LangGraph |
| LLM | Gemini API |
| ORM | Prisma |
| Database | PostgreSQL |

## Demo Script

1. Register or log in.
2. Open the dashboard.
3. Upload a PDF resume.
4. Paste a target job description.
5. Run resume analysis.
6. Show the Agent Engine workflow and generated skill gap analysis.
7. Start the AI interview.
8. Answer one or more questions.
9. Generate the Interview Intelligence Report.
10. Show match score, strengths, missing skills, answer feedback, and learning recommendations.

## Milestone 3+ Future Roadmap

Planned after Milestone 2:

- Add seed data and richer database-backed analytics
- Add Gemini-powered answer evaluation in the Agent Engine
- Add richer LangGraph state and conditional edges
- Add speech analysis
- Add video analysis
- Add MediaPipe behavioral signals
- Add Redis queues for longer-running AI jobs
- Add pgvector-based resume and interview memory retrieval
- Add recruiter and mentor dashboards
- Add notifications and calendar integration
- Add production deployment hardening

## Repository

GitHub: [https://github.com/ravizf/Lumify](https://github.com/ravizf/Lumify)

## Built For

Hackathons, AI engineering, agentic AI, software engineering interviews, and career intelligence.
