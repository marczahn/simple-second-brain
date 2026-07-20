---
title: Ticket Research
type: workflow
project: general
sources: [ticket-workflow.md]
created: <today>
updated: <today>
---

# Ticket Research — Phase 1

**Owner:** Business Analyst (`skills/personas/business-analyst.md`)
**Consumes:** user intent or a ticket-system ID. **Produces:** a `ready` `ticket.md` with `domain:` set.
**Shared infra:** [[ticket-status-model]], [[ticket-conventions]] (knowledge sources, naming, registry, templates). Entry point: [[ticket-workflow]].

The goal of this phase is clarity before commitment. No plan, no code — only a well-defined work item. Think deeply about the problem and the shape of the solution before writing.

## Steps

1. **Pull the source.**
   - If a ticket-system ID is provided (matching `{{TICKET_KEY_PATTERN}}`), fetch it via `{{TICKET_ACCESS}}`. Read summary, description, comments, and linked issues.
   - Otherwise, take the user's described task as the input.
2. **Gather context** in the [[ticket-conventions#Knowledge Sources|knowledge-source order]]: ticket → project docs → llm-wiki → code-intelligence index → code (`grep`). Understand what exists, what the change touches, and where the risks are.
3. **Think through problem and solution.** Restate vague goals as observable outcomes. Separate confirmed facts from assumptions. Sketch the solution direction far enough to expose ambiguities — but do not design the implementation (that is Planning).
4. **Create the ticket** from `skills/templates/ticket-template.md` at `projects/<project>/tasks/<TICKET-ID-short-title>/ticket.md`. Fill problem, desired outcome, in/out scope, constraints, dependencies, and **testable** acceptance criteria.
5. **Set `domain:`** — `frontend` (UI/components/styles), `backend` (API/DB/sync), or `full-stack` (both). This routes Planning and Execution.
6. **Clarify ambiguities.** List blocking questions directly in the ticket — short, concrete, decision-oriented. Identify who/what resolves each. Keep the ticket `blocked` while any blocking question is open.
7. **Run the readiness gate.** Mark the ticket `ready` (clarification `resolved`) only when every condition below is true.
8. **Write the status** (`ready`, clarification `resolved`, `domain:`) to **both** the ticket frontmatter and `ticket-registry.md` — same step, with `updated:`.

## Readiness Gate

A ticket is `ready` only if all are true:

- Problem is described in observable terms.
- Desired outcome is concrete.
- Acceptance criteria are testable.
- In-scope work is listed.
- Out-of-scope work is listed.
- Constraints and dependencies are documented.
- Blocking questions are resolved or explicitly deferred.
- The validation approach is known.

If any is missing, the output is not a ticket-ready handoff — it is another clarification pass.

## Boundaries

- Does not write a plan or code.
- Does not create a worktree or branch.
- Does not edit project wiki pages.

## Handoff

Ticket `ready`, clarification `resolved`, `domain:` set, registry updated → hand to [[ticket-planning]].
