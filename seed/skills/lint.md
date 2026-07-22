---
title: Lint
type: workflow
project: general
sources: [CLAUDE.md, ticket-registry.md, project-registry.md]
created: <today>
updated: <today>
---

# Lint — Health Check & Reconciliation

A repeatable health check for the vault. Run it when the user asks for a health check, or proactively when things feel out of sync. Report findings, fix what's safe automatically, and surface the rest for the user to decide. Append a `lint` entry to `log.md` describing what was found and fixed.

## 1. Wiki health

- **Contradictions & stale claims** — pages that disagree with each other or with the current code.
- **Orphan pages** — pages under `projects/*/wiki/` or the root with no `index.md` entry and no inbound Markdown link.
- **Missing cross-references** — related pages that should link to each other but don't.
- **Data gaps** — expected project pages that don't exist yet (see `CLAUDE.md` → Project Wiki Sections).
- **Link lint** — cross-references are standard Markdown links; no Obsidian wikilinks should survive: `grep -rnE '\[\[' --include='*.md' .` must return nothing.

## 2. Commit drift

For each project in `project-registry.md`:

- `git -C <repo> log --oneline -1` → compare with the registry's last-scanned commit and each page's `commit:` frontmatter.
- Flag projects whose wiki `commit:` is behind HEAD as candidates for an incremental **Update Codebase** refresh.

## 3. Ticket status reconciliation

This is the safety net for forgotten status transitions:

- **Ticket ↔ registry drift** — for every ticket, the `status:` and `clarification_status:` in `ticket.md` frontmatter must equal the `Status` and `Clarification` columns of its `ticket-registry.md` row. Report any mismatch; the more advanced of the two is usually correct, but confirm before rewriting.
- **Ticket ↔ plan drift** — the ticket's `plan_status:` frontmatter must match the `status:` frontmatter of its `plan.md` (plan status is tracked on the plan file, not in the registry; the registry's `Plan` column only links the plan path). Report mismatches.
- **`done`-but-not-`curated`** — tickets at `done` with no matching `curate` entry in `log.md` and no harvested wiki changes. These are unfinished tails: recommend running [ticket-curation](ticket-curation.md) (re-invoke [ticket-workflow](ticket-workflow.md) on the ticket).
- **Missing reviewer** — tickets at `ready` or beyond with no `reviewer_provider` / `reviewer_model` on the ticket (and an empty registry `Reviewer` column). Flag it: the next cross-model gate would otherwise stop to ask. The recorded reviewer should also be a different provider than the one driving the work.
- **Registry rows with no ticket folder** (or vice versa) — orphaned state.
- **Stuck tickets** — `in-progress`/`in-review` with an `updated:` date far in the past.

## 4. Stale worktrees

Run the check from [ticket-worktrees#Stale worktree lint](shared/ticket-worktrees.md#stale-worktree-lint):

- worktree directories with no matching ticket;
- worktree directories whose ticket is `done`, `curated`, or `cancelled` (removal candidates);
- tickets with `Worktree` set in the registry but no directory on disk.

## 5. Report & fix

- Group findings by section; mark each as **auto-fixed**, **needs user decision**, or **info**.
- Auto-fix only the safe, unambiguous ones (e.g. add a missing `index.md` entry, correct an anchor link). Never rewrite ticket status or delete a worktree without user confirmation.
- Append a `lint` entry to `log.md`.
