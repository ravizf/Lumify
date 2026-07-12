# Security

Milestone 1 documents the intended security posture and adds the first API
hardening choices.

## Planned Controls

| Area | Choice |
| --- | --- |
| Authentication | JWT access tokens |
| Passwords | bcrypt password hashing |
| Request validation | Zod schemas in the Core API |
| HTTP hardening | Helmet middleware |
| Browser access | CORS allowlist through `FRONTEND_ORIGIN` |
| Rate limiting | Redis-backed rate limits |
| Input validation | Validate DTOs before service logic |
| Secrets | Environment variables, never committed |
| File uploads | Validate file type, size, and storage URL |

## Notes

Security is intentionally represented in the repository from Milestone 1 so the
system can grow without reworking its boundaries later. The Core API remains the
trusted persistence boundary; the Agent Engine returns structured outputs that
the Core API validates before writing to PostgreSQL.
