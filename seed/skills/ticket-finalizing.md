---
title: Ticket Finalizing
type: workflow
project: general
sources: [ticket-workflow.md]
created: <today>
updated: <today>
---

# Ticket Finalizing — Phase 4

**Owners:** QA Engineer (`skills/personas/qa-engineer.md`), then Engineering persona (ship).
**Consumes:** an `in-review`, cross-model-reviewed implementation. **Produces:** a `done`, shipped ticket.
**Shared infra:** [[ticket-status-model]], [[ticket-conventions]] (knowledge sources, registry), [[ticket-worktrees]] (ship stage). Entry point: [[ticket-workflow]].

This phase validates and ships. It ends at `done`. **Knowledge harvesting happens in the separate [[ticket-curation]] phase** — a `done` ticket is not finished until it is `curated`.

## Stage A — QA Engineer

Validates the outcome against the ticket, not the implementation choices.

1. Read the ticket (especially acceptance criteria) and the plan (with deviation notes).
2. Walk **every acceptance criterion** against observed behavior. Run the plan's validation/test commands.
3. Verify ADRs were amended where the plan or deviations imply a behavior change.
4. Record findings on the ticket. Do not fix issues.
5. If every criterion passes → proceed to Ship. Otherwise → set ticket `in-progress` (frontmatter + registry) with explicit findings and return to [[ticket-execution]].

## Stage B — Ship

Runs only after QA passes. Operates in the ticket's worktree on its own branch (see [[ticket-worktrees#Worktree Per Ticket]]). Owned by the Engineering persona.

### Committing

Delegate to the [[commit]] skill: it groups the worktree changes into logical batches and writes conventional-commit messages following the project's convention (recorded in the project's `code-conventions.md`). **Never mention AI assistance in a commit message.** Reference the ticket ID where the convention calls for it; omit it if there is no ticket ID.

### Pushing

Push to `origin` under the same name as the local branch:

```bash
git -C <worktree-path> push -u origin <branch>
```

### {{PR_NOUN}}

Open a {{PR_NOUN}} with `{{HOST_CLI}}`, a short description of what was done and why, and (if configured) a review request from the automated reviewer `{{PR_AUTO_REVIEWER}}`. For example, with GitHub's `gh`:

```bash
gh pr create --title "<one-liner>" --body "<what & why>" --reviewer {{PR_AUTO_REVIEWER}}
```

Drop the `--reviewer` flag if no automated reviewer is configured. If the host has no {{PR_NOUN}} concept, stop after pushing and tell the user.

### Close the phase

Set ticket `done`, plan `done` (frontmatter + registry, same step). **Do not set `curated` here** — that is the Curation phase.

## Boundaries

- QA does not implement fixes or edit wiki pages.
- Ship does not change code behavior — only commits, pushes, and opens the {{PR_NOUN}}. No commit message mentions AI.
- This phase does **not** promote learnings to the wiki — that is [[ticket-curation]].
- Does not remove the worktree — cleanup is manual, by the user.

## Handoff

Ticket `done`, changes committed/pushed, {{PR_NOUN}} open (with auto-review requested if configured), status written to frontmatter + registry → hand to [[ticket-curation]].
