---
title: Ticket Personas
type: reference
project: general
sources: [ticket-workflow.md]
created: <today>
updated: <today>
---

# Persona Routing

Generic personas (project-agnostic) live in `skills/personas/`. Project-specific personas live in `projects/<project>/personas/` and are resolved from the project's `personas.md` routing table using the ticket's `domain:`.

| Phase | Author persona | Reviewer persona (cross-model) |
|-------|----------------|-------------------------------|
| Research | Business Analyst (`skills/personas/business-analyst.md`) | — |
| Planning | Domain Architect (project `personas.md`; generic fallback `skills/personas/architect.md`) | Business Analyst, on the opposite provider |
| Execution | Engineering persona(s) (project `personas.md` by `domain:`) | Engineering persona(s), on the opposite provider |
| Finalizing | QA Engineer (`skills/personas/qa-engineer.md`) → Engineering persona (ship) | — |
| Curation | Curator (`skills/personas/curator.md`) | — |

| `domain:` | Architect (Planning) | Engineer (Execution) | Order |
|-----------|----------------------|----------------------|-------|
| `frontend` | Frontend Architect | Frontend Engineer | single phase |
| `backend` | Backend Architect | Backend Engineer | single phase |
| `full-stack` | Backend + Frontend Architect | Backend then Frontend Engineer | backend phase first, then frontend |

If a project has not defined a domain architect, Planning falls back to the generic `skills/personas/architect.md` **and must flag this to the user for confirmation** before planning proceeds.

The reviewer pairing and gate mechanics live in [ticket-gates#Cross-Model Review Gate](ticket-gates.md#cross-model-review-gate); provider setup and headless invocation in [providers](providers.md).
