# Getting Started

Setup is a single **run-once** prompt. You paste [`init-prompt.md`](../init-prompt.md) into an AI coding tool,
answer a short interview, and it scaffolds the whole vault for you.

## Prerequisites

- **An agentic AI coding tool** — e.g. Claude Code, OpenAI Codex CLI, Gemini CLI, Cursor, aider. This is your
  *primary* driver.
- **`git`** — the default ticket workflow uses one isolated worktree per ticket. (Not on git? Tell the prompt
  during the interview and it swaps in a plain branch-per-ticket flow.)
- **Ideally a second model provider** — for the cross-provider plan-review gate. Cross-*family* matters more
  than cross-vendor (Claude ↔ GPT ↔ Gemini ↔ a strong open model are good pairings). If you only have one
  provider, that's fine — the gate degrades gracefully.

Optional but recommended:

- **A code-host CLI** — `gh` (GitHub) or `glab` (GitLab), authenticated, for the PR/MR review workflow.
- **A ticket system** — Jira, GitHub/GitLab Issues, Linear, … reachable via MCP, a CLI, or its API. No ticket
  system? The vault uses local Markdown tickets (`TASK-001`).
- **[Obsidian](https://obsidian.md)** — for `[[wikilinks]]` and graph view. The vault is just Markdown, so any
  editor works.

## Steps

1. Pick (or create) an **empty directory** for your vault — somewhere synced/backed-up (iCloud, Dropbox, a
   private git repo). This is **separate from this repo**; the vault is not created here.
2. Open your AI coding tool with that directory as its working directory.
3. Paste the full contents of [`init-prompt.md`](../init-prompt.md) and run it.
4. Answer the interview (below). Defaults are offered everywhere — "pick a sensible default" is a valid answer.
5. Review and approve the **settings block** it echoes back before it writes anything.
6. It scaffolds the vault, runs a verification checklist, and then retires the prompt (moves it into `raw/` or
   deletes it). Its job is done; the generated `CLAUDE.md` now governs the vault.

## The interview (what you'll be asked)

Have rough answers ready for these — each comes with advice and a default during the interview:

1. **Vault location & name** — where it lives, what it's called.
2. **LLM providers** — your primary model, and at least one *different* model for the review gate.
3. **Version control** — usually `git`; your default branch (`main`/`master`/`trunk`).
4. **Code host** — GitHub / GitLab / Bitbucket / … and whether you have its CLI (`gh`/`glab`) authenticated.
5. **Plan-review pairing** — which model reviews plans, and how it's invoked.
6. **Ticket system** — which one (or none), the ticket-ID pattern, and how to reach it.
7. **Worktree & env conventions** — where per-ticket worktrees live, and any local-only files (`.env`, secrets)
   to copy into each worktree.
8. **First project(s)** — the repo(s) to document first: name, path, stack, and layers.

## What you get

A directory tree of Markdown — your vault:

```text
<vault>/
├── CLAUDE.md              # the schema / "constitution" every model reads first
├── AGENTS.md              # shim pointing secondary providers at CLAUDE.md
├── index.md               # master catalog of pages
├── log.md                 # append-only activity log
├── overview.md            # cross-project synthesis
├── project-registry.md    # tracked repos (referenced by path, never copied in)
├── ticket-registry.md     # ticket state
├── raw/                   # immutable source docs you drop in
├── projects/              # per-project wiki, personas, and tasks
└── skills/
    ├── ticket-workflow.md      # clarify → plan → review → execute → QA → curate
    ├── pr-review-workflow.md   # two-stage, ticket-aware PR/MR review
    ├── add-project.md          # onboard a new codebase
    ├── personas/               # generic personas (analyst, planner, reviewer, QA, curator, …)
    └── templates/              # ticket / plan / decision / pr-review templates
```

The moving parts, kept deliberately separate: **knowledge** (wiki pages) ≠ **procedure** (skills) ≠ **behavior**
(personas) ≠ **state** (registries/log).

Once it's built, head to **[usage.md](usage.md)** for day-to-day work.
