---
title: Ticket Curation
type: workflow
project: general
sources: [ticket-workflow.md]
created: <today>
updated: <today>
---

# Ticket Curation — Phase 5

**Owner:** Curator (`skills/personas/curator.md`).
**Consumes:** a `done` ticket. **Produces:** a `curated` ticket + harvested wiki knowledge.
**Shared infra:** [[ticket-status-model]], [[ticket-conventions]] (knowledge sources, registry). Entry point: [[ticket-workflow]].

Curation is a **first-class phase**, not a footnote to shipping. Splitting it out (and giving `done` and `curated` distinct statuses) means a shipped-but-unharvested ticket is visible and resumable: re-invoking [[ticket-workflow]] on a `done` ticket dispatches straight here. The [[lint]] skill flags `done`-but-not-`curated` tickets so nothing quietly falls through.

**Trigger:** a ticket reaches `done`, or the user asks to "curate ticket X" / "harvest the learnings" at any later time.

## Steps

1. **Read the completed work** — the `done` ticket, its `plan.md` (with deviation notes), and all `decision-*.md`.
2. **Decide what is durable.** Separate ticket-local trivia (stays in the ticket folder) from knowledge that future work needs: new patterns, contract/convention choices, accepted tradeoffs, architecture or data-model changes, ADR summaries.
3. **Harvest into the wiki.** Write the durable learnings into the project wiki pages under `projects/<project>/wiki/` (`architecture.md`, `key-patterns.md`, `code-conventions.md`, `data-model.md`, `api.md`, ADR summaries, etc.). Pattern/convention pages get **real code snippets**, not just prose. Reference the codebase by its resolved path; never copy source in.
4. **Bump provenance.** Set `commit:` frontmatter on every project page touched, matching the codebase commit at writing time.
5. **Wire it up.** Update `index.md` for any new/changed page. Update `project-registry.md` if this constitutes a new scan (commit, scan date, page count).
6. **Log it.** Append a `curate` entry to `log.md` describing what was harvested and why.
7. **Close the ticket.** Set ticket `curated` (frontmatter + registry, same step) — terminal.

## Boundaries

- Does not modify ticket/plan files' substance, write code, or validate acceptance criteria.
- Only promotes learnings **after** the ticket is `done` (avoids documenting decisions that got revoked mid-execution).
- Does not remove the worktree — cleanup is manual, by the user.

## Handoff

Ticket `curated`; wiki/index/registry/log updated → terminal. Return control to the user. (Worktree cleanup remains manual, by the user.)
