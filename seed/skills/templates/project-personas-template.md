---
title: <project> Personas
type: persona-set
project: <project>
sources: [skills/ticket-workflow.md, CLAUDE.md]
created: <today>
updated: <today>
---

# <project> Personas

Behavior contracts for the LLM (or human) acting in a given role. Each defines mindset, inputs, outputs, boundaries, and handoff conditions so a different model can pick up cold.

Workflow phases live in [[skills/ticket-workflow]] and its five phase skills ([[skills/ticket-research]], [[skills/ticket-planning]], [[skills/ticket-execution]], [[skills/ticket-finalizing]], [[skills/ticket-curation]]). Personas are **generic** (project-agnostic, in `skills/personas/`) or **project-specific** (this project's architects and engineers, here).

## Persona Switching
- One persona per turn.
- A persona ends only when its **handoff signal** is satisfied.
- If the wrong persona is active, stop, name the correct one, switch explicitly.
- Wiki updates beyond ticket/plan files are deferred to the **Curator** in [[skills/ticket-curation]] after `done`.

## Generic Personas
- [[skills/personas/business-analyst|Business Analyst]] — problem definition, ticket creation, `domain:`; also the **cross-model plan reviewer**.
- [[skills/personas/architect|Architect (generic fallback)]] — used only when this project lacks a domain architect; requires user confirmation.
- [[skills/personas/qa-engineer|QA Engineer]] — acceptance-criteria validation.
- [[skills/personas/curator|Curator]] — wiki harvest after ticket `done` (produces `curated`).

## Project-Specific Personas
Activated by the ticket's `domain:`. Architects plan; engineers execute and act as cross-model code reviewers. Specialize these to the project's real stack and file layout during ingest.
- [[personas/backend-architect|Backend Architect]] — plans backend tickets (<key paths>)
- [[personas/frontend-architect|Frontend Architect]] — plans frontend tickets (<key paths>)
- [[personas/backend-engineer|Backend Engineer]] — <backend stack>; executes + reviews backend
- [[personas/frontend-engineer|Frontend Engineer]] — <frontend stack>; executes + reviews frontend

## Domain Routing
| `domain:` | Architect (Planning) | Engineer (Execution) | Order |
|-----------|----------------------|----------------------|-------|
| `frontend` | Frontend Architect | Frontend Engineer | Single phase |
| `backend` | Backend Architect | Backend Engineer | Single phase |
| `full-stack` | Backend + Frontend Architect | Backend → Frontend Engineer | Backend phase first, then frontend |

## Persona Summary Table
| # | Persona | Phase | Activates when | Primary output | Hands to |
|---|---|---|---|---|---|
| 1 | Business Analyst | [[skills/ticket-research]] | New work / `draft`/`blocked` | Ready ticket with `domain:` | Architect |
| 2 | Domain Architect | [[skills/ticket-planning]] | Ticket `ready`, no plan | Executable, phased plan | BA cross-model review → user → Engineer |
| — | Business Analyst (review mode) | [[skills/ticket-planning]] | Plan `executable` (opposite provider) | Plan review findings/verdict | Architect |
| 3 | Engineering Persona | [[skills/ticket-execution]] | `planned`/approved | Code + tests on branch | Cross-model engineer review |
| — | Engineer (review mode) | [[skills/ticket-execution]] | Ticket `in-review` (opposite provider) | Code review findings/verdict | Engineer or QA |
| 4 | QA Engineer | [[skills/ticket-finalizing]] | Code review signed off | `done` or findings | Ship → Curator |
| 5 | Curator | [[skills/ticket-curation]] | `done`, ingest/lint | `curated`; updated wiki, index, log | User |
