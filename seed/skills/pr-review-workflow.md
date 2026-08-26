---
title: {{PR_NOUN}} Review Workflow
type: workflow
project: general
sources: [CLAUDE.md, project-registry.md, skills/personas/principal-engineer-reviewer.md, skills/templates/project-pr-review-strategy-template.md]
created: <today>
updated: <today>
---

# {{PR_NOUN}} Review Workflow

Reviews a {{VCS_HOST}} {{PR_NOUN}} with the linked ticket in mind and posts findings back — but only after a human picks which findings to post. This is **separate** from the ticket workflow.

The review runs as a **lineup** of reviewers, not one generalist. The [Principal Engineer Reviewer](personas/principal-engineer-reviewer.md) is always the **lead**: it builds the lineup, owns the ticket-intent dimension, and consolidates everything into one document. The other members come from the project's {{PR_NOUN}} review strategy (`projects/<project>/pr-review-strategy.md`) — per project and, inside a project, per area (backend / frontend / contract / data / …). Projects without a strategy get a lead-only review.

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
- Optional but strongly preferred: the project's `pr-review-strategy.md`. Without it the review runs lead-only.

## Stage 1 — Review

1. **Parse the URL** → org, repo, number.
2. **Fetch the {{PR_NOUN}}** with `{{HOST_CLI}}` (metadata, full diff, changed files, existing review comments). Record the head SHA → becomes `commit:` in the doc and the target for inline comments.
3. **Resolve the ticket** — match `{{TICKET_KEY_PATTERN}}` in title, then branch, then body; fetch it via `{{TICKET_ACCESS}}`. If none, review code-only and record `ticket: none` — never invent one.
4. **Resolve the project & doc location** — map repo → vault project. Known project + ticket → `projects/<project>/tasks/<TICKET-ID-short-title>/review-{{PR_NOUN}}<n>.md`. Known project, no ticket → `projects/<project>/tasks/{{PR_NOUN}}<n>-review/`. Unknown → `projects/_scratch/` and say where it went.
5. **Resolve the strategy & build the lineup** — read `projects/<project>/pr-review-strategy.md` (seed: `skills/templates/project-pr-review-strategy-template.md`). Classify every changed path through its **Area Map** (unmapped paths → lead, and list them as map gaps). The lineup is the union of: always-on reviewers, every reviewer whose "Runs when" the diff satisfies, and every reviewer pulled in by an **Escalation Trigger**. Each lineup row that does *not* run is recorded `n/a` **with diffstat evidence** — silent omission is banned. **No strategy file:** run lead-only, say so in the doc, and offer to seed one afterwards. Never block on a missing strategy and never write one mid-review — it is human-owned policy, like `guardrails.md`.
6. **Run each reviewer as its own pass** — one reviewer, one context: parallel subagents where the harness supports it, else sequential. Never merge two lenses into one pass. Every reviewer reads the changed files in full where hunks are non-trivial plus a neighbouring example of any pattern touched; reads `guardrails.md` **first** (plus the scoped guardrail note for its area); reads the wiki pages its lineup row names plus the general ones (`architecture.md`, `code-conventions.md`, `key-patterns.md`, `architecture-decisions.md`, `testing-conventions.md`, `dependencies.md`); and returns **checklist verdicts** (`[x]` / `[!]` / `[n/a]` + reason) alongside its findings. Lean on any `/code-review`-style tooling inside a pass. The lead additionally owns what no specialist covers: ticket intent, scope creep, and cross-cutting risk visible only across passes.
7. **Consolidate** — the lead merges the passes: **dedupe** (two reviewers finding the same thing independently → one entry, both named, higher *confidence*, unchanged severity), **attribute** every finding to its reviewer(s), fold systematic nits into one finding, apply the strategy's **calibration**, and resolve disagreements by deciding and recording both positions. Then split into **Ticket alignment**, **General findings** (one summary comment), **Change-specific findings** (inline, with `path:line`). Each finding: severity (`blocker`/`major`/`minor`/`nit`/`question`), location, problem, concrete fix. Judge tests, not just their presence. Flag only unjustified convention deviations.
8. **Write the doc** from `skills/templates/pr-review-template.md`: the lineup table (including every `n/a` row and its evidence), the checklist audit, and every finding as an unchecked `- [ ]`. Post nothing. Hand the path to the user. Note any area-map gap or wrong/missing hot spot as a **proposed** strategy amendment — never edit the strategy yourself.

## Human Gate

The user checks `[x]` the findings to post (and may edit text). Mandatory — Stage 2 never posts unchecked findings.

## Stage 2 — Post (only after the user says go)

1. Re-read the doc; take only `[x]` findings; split into inline vs summary.
2. **Inline comments** for change-specific findings against the head SHA, using `{{HOST_CLI}}` (or the host's REST API). If a line isn't in the diff, fall back to the summary with `path:line` quoted.
3. **One summary comment** for general + ticket-alignment findings, grouped under headings, noting which inline comments were posted.
4. **Close out** — set doc frontmatter `status: posted` + `updated:`; tell the user exactly what was posted. Do not set a formal approve/request-changes state unless asked.

## Notes

- Idempotency: check existing comments first; skip findings already posted verbatim.
- The summary comment names the lineup that ran, so the author sees which lenses the change was held against.
- Wiki promotion of insights stays the **Curator**'s job ([ticket-curation](ticket-curation.md)), only if the user asks.

## Strategy Maintenance

`projects/<project>/pr-review-strategy.md` is prescriptive and human-owned, exactly like `guardrails.md`: seeded at ingest by [add-project](add-project.md), never regenerated by incremental refresh, and never rewritten by a reviewer. Division of labour — the strategy says *how* to review (lineup, area map, checklists, hot spots, calibration); `guardrails.md` and the `wiki/` pages say *what* the rules are. A finding that keeps recurring across {{PR_NOUN}}s belongs in the strategy's **Hot Spots**, or in `guardrails.md` if it is really a rule: propose it at the end of a review and let the human land it.
