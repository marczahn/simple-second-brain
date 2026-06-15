# Usage

Once your vault is scaffolded, you work by asking your AI tool to run one of the built-in **skills**. Everything
is text, so you can also just edit files directly or describe changes in plain language.

## Add a project

The vault is meant to track multiple projects — most often one per repository. To document a new codebase, call
the **`add-project`** skill (e.g. "add a project", "document repo X", "start tracking `<path>`").

It records the repo by its **resolved path** (never symlinking or copying source into the vault), pins the
current commit, explores the structure/stack/architecture/patterns/tests, and generates the project's wiki pages
and engineering personas specialized to that stack.

## Work a ticket

This is the heart of the system. Call the **`ticket-workflow`** skill with a ticket (or a description of what you
want). You'll be asked for clarification or input whenever something is ambiguous. The lifecycle:

1. **Clarify** — turn vague goals into observable outcomes and testable acceptance criteria.
2. **Plan** — produce an executable, step-by-step plan (always, even for trivial work).
3. **Independent review** — a *different* model reviews the plan and findings are folded in.
4. **Your approval** — nothing is implemented until you approve the plan. Hard gate.
5. **Execute** — work happens inside the ticket's own worktree/branch.
6. **Review** — the diff is checked against conventions, scope, and tests.
7. **QA** — the change is validated against every acceptance criterion.
8. **Curate** — once done, learnings are promoted to the wiki and indexes/logs updated.

## Review a PR / MR

Call the **`pr-review-workflow`** skill with a PR/MR URL. It reviews the change like a principal engineer — with
the linked ticket in mind — and writes a checkbox review document. **It posts nothing** until you check the
findings worth posting; then it posts only those (inline + one summary comment).

## Refresh the wiki for a codebase

Ask to **update** a project. It reads the last scanned commit, runs `git diff` against HEAD, and updates only the
affected pages — it does not re-ingest the whole repo, so your manual additions are preserved.

## Other everyday asks

- **Ingest a source doc** — drop an article/note into `raw/` and ask to process it into a wiki page.
- **Query** — ask a question; the AI reads the index and relevant pages and synthesizes an answer (and may file
  a reusable page).
- **Health check (lint)** — ask for a lint pass to find stale pages, orphans, commit drift, and stale worktrees.

## Customizing it

It's all Markdown — adjust it anytime to your needs. Want to switch ticket systems (Jira → Trello) or code hosts
(GitHub → GitLab)? Just tell your AI tool to do it, and ask for help if needed. If you get stuck somewhere, ask
your AI tool to explain more.
