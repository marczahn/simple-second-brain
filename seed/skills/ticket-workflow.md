---
title: Ticket Workflow
type: workflow
project: general
sources: [CLAUDE.md, project-registry.md]
created: <today>
updated: <today>
---

# Ticket Workflow

**This skill is the composer for ticketed work — the single entry point. It implements no phase itself.** It resolves the ticket's current state, dispatches to the right phase skill, and enforces the gate at each phase boundary. The actual work lives in the five phase skills; the shared facts each phase needs live in the shared reference files (see [[#Shared References]]) — not here.

When the user starts (or resumes) any ticketed work, start here.

The workflow is designed to be:

- LLM-agnostic — a different model or a human can pick up any phase cold.
- explicit about readiness before the next phase starts.
- explicit about state — every status change is written to **both** the ticket frontmatter and `ticket-registry.md` in the same step (see [[ticket-conventions#Registry Rules]]). Forgetting to advance status is a defect [[lint]] catches.
- separate from long-term project knowledge pages (those are **Curator** territory, promoted only after `done`).

**Whenever** you learn something or make a decision mid-ticket, capture it on the ticket or as a decision page under `projects/<project>/tasks/<ticket>/decision-*.md`. Project wiki pages are only updated in the **Curation** phase, after the ticket is `done`. This avoids documenting decisions that get revoked mid-execution.

## Composition

Each phase is a separate, self-contained skill. This composer runs them in order; each consumes the previous phase's artifact.

| # | Phase skill | Owner persona | Consumes → Produces |
|---|-------------|---------------|---------------------|
| 1 | [[ticket-research]] | Business Analyst | intent / ticket ID → `ticket.md` (`ready`, `domain:` set) |
| 2 | [[ticket-planning]] | Domain Architect | ready ticket → `plan.md` (cross-model reviewed, user-approved) |
| 3 | [[ticket-execution]] | Engineering persona(s) | approved plan → code + tests (cross-model reviewed) |
| 4 | [[ticket-finalizing]] | QA Engineer → Engineering persona (ship) | implementation → `done` ticket, shipped |
| 5 | [[ticket-curation]] | Curator | `done` ticket → `curated` ticket + harvested wiki knowledge |

### How to compose

1. **Locate the ticket** in `ticket-registry.md` and read its `ticket.md` (and `plan.md` if one exists) to determine the current ticket/plan status. For brand-new intent with no ticket yet, treat the status as "none".
2. **Dispatch to the phase skill** that matches the current status (table below). Invoke that skill and follow it to completion — do not inline its steps here.
3. **Enforce the boundary gate** before advancing (cross-model review after Planning and Execution; user approval after plan review — see [[ticket-gates]]).
4. **Write the status transition** to both the ticket frontmatter and the registry at each boundary.
5. **Advance** to the next phase skill and repeat until the ticket is `curated`.
6. **Loop back** when a gate fails: review findings or QA failures return the ticket to an earlier phase skill (e.g. `in-progress` re-enters [[ticket-execution]]). Re-dispatch by the resulting status — never skip a gate on re-entry.

### Status → phase dispatch

| Ticket status | Next action | Phase skill |
|---------------|-------------|-------------|
| none / `draft` | clarify and ready the ticket | [[ticket-research]] |
| `blocked` | resolve the clarification/dependency gap, then re-evaluate | [[ticket-research]] |
| `ready` | plan, cross-model review, user approval | [[ticket-planning]] |
| `planned` | execute the approved plan | [[ticket-execution]] |
| `in-progress` | continue execution (fresh start or after QA/review findings) | [[ticket-execution]] |
| `in-review` | code review passed → QA, ship | [[ticket-finalizing]] |
| `done` | harvest learnings into the wiki | [[ticket-curation]] |
| `curated` / `cancelled` | terminal — nothing to dispatch | — |

A `done` ticket is **not finished** until it is `curated`. Re-invoking the workflow on a `done` ticket resumes at [[ticket-curation]] — this is how a skipped curation is recovered.

The composer only routes and gates; the detailed steps, personas, and acceptance work belong to each phase skill.

## Shared References

The facts every phase needs live in dedicated, self-contained reference files under `skills/shared/`. Each phase skill links directly to the ones it needs — it does not depend on this composer for them.

- [[ticket-status-model]] — ticket, clarification, and plan status vocabularies.
- [[ticket-conventions]] — knowledge-source order, artifact types (ticket/plan/decision), naming, registry rules, templates.
- [[ticket-personas]] — persona routing: generic vs project-specific, `domain:` → architect/engineer mapping.
- [[ticket-gates]] — Cross-Model Review Gate and User Plan Review Gate mechanics and provider pairing.
- [[ticket-worktrees]] — worktree-per-ticket: location, branch naming, creation, env files, cleanup, stale lint.
- [[providers]] — provider/model setup, headless invocation, per-project write permissions.
