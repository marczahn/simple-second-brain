# Getting Started

Setup is a single **run-once installer**. You paste [`bootstrap.md`](../bootstrap.md) into an AI coding tool,
it checks prerequisites and asks where to install, you answer a short interview, and it scaffolds the whole vault
from the real files under [`seed/`](../seed/).

## Prerequisites

- **An agentic AI coding tool** — **Claude Code** or **OpenAI Codex CLI**. This is the tool you drive with.
- **`git`** — the default ticket workflow uses one isolated worktree per ticket. (Not on git? Tell the installer
  during the interview and it swaps in a plain branch-per-ticket flow.)
- **A second provider** — for the cross-provider review gates (the plan *and* the code are each reviewed by a
  different model). This vault pairs **Claude Code ↔ Codex**. You **pick the reviewer per ticket** (defaulting to a
  provider different from the one you're driving), so at least one provider besides your driver must be
  **installed and working** — the gates are core, not optional. You must also run each provider CLI you use
  **once inside each repo** to grant it write/trust there.

Optional but recommended:

- **A code-intelligence index** — a symbol/graph indexer (e.g. an MCP like **codegraph**). Strongly recommended:
  the phases query it instead of re-scanning files, which is cheaper and keeps the vault free of code copies.
- **A code-host CLI** — `gh` (GitHub) or `glab` (GitLab), authenticated, for the PR/MR review and ship steps.
- **A ticket system** — Jira, GitHub/GitLab Issues, Linear, … reachable via MCP, a CLI, or its API. No ticket
  system? The vault uses local Markdown tickets (`TASK-001`).
- **[Obsidian](https://obsidian.md)** — for link navigation and graph view (it follows the standard Markdown links the vault uses). The vault is just Markdown, so any
  editor works.
- **[ACP (Agent Client Protocol)](https://agentclientprotocol.com) transport** — strongly recommended for driving
  the providers. Plain provider-CLI calls occasionally **hang** (a spawned process stalls with no output and no
  exit), which silently blocks a review gate or a phase. ACP puts a structured, long-lived client/server transport
  between the vault and each agent, so calls stay observable and recoverable instead of stuck. Install the agents
  globally:

  ```bash
  npm i -g @agentclientprotocol/claude-agent-acp @zed-industries/codex-acp
  ```

  `claude-agent-acp` fronts Claude Code and `@zed-industries/codex-acp` (the successor to `@agentclientprotocol/codex-acp`)
  fronts Codex; the shared `@agentclientprotocol/sdk` client library comes in automatically as a dependency of the
  agents that need it, so you don't install it yourself. Install whichever agents match the providers you actually
  drive — you don't need both. The review gates talk to these agents through a small **Node.js** runner the vault
  ships (`skills/shared/acp-review.mjs`), so Node must be on `PATH`. Without the agents the gates still run via a
  one-shot CLI `exec` fallback — but a wedged exec is undetectable, which is the whole reason ACP is preferred.

  > **Reminder:** you don't configure this in a file. Depending on what you want to use, just **tell the AI in plain
  > language** — e.g. *"install the ACP agents for me"*, *"route Claude and Codex through ACP"*, or *"only set up
  > the Codex ACP agent"* — and it runs the right command. Customizing this vault is a sentence, not a config edit.

## Steps

1. Pick (or create) an **empty directory** for your vault — somewhere synced/backed-up (iCloud, Dropbox). This
   is **separate from this repo**; the vault is not installed here.
2. Open your AI coding tool.
3. Paste the full contents of [`bootstrap.md`](../bootstrap.md) and run it.
4. It **checks prerequisites**, then **asks where to install** (an absolute path + a name) before anything else.
5. Answer the interview (below). Defaults are offered everywhere — "pick a sensible default" is a valid answer.
6. Review and approve the **settings block** it echoes back before it writes anything.
7. It installs the vault, installs your first project(s), runs a verification checklist, and retires the
   installer. Its job is done; the generated `CLAUDE.md` now governs the vault.

## The interview (what you'll be asked)

Have rough answers ready — each comes with advice and a default during the interview:

1. **Install location & name** — an empty folder path, and what to call the vault. (Asked first.)
2. **Providers** — which provider CLIs you have available (Claude Code / Codex). Nothing is pinned vault-wide; the cross-model reviewer is chosen **per ticket**, defaulting to a provider different from the one you're driving.
3. **Version control** — usually `git`; your default branch (`main`/`master`/`trunk`).
4. **Code host** — GitHub / GitLab / … its CLI (`gh`/`glab`), and any auto-reviewer bot to request on PRs.
5. **Ticket system** — which one (or none), the ticket-ID pattern, and how to reach it.
6. **Worktrees & env files** — per-project worktree root (default `<repo>/.worktrees`; you gitignore it) and any local-only files to copy into each worktree.
7. **Code-intelligence index** — whether you have one (e.g. codegraph), or none.
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
├── projects/              # per-project raw, wiki, architect/engineer personas, and tasks
└── skills/
    ├── ticket-workflow.md      # composer: dispatch by status + enforce gates
    ├── ticket-research.md      # phase 1 — Business Analyst
    ├── ticket-planning.md      # phase 2 — Domain Architect
    ├── ticket-execution.md     # phase 3 — Engineer(s)
    ├── ticket-finalizing.md    # phase 4 — QA → Ship (ends at done)
    ├── ticket-curation.md      # phase 5 — Curator (done → curated)
    ├── pr-review-workflow.md   # standalone, two-stage PR/MR review
    ├── add-project.md          # onboard a new codebase (installer)
    ├── commit.md               # conventional-commit helper
    ├── lint.md                 # health check + status reconciliation
    ├── shared/                 # references (status, conventions, personas, gates, worktrees, providers) + acp-review.mjs runner
    ├── personas/               # generic personas (analyst, fallback architect, QA, curator, PR reviewer)
    └── templates/              # ticket / plan / decision / pr-review / project-personas /
                                # project-guardrails / project-pr-review-strategy / architect / engineer
```

The moving parts, kept deliberately separate: **knowledge** (wiki pages) ≠ **procedure** (skills) ≠ **behavior**
(personas) ≠ **state** (registries/log). Within procedure, the composer *routes*, the phase skills *do the work*,
and `skills/shared/` holds the *facts* they share.

Once it's built, head to **[usage.md](usage.md)** for day-to-day work.
