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

Workflow phases live in [ticket-workflow](../../skills/ticket-workflow.md) and its five phase skills ([ticket-research](../../skills/ticket-research.md), [ticket-planning](../../skills/ticket-planning.md), [ticket-execution](../../skills/ticket-execution.md), [ticket-finalizing](../../skills/ticket-finalizing.md), [ticket-curation](../../skills/ticket-curation.md)). Personas are **generic** (project-agnostic, in `skills/personas/`) or **project-specific** (this project's architects and engineers, here).

## Persona Switching
- One persona per turn.
- A persona ends only when its **handoff signal** is satisfied.
- If the wrong persona is active, stop, name the correct one, switch explicitly.
- Wiki updates beyond ticket/plan files are deferred to the **Curator** in [ticket-curation](../../skills/ticket-curation.md) after `done`.

## Generic Personas
- [Business Analyst](../../skills/personas/business-analyst.md) — problem definition, ticket creation, `domain:`; also the **cross-model plan reviewer**.
- [Architect (generic fallback)](../../skills/personas/architect.md) — used only when this project lacks a domain architect; requires user confirmation.
- [QA Engineer](../../skills/personas/qa-engineer.md) — acceptance-criteria validation.
- [Curator](../../skills/personas/curator.md) — wiki harvest after ticket `done` (produces `curated`).

## Project-Specific Personas
Activated by the ticket's `domain:`. Architects plan; engineers execute and act as cross-model code reviewers. Specialize these to the project's real stack and file layout during ingest.
- [Backend Architect](personas/backend-architect.md) — plans backend tickets (<key paths>)
- [Frontend Architect](personas/frontend-architect.md) — plans frontend tickets (<key paths>)
- [Backend Engineer](personas/backend-engineer.md) — <backend stack>; executes + reviews backend
- [Frontend Engineer](personas/frontend-engineer.md) — <frontend stack>; executes + reviews frontend

## Domain Routing
| `domain:` | Architect (Planning) | Engineer (Execution) | Order |
|-----------|----------------------|----------------------|-------|
| `frontend` | Frontend Architect | Frontend Engineer | Single phase |
| `backend` | Backend Architect | Backend Engineer | Single phase |
| `full-stack` | Backend + Frontend Architect | Backend → Frontend Engineer | Backend phase first, then frontend |

## Persona Summary Table
| # | Persona | Phase | Activates when | Primary output | Hands to |
|---|---|---|---|---|---|
| 1 | Business Analyst | [ticket-research](../../skills/ticket-research.md) | New work / `draft`/`blocked` | Ready ticket with `domain:` | Architect |
| 2 | Domain Architect | [ticket-planning](../../skills/ticket-planning.md) | Ticket `ready`, no plan | Executable, phased plan | BA cross-model review → user → Engineer |
| — | Business Analyst (review mode) | [ticket-planning](../../skills/ticket-planning.md) | Plan `executable` (opposite provider) | Plan review findings/verdict | Architect |
| 3 | Engineering Persona | [ticket-execution](../../skills/ticket-execution.md) | `planned`/approved | Code + tests on branch | Cross-model engineer review |
| — | Engineer (review mode) | [ticket-execution](../../skills/ticket-execution.md) | Ticket `in-review` (opposite provider) | Code review findings/verdict | Engineer or QA |
| 4 | QA Engineer | [ticket-finalizing](../../skills/ticket-finalizing.md) | Code review signed off | `done` or findings | Ship → Curator |
| 5 | Curator | [ticket-curation](../../skills/ticket-curation.md) | `done`, ingest/lint | `curated`; updated wiki, index, log | User |
