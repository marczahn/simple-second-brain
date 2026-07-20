---
title: Ticket Execution
type: workflow
project: general
sources: [ticket-workflow.md]
created: <today>
updated: <today>
---

# Ticket Execution — Phase 3

**Owner:** Engineering persona(s) — resolved from the project's `personas.md` by the ticket's `domain:`.
**Consumes:** an `approved` plan. **Produces:** reviewed code + tests on the ticket's branch, ticket `in-review` → ready for finalizing.
**Shared infra:** [[ticket-worktrees]], [[ticket-gates]] (review + user gates), [[providers]], [[ticket-personas]] (routing), [[ticket-status-model]]. Entry point: [[ticket-workflow]].

For `full-stack` tickets the Backend Engineer executes the backend phase first, then hands to the Frontend Engineer.

## Steps

1. **Confirm the user approved the plan** (see [[ticket-gates#User Plan Review Gate]]). Do not start otherwise.
2. **Check the plan.** If anything is uncertain or no longer fits reality, stop and return to [[ticket-planning]] (or [[ticket-research]] if scope shifts).
3. **Create or reuse the worktree** per [[ticket-worktrees#Worktree Per Ticket]]. All edits happen inside it, on the ticket's branch. Set ticket `in-progress` (frontmatter + registry).
4. **Execute the plan steps** for the active domain phase. Follow project conventions, key patterns, and ADRs — respect the guardrails. Record deviations in `plan.md` as they happen.
5. **Mind behavior impact.** Before and after each change, check whether it affects behavior used elsewhere (code-intelligence index / `grep`). Handle the fallout in scope or escalate.
6. **No code change without automated tests.** Create or adjust tests for every behavior change. Run the plan's validation commands and confirm they pass.
7. **Keep scope tight.** Implement only what the plan specifies — no unrelated refactors. New material tradeoffs become a `decision-*.md`.
8. **Capture ADR-worthy decisions in the project.** When a technical decision made during execution is significant enough to outlive the ticket — a new architectural pattern, a contract/convention choice, an accepted tradeoff future developers must respect — write a new ADR in the project's ADR directory (e.g. `docs/adr/`) following the project's ADR conventions, as part of the same change set. Existing ADRs whose behavior changes are amended in the same change set (see the engineering personas). Use judgment: only decisions genuinely worth recording become ADRs; smaller, ticket-local tradeoffs stay in `decision-*.md`.
9. When all engineering for the domain is complete (both phases, for `full-stack`), **keep the ticket `in-progress`** and proceed to the Cross-Model Review Gate. Do **not** set `in-review` yet — that status means the review has already passed.

## Cross-Model Review Gate

Mandatory, after implementation — mechanics, provider pairing, non-interactive invocation, and findings handling in [[ticket-gates#Cross-Model Review Gate]]. The gate is **part of this phase**: the ticket stays `in-progress` while the review runs, so a ticket resumed at `in-progress` re-enters execution and the gate runs (again) — it is never skipped.

Phase specifics: the reviewer adopts the relevant **Engineering persona(s)** for the ticket's `domain:` (project `personas.md`); for `full-stack`, the Backend and Frontend Engineer personas each review their layer. The review validates the diff against conventions, key patterns, ADRs, behavior impact, scope discipline, and test coverage. Reviewer artifacts: persona file(s), `plan.md`, `ticket.md`, and the diff/branch.

If the review returns **revise**, fold the findings in (or record a deliberate dismissal) and re-run the gate. **Only when the branch is clean and the review verdict is approve**, set the ticket `in-review` (frontmatter + registry) and advance to finalizing.

## Boundaries

- Does not validate against acceptance criteria — that is the QA Engineer in [[ticket-finalizing]].
- Does not update project wiki pages, index, or log.
- Does not remove the worktree — cleanup is manual, by the user.

## Handoff

Branch clean, cross-model review approved, ticket `in-review` (frontmatter + registry) → hand to [[ticket-finalizing]].
