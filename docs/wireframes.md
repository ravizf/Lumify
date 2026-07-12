# Wireframes

Theme direction: dark modern interface, high contrast text, restrained accent
colors, 8px card radius, consistent spacing, and product-style density.

Figma file: https://www.figma.com/design/a7vcOuyM9En5rQUo1lJTwV

## Narrative Flow

The eight screens tell the product story instead of showing unrelated
dashboards.

1. Landing
   - Introduces InterviewDNA as an adaptive AI interview coach
   - Shows the feedback loop: resume, target JD, interview, memory, roadmap

2. Upload Resume
   - Candidate uploads a resume
   - UI shows parsing status, extracted skills, and evidence confidence

3. Choose Company
   - Candidate selects a target company and pastes a job description
   - Role expectations become the comparison baseline

4. InterviewDNA Created
   - Product generates a living candidate profile
   - Shows strengths, recurring gaps, target role, and memory readiness

5. Weakness Analysis
   - Competency Intelligence Engine compares resume evidence to the JD
   - Separates existing strengths from missing competencies

6. Learning Roadmap
   - Personalized roadmap tasks are generated from the gap analysis
   - Candidate can schedule next practice

7. AI Mock Interview
   - Adaptive Interview Planner runs a mock interview
   - Supports text, audio, and video answer references

8. Progress Dashboard
   - Interview Intelligence Report updates memory and progress
   - Shows next practice plan, readiness score, and calendar action

## MVP Layering

Layer 1 screens support the complete demo flow from login through report.
Layer 2 screens show simplified InterviewDNA memory, learning roadmap, and
suggested schedule. Layer 3 production features are documented in architecture
and roadmap notes instead of being presented as fully implemented UI.

## Design Tokens

| Token | Value |
| --- | --- |
| Background | `#0c1018` |
| Surface | `#121823` |
| Border | `#293244` |
| Primary text | `#eef4ff` |
| Muted text | `#aab8cc` |
| Accent green | `#57d6a3` |
| Accent blue | `#79b8ff` |
| Warning | `#f6c65b` |

## Figma Layout Notes

Use desktop frames at 1440 x 1024. Use a 12-column layout with 80px margins
and 24px gutters. Every screen should advance the same story: the system
understands the candidate, decides what to ask, evaluates signals, updates
memory, and adapts the next plan.
