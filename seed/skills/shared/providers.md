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

This vault supports **Claude Code** and **OpenAI Codex**; either can author work or review it. Both are driven over **ACP** by default — see [Default transport: ACP](#default-transport-acp). (Others can be added later by editing this file.)

## Choosing the reviewer (per ticket)

There is **no fixed vault-wide reviewer**. The reviewing provider + model is selected **when the ticket is created** (in [ticket-research](../ticket-research.md), by the Business Analyst) and recorded on the ticket as `reviewer_provider` / `reviewer_model`. Both gates on that ticket — plan review and code review — use it.

- **The author is whatever tool you are driving with.** The reviewer **must be a different provider** than the author — that is the whole point of the gate. Same-provider review does **not** satisfy it.
- **The default/pre-selected choice is always a genuine cross-model one** — a provider different from the current driver. Offer it as the recommended answer whenever the reviewer is chosen.
- **If a ticket reaches a gate with no reviewer recorded** (e.g. an imported ticket), stop and ask the user to pick one — defaulting cross-model — before running the gate.

## Headless (non-interactive) invocation

Reviewers **always** run non-interactively and autonomously. Point them at the persona file and the artifact paths; the full findings land in the phase's ledger (`review-plan.md` / `review-code.md` in the ticket folder) and only a brief summary (verdict + severity counts + ledger path) reaches the calling agent. They never stop to ask questions — surfacing open items to the human is the main agent's job. See [ticket-gates#How the reviewer runs](ticket-gates.md#how-the-reviewer-runs) for why the detail goes to disk rather than back through the caller.

### Default transport: ACP

**Drive both providers over the [Agent Client Protocol (ACP)](https://agentclientprotocol.com), not bare CLI calls.** A CLI one-shot is a black box: it either returns or it doesn't, and a wedged process looks identical to a slow one, silently blocking a gate. ACP is a long-lived stdio JSON-RPC session, so the turn is *observable* — streamed `session/update` events, explicit tool-call notifications, a real `stopReason`, and mediated permission requests. That makes a stall **detectable** (and the gate recoverable) rather than an indefinite hang, which is why ACP is the default and a one-shot exec is only the fallback.

The vault's ACP client is **`skills/shared/acp-review.mjs`**. It runs exactly one review turn and enforces the gate's invariants in code rather than trusting the prompt to hold them: it pins the reviewer model, refuses every mutating and escalation request, **writes the findings ledger itself** from the reviewer's reply, detects stalls, and fails the gate if the repo changed. For the JSON-RPC flow underneath it — the raw `initialize` → `session/new` → `session/set_config_option` → `session/prompt` sequence, the streamed events, and the permission reply shapes — see [ACP Protocol](acp-protocol.md); reach for it when debugging a wedged review or wiring up a new ACP agent.

```bash
node skills/shared/acp-review.mjs \
  --agent claude|codex \
  --model <reviewer-model> \
  --cwd <repo-or-worktree> \
  --ledger <abs path to review-plan.md|review-code.md> \
  --prompt-file <abs path to the review prompt> \
  [--agent-bin /abs/path/to/agent] [--stall-timeout 180] [--turn-timeout 1800] [--verbose]
```

| Flag | Required | Meaning |
|------|:--------:|---------|
| `--agent` | yes | `claude` or `codex` — which ACP agent fronts the reviewer |
| `--model` | yes | the ticket's `reviewer_model` (e.g. `claude-opus-5` / `gpt-5.4`) |
| `--cwd` | yes | repo or worktree to review; use the ticket's worktree |
| `--ledger` | yes | absolute path where the findings are written |
| `--prompt-file` | yes | absolute path to the review prompt |
| `--agent-bin` | no | absolute path to the ACP binary; overrides all resolution |
| `--stall-timeout` | no | seconds of no activity before abort (default 180, 5s granularity) |
| `--turn-timeout` | no | max seconds for the whole turn (default 1800) |
| `--verbose` | no | JSON-RPC trace on stderr |

**Binary resolution never trusts an inherited `PATH`** (thin under cron/CI, and `claude` itself is often off `PATH`). Order: `--agent-bin` → `$ACP_CLAUDE_BIN` / `$ACP_CODEX_BIN` → `PATH` → well-known install dirs (`~/.volta/bin`, `~/.local/bin`, `~/.npm-global/bin`, `/opt/homebrew/bin`, `/usr/local/bin`). The runner logs which path it used and how it found it.

**Exit codes** — anything non-zero means *the gate did not run*; never advance ticket status on it:

| Code | Meaning | Action |
|:----:|---------|--------|
| `0` | gate ran, repo clean | read the ledger, fold findings |
| `2` | bad usage | fix the invocation |
| `3` | stalled | re-run; if it repeats, escalate |
| `4` | protocol/agent error, **or the reviewer attempted a refused action** | re-run; if it keeps refusing, the prompt is telling it to write |
| `5` | reviewer mutated the repo | revert, re-run, do **not** accept the review |

stdout is one summary line (`verdict=revise ledger=… mentions[major:2 minor:1]`); diagnostics go to stderr; the full findings go to `--ledger`.

**Prerequisites** — install only the agents for the providers you actually drive; the shared `@agentclientprotocol/sdk` arrives as a dependency, so don't install it yourself:

```bash
npm i -g @agentclientprotocol/claude-agent-acp @zed-industries/codex-acp
```

`claude-agent-acp` fronts Claude Code (model pinned via `session/set_config_option`, `configId: "model"`); `@zed-industries/codex-acp` fronts Codex (model pinned via launch flag `-c model="<id>"`). `claude-agent-acp` **canonicalises** the model to its local alias (asking for `claude-opus-5` yields something like `opus[1m]`), so the runner asserts on *what took effect*, never on string equality with what you asked for.

### Read-only is a post-condition, not a mode

The runner does not assume a read-only *mode* holds — it *verifies* the outcome. This was measured, not assumed, and providers differ:

- **`codex-acp` genuinely mediates.** Its default mode is `read-only` and every edit arrives as a `session/request_permission`, so a refusal actually prevents the write. It reaches paths *outside* its workspace through a shell `execute` tool that carries no path argument — which is why the policy refuses mutating tools outright instead of trying to parse paths out of a command string.
- **`claude-agent-acp` does not.** Its internal `Write` tool executes locally without asking, `plan` mode has been observed to leak a write, and declaring `clientCapabilities.fs.writeTextFile: true` does *not* redirect writes to the client.

So the mode and the permission policy are **best-effort**, and the real guarantee is a `git status --porcelain` snapshot taken before and after the turn: any new entry fails the gate with exit `5`. Never loosen that post-check on the assumption that a mode is holding. Two consequences: the **reviewer needs no write scope anywhere** (the runner writes the ledger, so every mutating tool can be refused flatly), and the reviewer runs against the **ticket's worktree, not the main checkout**, so even a leak is contained and visible.

### Fallback: one-shot CLI exec

If an ACP agent is unavailable or misbehaving, fall back to a foreground one-shot exec from the repo directory and **note the fallback on the ticket** — it is the degraded path, because a stall is undetectable. Substitute the ticket's `<reviewer-model>` and write the prompt to a temp file first.

```bash
cd <repo> && codex exec - --model <reviewer-model> < <prompt-file>
cd <repo> && claude -p "$(cat <prompt-file>)" --model <reviewer-model> --permission-mode plan
```

(Flag names vary across CLI versions — if a flag is rejected, check `claude --help` / `codex exec --help` and adjust; keep the invariants below.) In the exec fallback there is no client writing the ledger, so the **reviewer** writes the ledger itself — see the prompt contract below. Never substitute an interactive plugin sub-agent for a gate; those stall mid-turn and are not one of these standalone binaries.

### The prompt file must contain

1. **Which persona to adopt** — the path to the persona file (Business Analyst for plan review; the domain Engineer for code review) with an instruction to review *as* that persona.
2. **The artifact paths to read** — `ticket.md`, `plan.md`, `decision-*.md`, `guardrails.md`, and the diff/branch or touched files. Tell it to read them itself; do **not** paste their contents. Use **absolute paths** — the reviewer's cwd is the worktree, so vault paths won't resolve relatively.
3. **The output contract** — a single verdict (`approve` | `revise`) and a severity on every finding, following `skills/templates/review-findings-template.md`. Plus an explicit instruction: *do not ask questions; do not create, edit, or delete any file; if something is unclear, record it as a `question` finding and still return a verdict.*
   - **Over ACP (default):** the reviewer returns the full findings **as its reply** and writes **no files** — the runner persists them to the ledger. If it tries to write, the runner refuses and exits `4`.
   - **In the exec fallback:** the reviewer **writes the full findings to the ledger itself** and returns only a brief summary (verdict, severity counts, ledger path).

**Gotchas.** Keep the prompt file (and any log) **outside the reviewed repo/worktree** — a `git clean -fd` in that repo will delete them. The `--ledger` path already lives in the ticket folder (vault), so it is safe. Quote paths that contain spaces (e.g. a vault under `~/Library/Mobile Documents/…`).

### Invariants

- **ACP is the default transport** (via `acp-review.mjs`); a one-shot CLI exec is the recorded fallback.
- Pin the reviewer **model** explicitly (the ticket's `reviewer_model`) so the gate is reproducible, and log what actually took effect.
- Keep the reviewer **read-only against the repo**, and *verify* it — the git snapshot around the turn is the guarantee, not the agent's mode. The findings ledger lives in the ticket folder (vault, not the code repo).
- **Bound the turn.** A stall must surface as a non-zero exit, never as an indefinite wait — the whole reason for ACP.
- **Preflight before the gate:** confirm the ACP agent (or CLI) is on `PATH`, is authenticated, and has been granted access to the repo (see below). If any check fails, do not run a degraded gate — see [If a provider is missing or unauthorized](#if-a-provider-is-missing-or-unauthorized).

## Per-project write permissions (do this once per project)

Some CLIs sandbox file access per directory and must be granted trust once inside each repo before they can operate there. **Every provider CLI you use needs this** — the one you drive with (which executes) and any you select as a per-ticket reviewer (which, though read-only, still needs directory trust to read the repo in a sandboxed CLI). The ACP agents inherit the trust granted to the CLI they front, so this step is unchanged by driving over ACP.

- After a repo is added (see [add-project](../add-project.md)), run **each provider CLI you intend to use** — as author *or* reviewer — **once inside that repo** to grant it access for the project (e.g. open Claude Code in the repo and approve the workspace; run `codex` once in the repo and approve access). The authoring CLI needs full read/write; a reviewer CLI needs at least read.
- Worktrees are separate directories. A CLI trusted in `<repo>` may still prompt inside `<repo>/.worktrees/<TICKET-ID>` — grant it there too on first use.
- If a phase or gate fails with a permission/trust error, this one-time grant is the most likely cause — the main agent should surface it to the human rather than silently skipping the step.

## If a provider is missing or unauthorized

If a configured ACP agent or CLI is **not installed**, not authenticated, or lacks write permission for the project **at gate time**, the main agent **stops and asks the human to fix it** — it does not silently skip the gate or quietly downgrade to same-provider review. Only after the human resolves it (installs/authorizes the agent or CLI, or explicitly chooses an alternative) does the gate proceed. A missing ACP agent alone is not a blocker — the one-shot exec fallback still runs the gate — but a wedged exec is undetectable, so prefer fixing the ACP agent.

During install (see `bootstrap.md`) the same rule applies: if the user picks a provider that isn't installed and working, do not proceed — help them get it installed and verified first.

## Maintenance

Model IDs age quickly. Every so often, check whether newer models exist for the supported providers so the reviewer choices you make per ticket stay current — don't reach for a stale model out of habit.

The same applies to the ACP agents. They are young and move fast, so the behaviour recorded in [Read-only is a post-condition, not a mode](#read-only-is-a-post-condition-not-a-mode) is a **snapshot, not a contract** — re-check it after an upgrade rather than trusting it. `@zed-industries/codex-acp` supersedes the older `@agentclientprotocol/codex-acp`; a redundant `@zed-industries/claude-code-acp` may also exist and is not the one this vault drives.
