# API Documentation

Base URLs in local development:

```text
Core API: http://localhost:4000
Agent Engine: http://localhost:8000
```

## Health

`GET /health`

Returns service status.

## Create Resume

`POST /api/resumes`

```json
{
  "userId": "00000000-0000-0000-0000-000000000000",
  "fileUrl": "https://example.com/resume.pdf",
  "targetRole": "Backend Developer",
  "experienceLevel": "fresher"
}
```

Response: `202 Accepted`

```json
{
  "resumeId": "generated-id",
  "status": "queued",
  "next": "Agent Engine Resume Analyzer will extract skills and competency evidence."
}
```

## Create Assessment

`POST /api/assessments`

```json
{
  "userId": "00000000-0000-0000-0000-000000000000",
  "resumeId": "00000000-0000-0000-0000-000000000001",
  "targetRole": "Backend Developer",
  "questionTarget": 10
}
```

Response: `201 Created`

## Agent Engine

`POST /agents/resume-analyzer`

```json
{
  "resume_id": "resume-id",
  "target_role": "Backend Developer"
}
```

Milestone 2 keeps endpoints focused on the implemented interview preparation
flow. Future milestones can add speech/video attempts, richer feedback reports,
roadmap automation, and calendar scheduling without changing the repository
boundaries.

## Demo Interview Report

`POST /api/demo/interview-report`

```json
{
  "user": {
    "name": "Ravi",
    "email": "ravi@example.com"
  },
  "resumeName": "resume.pdf",
  "jobDescription": "Backend role requiring APIs, SQL, auth, Redis, and communication.",
  "saveInterviewDna": true,
  "answers": [
    {
      "question": "Explain your backend experience.",
      "text": "I built APIs with auth and SQL."
    }
  ]
}
```

Returns an `Interview Intelligence Report` with scores, strengths, gaps,
InterviewDNA profile status, roadmap tasks, and learning recommendations.
