---
title: Ticket Conventions
type: reference
project: general
sources: [ticket-workflow.md, CLAUDE.md, project-registry.md]
created: <today>
updated: <today>
---

# Ticket Conventions

Shared structural reference for ticketed work: where to read context, what the artifacts are, how things are named, and where mutable state lives.

## Knowledge Sources

Every phase reads context in this order, cheapest and most authoritative first. Stop as soon as the question is answered.

1. **Ticket** — `ticket.md`, plan, and `decision-*.md` in the ticket folder. The work item is the first source of truth for intent and scope.
2. **Project guardrails** — `projects/<project>/guardrails.md`. Prescriptive, human-owned rules the work MUST obey; authoritative over anything the wiki merely describes. Read it before planning or writing code.
3. **Project documentation** — docs inside the project codebase (`docs/`, ADRs under `docs/adr/`, READMEs).
4. **LLM-wiki** — this vault's `projects/<project>/wiki/` pages for architecture, patterns, conventions.
5. **Code-intelligence index** — if one is available ({{CODE_INDEX}}), prefer it for "how/where/what" questions over manual grep+read; it returns verbatim source grouped by file in one call. Strongly recommended (see [add-project](../add-project.md)).
6. **Code** — read the source directly. `grep`/`ripgrep` for text search when the index does not cover the detail.

## Artifact Types

### Ticket
Canonical work item: problem, desired outcome, scope/non-goals, constraints, dependencies, acceptance criteria, clarification state, and `domain:` (`frontend` | `backend` | `full-stack`) — set by the Business Analyst to route the ticket.

### Plan
Executable implementation document for one ticket: exact ordered steps, expected result per step, files/modules/commands involved, validation, rollback, and notes detailed enough for any model or human to execute cold.

### Decision
Records a resolved tradeoff or clarified ambiguity with lasting consequence: the chosen option among alternatives, an accepted risk, or a requirement clarification.

### Review Findings Ledger
The durable output of a Cross-Model Review Gate: one rolling file per phase holding the reviewer's full findings (severity, location, status) and verdict. **Written by the reviewer** (its only write target; the repo stays read-only) and updated in place across the three-round budget — the author records each finding's outcome (`fixed`/`dismissed`) here rather than in the caller's context. The reviewer returns only a brief summary to the caller (verdict + severity counts + this file's path); the detail lives on disk so it survives a crash and is not paraphrased through the caller. See [ticket-gates#Cross-Model Review Gate](ticket-gates.md#cross-model-review-gate).

## Naming

- Ticket folder: `TICKET-123-short-title/`
- Ticket file: `ticket.md` inside the folder
- Plan file: `plan.md` inside the folder (additional plans: `<purpose>-plan.md`)
- Decision files: `decision-<short-title>.md` inside the folder
- Review findings ledgers: `review-plan.md` and `review-code.md` inside the folder (one per phase)

If there is no external ticket ID, use a local ID such as `{{LOCAL_TICKET_PREFIX}}-001`.

## Registry Rules

`ticket-registry.md` is the centralized mutable state for active and completed tickets — ticket id, project, status, clarification status, linked plan, cross-model reviewer (`reviewer_provider` / `reviewer_model`), worktree, last update date. Do not use `CLAUDE.md` as the mutable ticket state store.

**Status is stored in two places and must always agree:** the ticket's `status:` frontmatter and the registry row. Any phase or gate that changes a status updates **both in the same step**, along with `updated:`. Drift between the two is a defect the [lint](../lint.md) skill detects.

## Templates

- `skills/templates/ticket-template.md`
- `skills/templates/plan-template.md`
- `skills/templates/decision-template.md`
- `skills/templates/review-findings-template.md`
