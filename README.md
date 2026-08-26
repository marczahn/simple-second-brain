# Simple Second Brain

An opinionated, LLM-maintained **second brain for software engineering** — installed from a single
prompt. It is based on the idea of an [llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
from Andrej Karpathy.

You point an AI coding tool (Claude Code, Codex) at one bootstrap prompt. It runs as an installer: checks
prerequisites, asks where to install, interviews you, then scaffolds a plain-Markdown "vault" that documents
your codebases and runs your ticketed work through a repeatable lifecycle:
**clarify → plan → independent review → your approval → execute → independent review → QA → ship → curate**.

It's all text. No app, no database, no lock-in. Once installed, you mostly call the `ticket-workflow` skill
with a ticket and let the system drive.

> **What it is — and isn't.** This is **not a deterministic tool**. There's no engine or compiled logic; the
> "code" is Markdown — a schema, skills, and personas that **steer an AI agent** through a repeatable lifecycle.
> *The AI does the work*, so results depend on the model you point at it and won't be identical run to run. The
> phases, gates, and registries exist to add structure, checkpoints, and guardrails **on top of** that inherently
> non-deterministic behavior — not to remove it. Think disciplined workflow for an LLM, not a push-button app.

## How it works: adapted loop engineering

Under the hood, the ticket lifecycle is an **adapted form of _loop engineering_** — the discipline of designing the
loops an agent runs in (observe → act → verify → recover), not just the prompt you hand it (see LangChain's
[*The Art of Loop Engineering*](https://www.langchain.com/blog/the-art-of-loop-engineering)). This project deliberately
dials autonomy *down* and verification *up*: stacked phase skills, two bounded cross-*provider* review loops, a
mandatory human plan gate, on-disk state anything can resume cold, and a curation phase that improves the substrate
for the next ticket. See **[Loop engineering](docs/loop-engineering.md)** for the full mapping.

## Features

- **Installs from one prompt** — no package to install; point your AI tool at [`bootstrap.md`](bootstrap.md) and answer the interview. It writes the vault from the real files under [`seed/`](seed/).
- **LLM-maintained wiki** — the AI writes and refreshes the knowledge base; you curate sources and approve work.
- **Codebase-aware** — documents real repos, referenced by path (never copied in), pinned to a commit and refreshable incrementally via `git diff`.
- **Composed five-phase ticket lifecycle** — a thin composer dispatches five self-contained phase skills (research → planning → execution → finalizing → **curation**), each owned by a named persona, so a different model can pick up cold. `done` (shipped) and `curated` (harvested) are distinct statuses, so nothing falls through the cracks.
- **Two cross-provider review gates** — the *plan* and the *code* are each reviewed by a *different* model than the one that produced them, run **non-interactively over [ACP](#recommended-drive-the-providers-over-acp)** (a shipped runner, `skills/shared/acp-review.mjs`, makes a stalled review detectable instead of a silent hang and enforces the gate's read-only invariant in code). Supports **Claude Code** and **OpenAI Codex** as interchangeable author/reviewer, and you **pick the reviewer per ticket** (defaulting to a provider different from the one you're driving) rather than pinning one vault-wide.
- **Architects plan, engineers execute** — each project gets domain-specific architect and engineer personas, plus generic personas (analyst, QA, curator, PR reviewer) shared across projects.
- **PR review by a per-project lineup** — each project declares its own `pr-review-strategy.md`: which reviewer runs on which area of the diff (backend, frontend, contract, data …), what each one checks, the escalations that pull in an extra lens, and the project's hot spots. Reviewers run as separate passes and the lead consolidates them; a reviewer that doesn't apply is recorded `n/a` **with the diffstat proving it**, so coverage is auditable instead of assumed.
- **Self-healing state** — a `lint` skill reconciles ticket status between the ticket and the registry and flags un-curated `done` tickets, so forgotten transitions surface instead of rotting.
- **Tool-neutral** — works with whatever models, Git host, ticket system, and (optional but recommended) code-intelligence index you actually use.
- **Customizable by just talking to it** — the workflow *is* plain-language instructions, so "configuring" it means telling the AI what you want, not editing a config schema. Drop the human plan-approval gate, add a new model provider like OpenCode, fall back to a one-shot `exec` when an ACP agent is flaky — each is a sentence, not a fork. More malleable than most software, and none of it magic (see [Customizing it](docs/usage.md#customizing-it)).

## Quickstart

1. Pick (or create) an **empty directory** for your vault — somewhere synced/backed-up. This is *separate* from this repo.
2. Open your AI coding tool.
3. Paste the full contents of [`bootstrap.md`](bootstrap.md) and run it.
4. It checks prerequisites, asks **where to install**, and runs a short interview (sensible defaults everywhere).
5. Approve the settings block it echoes back. It installs the vault, verifies it, and then retires the installer.

The prompt is **run-once**. See **[docs/getting-started.md](docs/getting-started.md)** for prerequisites, the
interview preview, and what gets created.

### Recommended: drive the providers over ACP

Run Claude Code and Codex through the [Agent Client Protocol (ACP)](https://agentclientprotocol.com) rather than
raw CLI invocations. Plain CLI calls occasionally **hang** — a spawned process stalls with no output and no exit,
which silently blocks a review gate or a phase. ACP puts a structured, long-lived client/server transport between
the vault and each agent, so calls stay observable and recoverable instead of stuck. Install the agents globally:

```bash
npm i -g @agentclientprotocol/claude-agent-acp @zed-industries/codex-acp
```

`claude-agent-acp` fronts Claude Code and `@zed-industries/codex-acp` (the successor to `@agentclientprotocol/codex-acp`)
fronts Codex; the shared `@agentclientprotocol/sdk` client library comes in automatically as a dependency, so you
don't install it yourself. Or just ask your AI tool to do it for you — say *"install the ACP agents"* and it runs the command above.

The vault ships its own ACP client, **`skills/shared/acp-review.mjs`** (Node.js) — the one script in an otherwise
all-Markdown vault. The review gates call it to run a single review turn and enforce their invariants in code: it
pins the reviewer model, keeps the reviewer strictly read-only and *verifies* that by diffing the repo before and
after, writes the findings ledger itself, and turns a stalled turn into a non-zero exit instead of a hang. If no
ACP agent is available it degrades to a one-shot CLI `exec`. See [`providers.md`](seed/skills/shared/providers.md).

## Documentation

- **[Getting started](docs/getting-started.md)** — prerequisites, the interview, and the vault you end up with.
- **[Concept](docs/concept.md)** — the llm-wiki idea, why it's built this way, and where it's opinionated.
- **[Loop engineering](docs/loop-engineering.md)** — the agentic-loop concept and how this project adapts it.
- **[Usage](docs/usage.md)** — day-to-day work: add a project, run a ticket, review a PR, refresh the wiki, curate.

## Status & contributions

Agentic engineering changes almost daily — tools come and go, approaches outdate. **This** approach works for
now and has been used successfully for months. Play with it, adjust it, do whatever you want. New input is very
much appreciated — open an issue or PR.
