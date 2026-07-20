---
title: Providers
type: reference
project: general
sources: [CLAUDE.md, ticket-gates.md]
created: <today>
updated: <today>
---

# Providers

How the configured AI providers are set up, invoked headless, and paired for the cross-model review gates. The concrete bindings for *this* vault are in `CLAUDE.md` → Tooling Profile; this file owns the how-to and the operating rules.

This vault supports **Claude Code** and **OpenAI Codex** as interchangeable primary/reviewer roles. (Others can be added later by editing this file and the Tooling Profile.)

## Configured roles

- **Primary driver** — {{PRIMARY_PROVIDER}} / {{PRIMARY_MODEL}}. Does most research, planning, and execution.
- **Cross-model reviewer** — {{REVIEWER_PROVIDER}} / {{REVIEWER_MODEL}}. Independent gate on the plan and on the code. **Must be a different provider than the author.**

Either provider can be author or reviewer depending on which one produced the artifact — the gate is always "reviewed by the *other* provider" (see [[ticket-gates#Cross-Model Review Gate]]).

## Headless (non-interactive) invocation

Reviewers **always** run non-interactively and autonomously. Point them at the persona file and the artifact paths, let them return findings + a verdict, and do not let them stop to ask questions — surfacing open items to the human is the main agent's job.

### Command templates

Run the reviewer as a **one-shot exec from the repo directory** (`cd <repo>` first, so the reviewer reads the code in context). Substitute the configured reviewer model and write the prompt to a temp file first.

**Claude Code as reviewer:**

```bash
cd <repo> && claude -p "$(cat <prompt-file>)" --model {{REVIEWER_MODEL}} --permission-mode plan
```

**OpenAI Codex as reviewer:**

```bash
cd <repo> && codex exec - --model {{REVIEWER_MODEL}} < <prompt-file>
```

(Flag names vary across CLI versions — if a flag is rejected, check `claude --help` / `codex exec --help` and adjust; keep the two invariants below.)

### The prompt file must contain

1. **Which persona to adopt** — the path to the persona file (Business Analyst for plan review; the domain Engineer for code review) with an instruction to review *as* that persona.
2. **The artifact paths to read** — `ticket.md`, `plan.md`, `decision-*.md`, and the diff/branch or touched files. Tell it to read them itself; do **not** paste their contents.
3. **The output contract** — return **structured findings + a single verdict (`approve` | `revise`)**, and an explicit instruction: *do not ask questions, do not edit files; if something is unclear, record it as a finding and still return a verdict.*

### Invariants

- Prefer a **one-shot exec** over spawning an interactive sub-agent. Interactive/ACP *agents* have been observed to stall mid-turn; the one-shot form is reliable and autonomous.
- Pin the reviewer **model** explicitly (`{{REVIEWER_MODEL}}`) so the gate is reproducible.
- Keep the reviewer **read-only** — it inspects files and returns findings; it does not edit (the templates use a read-only/plan permission mode for this reason).
- **Preflight before the gate:** confirm the reviewer CLI is on `PATH`, is authenticated, and has been granted access to the repo (see below). If any check fails, do not run a degraded gate — see [[#If a provider is missing or unauthorized]].

## Per-project write permissions (do this once per project)

Some CLIs sandbox file access per directory and must be granted trust once inside each repo before they can operate there. **Both configured CLIs need this** — the primary (which executes) and the reviewer (which, though read-only, still needs directory trust to read the repo in a sandboxed CLI).

- After a repo is added (see [[skills/add-project]]), run **each configured CLI** — primary *and* reviewer — **once inside that repo** to grant it access for the project (e.g. open Claude Code in the repo and approve the workspace; run `codex` once in the repo and approve access). The primary needs full read/write; the reviewer needs at least read.
- If a phase or gate fails with a permission/trust error, this one-time grant is the most likely cause — the main agent should surface it to the human rather than silently skipping the step.

## If a provider is missing or unauthorized

If a configured CLI is **not installed**, not authenticated, or lacks write permission for the project **at gate time**, the main agent **stops and asks the human to fix it** — it does not silently skip the gate or quietly downgrade. Only after the human resolves it (installs/authorizes the CLI, or explicitly chooses an alternative) does the gate proceed.

During install (see `bootstrap.md`) the same rule applies: if the user picks a provider that isn't installed and working, do not proceed — help them get it installed and verified first.

## Maintenance

Model IDs age quickly. Every so often, check whether newer models exist for the configured providers and update the Tooling Profile in `CLAUDE.md` and the role lines above — don't pin a stale model forever.
