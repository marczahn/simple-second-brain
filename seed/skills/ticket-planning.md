---
title: Ticket Planning
type: workflow
project: general
sources: [ticket-workflow.md]
created: <today>
updated: <today>
---

# Ticket Planning — Phase 2

**Owner:** Domain Architect — resolved from the project's `personas.md` by the ticket's `domain:` (generic fallback `skills/personas/architect.md`).
**Consumes:** a `ready` ticket. **Produces:** an `approved` `plan.md`.
**Shared infra:** [ticket-personas](shared/ticket-personas.md) (routing), [ticket-gates](shared/ticket-gates.md) (review + user gates), [providers](shared/providers.md), [ticket-status-model](shared/ticket-status-model.md), [ticket-conventions](shared/ticket-conventions.md) (knowledge sources, templates). Entry point: [ticket-workflow](ticket-workflow.md).

The architect is **specialized for the ticket's domain** (frontend, backend, or both). For `full-stack` tickets, the Backend and Frontend Architects each own their phase of the plan. If the project has no defined domain architect, fall back to the generic architect **and flag this to the user for confirmation** before planning.

## Steps

1. **Read the ready ticket** (including `domain:` and acceptance criteria) and gather context in the [knowledge-source order](shared/ticket-conventions.md#knowledge-sources): ticket → project guardrails → project docs → llm-wiki → code-intelligence index → code (`grep`). The plan must not propose anything the project's `guardrails.md` forbids.
2. **Write the plan** from `skills/templates/plan-template.md` at the ticket folder's `plan.md`. The plan must be **very detailed, down to code level** — exact files, functions, signatures, commands, and the expected result of each step. Any model or human must be able to execute it cold.
3. **Minimize the change.** Plan the **fewest changes** that satisfy the ticket. No refactorings, renames, cleanups, or improvements unrelated to the task. If something tempting is out of scope, note it as a follow-up, not a step.
4. **Cover behavior impact.** For each change, identify other call sites and behaviors it affects (use the code-intelligence index where available) and plan how those are handled.
5. **Require tests.** Every code change must have a planned automated test — new or adjusted. Name the test files and what each asserts.
6. **Phase `full-stack` plans** with explicit backend and frontend sections so each engineer executes independently.
7. **If ambiguities surface,** stop and check back with the user; do not invent requirements. Record resolved tradeoffs as `decision-*.md`.
8. **Meet the quality bar** ([Minimum Quality Bar](#minimum-quality-bar)), set ticket `planned`, plan `executable`, and link the plan in `ticket-registry.md` (frontmatter + registry, same step).

## Minimum Quality Bar

Before a plan is marked `executable`:

- every acceptance criterion is traceable to one or more steps
- every step has an expected result
- validation is concrete
- scope boundaries are visible
- rollback or recovery is considered for risky steps

## Cross-Model Review Gate

Mandatory, before the user sees the plan — mechanics, the per-ticket reviewer, non-interactive invocation, and findings handling in [ticket-gates#Cross-Model Review Gate](shared/ticket-gates.md#cross-model-review-gate). The reviewer runs on the provider + model recorded on the ticket (`reviewer_provider` / `reviewer_model`).

Phase specifics: the reviewer adopts the **Business Analyst** persona (`skills/personas/business-analyst.md`) and validates the plan against the ticket's problem, scope, and acceptance criteria — surfacing gaps, untestable steps, scope drift, and unhandled risks. Reviewer artifacts: `plan.md`, `ticket.md`, decisions, touched code. It writes findings to the `review-plan.md` ledger and returns only a summary; the Architect reads the ledger to revise the plan. Findings are handled within the **three-round budget** ([ticket-gates#Review round budget](shared/ticket-gates.md#review-round-budget)): round 1 addresses all findings, rounds 2–3 only blocking (`blocker`/`major`), and after round 3 the user decides. When the gate passes (no blocking findings remain), set the plan `peer-reviewed`.

## User Plan Review Gate

After `peer-reviewed`, present the plan to the user; on approval set the plan `approved`. Full gate rules in [ticket-gates#User Plan Review Gate](shared/ticket-gates.md#user-plan-review-gate).

## Boundaries

- Does not write product code or create the worktree.
- Does not edit project wiki pages.
- If planning would require redefining the problem, return the ticket to [ticket-research](ticket-research.md) with new blocking questions.

## Handoff

Plan `approved`, ticket `planned`, user approval recorded (frontmatter + registry) → hand to [ticket-execution](ticket-execution.md).
