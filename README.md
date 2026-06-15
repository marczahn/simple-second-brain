# Simple Second Brain

An opinionated, LLM-maintained **second brain for software engineering** — set up entirely from a single
prompt. It is based on the idea of an [llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
from Andrej Karpathy.

You point an AI coding tool (Claude Code, Codex, …) at one bootstrap prompt. It interviews you, then
scaffolds a plain-Markdown "vault" that documents your codebases and runs your ticketed work through a
repeatable workflow: **clarify → plan → independent review → your approval → execute → review → QA → curate**.

It's all text. No app, no database, no lock-in. Once set up, you mostly call the `ticket-workflow` skill
with a ticket and let the system drive.

## Features

- **Set up from one prompt** — no install; paste [`init-prompt.md`](init-prompt.md) into your AI tool and answer the interview.
- **LLM-maintained wiki** — the AI writes and refreshes the knowledge base; you curate sources and approve work.
- **Codebase-aware** — documents real repos, pinned to a commit and refreshable incrementally via `git diff`.
- **Ticketed-work lifecycle** — each phase owned by a named persona, so a different model can pick up cold.
- **Cross-provider review gate** — plans are reviewed by a *different* model than the one that wrote them, so blind spots don't survive (degrades gracefully if you only have one provider).
- **Tool-neutral** — works with whatever models, Git host, and ticket system you actually use.
- **Fully customizable** — it's just Markdown; change anything by telling your AI tool in plain language.

## Quickstart

1. Pick (or create) an **empty directory** for your vault — somewhere synced/backed-up. This is *separate* from this repo.
2. Open your AI coding tool there.
3. Paste the full contents of [`init-prompt.md`](init-prompt.md) and run it.
4. Answer the interview (it asks ~8 short questions; sensible defaults are offered for each).
5. Approve the settings block it echoes back. It scaffolds the vault and then retires the prompt.

The prompt is **run-once**. See **[docs/getting-started.md](docs/getting-started.md)** for prerequisites, the
full interview preview, and what gets created.

## Documentation

- **[Getting started](docs/getting-started.md)** — prerequisites, the interview, and the vault you end up with.
- **[Concept](docs/concept.md)** — the llm-wiki idea, why it's built this way, and where it's opinionated.
- **[Usage](docs/usage.md)** — day-to-day work: add a project, run a ticket, review a PR, refresh the wiki.

## Status & contributions

Agentic engineering changes almost daily — tools come and go, approaches outdate. **This** approach works for
now and has been used successfully for months. Play with it, adjust it, do whatever you want. New input is very
much appreciated — open an issue or PR.
