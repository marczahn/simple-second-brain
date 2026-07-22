---
title: Providers
type: reference
project: general
sources: [CLAUDE.md, ticket-gates.md]
created: <today>
updated: <today>
---

# Providers

How the supported AI providers are set up and invoked headless for the cross-model review gates. This file owns the how-to and the operating rules; the concrete reviewer for any given piece of work is **not** pinned here — it is chosen per ticket (see below).

This vault supports **Claude Code** and **OpenAI Codex**; either can author work or review it. (Others can be added later by editing this file.)

## Choosing the reviewer (per ticket)

There is **no fixed vault-wide reviewer**. The reviewing provider + model is selected **when the ticket is created** (in [ticket-research](../ticket-research.md), by the Business Analyst) and recorded on the ticket as `reviewer_provider` / `reviewer_model`. Both gates on that ticket — plan review and code review — use it.

- **The author is whatever tool you are driving with.** The reviewer **must be a different provider** than the author — that is the whole point of the gate. Same-provider review does **not** satisfy it.
- **The default/pre-selected choice is always a genuine cross-model one** — a provider different from the current driver. Offer it as the recommended answer whenever the reviewer is chosen.
- **If a ticket reaches a gate with no reviewer recorded** (e.g. an imported ticket), stop and ask the user to pick one — defaulting cross-model — before running the gate.

## Headless (non-interactive) invocation

Reviewers **always** run non-interactively and autonomously. Point them at the persona file and the artifact paths, let them return findings + a verdict, and do not let them stop to ask questions — surfacing open items to the human is the main agent's job.

### Command templates

Run the reviewer as a **one-shot exec from the repo directory** (`cd <repo>` first, so the reviewer reads the code in context). Substitute the ticket's chosen reviewer model (`<reviewer-model>`) and write the prompt to a temp file first.

**Claude Code as reviewer:**

```bash
cd <repo> && claude -p "$(cat <prompt-file>)" --model <reviewer-model> --permission-mode plan
```

**OpenAI Codex as reviewer:**

```bash
cd <repo> && codex exec - --model <reviewer-model> < <prompt-file>
```

(Flag names vary across CLI versions — if a flag is rejected, check `claude --help` / `codex exec --help` and adjust; keep the two invariants below.)

### The prompt file must contain

1. **Which persona to adopt** — the path to the persona file (Business Analyst for plan review; the domain Engineer for code review) with an instruction to review *as* that persona.
2. **The artifact paths to read** — `ticket.md`, `plan.md`, `decision-*.md`, and the diff/branch or touched files. Tell it to read them itself; do **not** paste their contents.
3. **The output contract** — return **structured findings + a single verdict (`approve` | `revise`)**, and an explicit instruction: *do not ask questions, do not edit files; if something is unclear, record it as a finding and still return a verdict.*

### Invariants

- Prefer a **one-shot exec** over spawning an interactive sub-agent. Interactive/ACP *agents* have been observed to stall mid-turn; the one-shot form is reliable and autonomous.
- Pin the reviewer **model** explicitly (the ticket's `reviewer_model`) so the gate is reproducible.
- Keep the reviewer **read-only** — it inspects files and returns findings; it does not edit (the templates use a read-only/plan permission mode for this reason).
- **Preflight before the gate:** confirm the reviewer CLI is on `PATH`, is authenticated, and has been granted access to the repo (see below). If any check fails, do not run a degraded gate — see [If a provider is missing or unauthorized](#if-a-provider-is-missing-or-unauthorized).

## Per-project write permissions (do this once per project)

Some CLIs sandbox file access per directory and must be granted trust once inside each repo before they can operate there. **Every provider CLI you use needs this** — the one you drive with (which executes) and any you select as a per-ticket reviewer (which, though read-only, still needs directory trust to read the repo in a sandboxed CLI).

- After a repo is added (see [add-project](../add-project.md)), run **each provider CLI you intend to use** — as author *or* reviewer — **once inside that repo** to grant it access for the project (e.g. open Claude Code in the repo and approve the workspace; run `codex` once in the repo and approve access). The authoring CLI needs full read/write; a reviewer CLI needs at least read.
- If a phase or gate fails with a permission/trust error, this one-time grant is the most likely cause — the main agent should surface it to the human rather than silently skipping the step.

## If a provider is missing or unauthorized

If a configured CLI is **not installed**, not authenticated, or lacks write permission for the project **at gate time**, the main agent **stops and asks the human to fix it** — it does not silently skip the gate or quietly downgrade. Only after the human resolves it (installs/authorizes the CLI, or explicitly chooses an alternative) does the gate proceed.

During install (see `bootstrap.md`) the same rule applies: if the user picks a provider that isn't installed and working, do not proceed — help them get it installed and verified first.

## Maintenance

Model IDs age quickly. Every so often, check whether newer models exist for the supported providers so the reviewer choices you make per ticket stay current — don't reach for a stale model out of habit.
