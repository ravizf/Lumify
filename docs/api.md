# API

Base URL in local development:

```text
http://localhost:4000
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
  "next": "MS2 Resume Analyzer will extract skills and competency evidence."
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

## Agent Service

`GET /health`

`POST /agents/resume-analyzer`

```json
{
  "resume_id": "resume-id",
  "target_role": "Backend Developer"
}
```
