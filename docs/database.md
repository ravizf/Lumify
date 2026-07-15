# Database Design

Lumify stores the candidate journey for Milestone 2 interview preparation. The
schema supports users, resumes, target roles, competency intelligence,
interview sessions, text answer attempts, InterviewDNA profile data, feedback,
and learning roadmaps. Some schema entities are reserved for Milestone 3+
features.

```mermaid
erDiagram
  User ||--o{ Resume : uploads
  User ||--o{ TargetRole : targets
  TargetCompany ||--o{ TargetRole : offers
  Resume ||--o{ Skill : extracts
  TargetRole ||--o{ Competency : requires
  Skill ||--o{ Competency : supports
  User ||--o{ Assessment : starts
  Resume ||--o{ Assessment : informs
  TargetRole ||--o{ Assessment : guides
  Assessment ||--o{ CompetencyScore : measures
  Competency ||--o{ CompetencyScore : scores
  Assessment ||--o{ Question : generates
  Question ||--o{ QuestionAttempt : receives
  InterviewSession ||--o{ QuestionAttempt : records
  InterviewSession ||--|| InterviewFeedback : produces
  User ||--|| InterviewDnaMemory : remembers
  Assessment ||--|| LearningRoadmap : creates
  LearningRoadmap ||--o{ RoadmapTask : contains
  User ||--o{ CalendarEvent : schedules
  User ||--o{ Notification : receives
```

## Core Entities

| Entity | Purpose |
| --- | --- |
| User | Candidate account and experience level |
| Resume | Uploaded resume and parsed resume summary |
| TargetCompany | Company the candidate is preparing for |
| TargetRole | Job description, role title, and seniority context |
| Skill | Extracted resume skill with confidence and evidence |
| Competency | Role competency expected for the target job |
| CompetencyScore | Gap score, evidence, and recommendation |
| Assessment | Adaptive evaluation plan for a resume and target role |
| Question | Generated interview or assessment question |
| QuestionAttempt | Candidate answer plus score and feedback |
| Hint | Contextual help for a question |
| InterviewSession | Live or scheduled mock interview |
| InterviewFeedback | Interview Intelligence Report data |
| InterviewDnaMemory | InterviewDNA profile data for personalized progress tracking |
| LearningRoadmap | Personalized preparation plan |
| RoadmapTask | Specific task tied to a competency gap |
| CalendarEvent | Scheduled practice or interview event |
| Notification | Candidate reminder or product update |

The implementation lives in `core-api/prisma/schema.prisma`.

Calendar events, notifications, audio attempts, and video attempts are planned
for Milestone 3+ and are not part of the current Milestone 2 demo workflow.
