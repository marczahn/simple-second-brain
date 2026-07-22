---
title: {{PR_NOUN}} Review Workflow
type: workflow
project: general
sources: [CLAUDE.md, project-registry.md, skills/personas/principal-engineer-reviewer.md]
created: <today>
updated: <today>
---

# {{PR_NOUN}} Review Workflow

Reviews a {{VCS_HOST}} {{PR_NOUN}} as the [Principal Engineer Reviewer](personas/principal-engineer-reviewer.md), with the linked ticket in mind, and posts findings back — but only after a human picks which findings to post. This is **separate** from the ticket workflow.

> If the user has no forge / no {{PR_NOUN}}s, keep Stage 1 as a **local diff review** that writes the review doc, and drop Stage 2 (posting).

**Trigger:** user gives a {{PR_NOUN}} URL and asks for a review.

Two stages with a hard human gate between them:

- **Stage 1 — Review** produces a checkbox review document. Posts nothing.
- **Human gate** — the user checks the findings worth posting.
- **Stage 2 — Post** comments only the checked findings.

## Prerequisites

- `{{HOST_CLI}}` authenticated for the repo's org.
- Ticket access (`{{TICKET_ACCESS}}`) if a ticket system is used.
- The backing repo checked out locally (resolved path in `project-registry.md`) so the change is read in context, not just as a diff.

## Stage 1 — Review

1. **Parse the URL** → org, repo, number.
2. **Fetch the {{PR_NOUN}}** with `{{HOST_CLI}}` (metadata, full diff, changed files, existing review comments). Record the head SHA → becomes `commit:` in the doc and the target for inline comments.
3. **Resolve the ticket** — match `{{TICKET_KEY_PATTERN}}` in title, then branch, then body; fetch it via `{{TICKET_ACCESS}}`. If none, review code-only and record `ticket: none` — never invent one.
4. **Resolve the project & doc location** — map repo → vault project. Known project + ticket → `projects/<project>/tasks/<TICKET-ID-short-title>/review-{{PR_NOUN}}<n>.md`. Known project, no ticket → `projects/<project>/tasks/{{PR_NOUN}}<n>-review/`. Unknown → `projects/_scratch/` and say where it went.
5. **Read in context** — read changed files in full where hunks are non-trivial, plus a neighbouring example of any pattern touched; read the project's `architecture.md`, `code-conventions.md`, `key-patterns.md`, `architecture-decisions.md`, `testing-conventions.md`, `dependencies.md`. Lean on any `/code-review`-style tooling if available.
6. **Produce findings** across the four dimensions (ticket intent, fit, code quality, test quality). Split into: **Ticket alignment**, **General findings** (post as one summary), **Change-specific findings** (post inline with `path:line`). Each finding: severity (`blocker`/`major`/`minor`/`nit`/`question`), location, problem, concrete fix. Judge tests, not just their presence. Flag only unjustified convention deviations.
7. **Write the doc** from `skills/templates/pr-review-template.md`; every finding an unchecked `- [ ]`. Post nothing. Hand the path to the user.

## Human Gate

The user checks `[x]` the findings to post (and may edit text). Mandatory — Stage 2 never posts unchecked findings.

## Stage 2 — Post (only after the user says go)

1. Re-read the doc; take only `[x]` findings; split into inline vs summary.
2. **Inline comments** for change-specific findings against the head SHA, using `{{HOST_CLI}}` (or the host's REST API). If a line isn't in the diff, fall back to the summary with `path:line` quoted.
3. **One summary comment** for general + ticket-alignment findings, grouped under headings, noting which inline comments were posted.
4. **Close out** — set doc frontmatter `status: posted` + `updated:`; tell the user exactly what was posted. Do not set a formal approve/request-changes state unless asked.

## Notes

- Idempotency: check existing comments first; skip findings already posted verbatim.
- Wiki promotion of insights stays the **Curator**'s job ([ticket-curation](ticket-curation.md)), only if the user asks.
