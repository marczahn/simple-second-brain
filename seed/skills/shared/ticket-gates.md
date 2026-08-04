---
title: Ticket Gates
type: reference
project: general
sources: [ticket-workflow.md, providers.md]
created: <today>
updated: <today>
---

# Ticket Gates

The hard gates that bound the ticket phases. Planning and Execution each end on the Cross-Model Review Gate; Planning additionally clears the User Plan Review Gate before any code is written. Phase-specific reviewer/persona detail lives in the phase skills ([ticket-planning](../ticket-planning.md), [ticket-execution](../ticket-execution.md)); this file owns the mechanics. Provider setup and invocation live in [providers](providers.md).

## Cross-Model Review Gate

Both Planning and Execution end with a mandatory review by a **reviewer agent on a different provider than the author** — a hard gate, automatic, no exceptions. The reviewer is one of **our defined personas**, not an ad-hoc prompt:

- **Plan review** → reviewer adopts the **Business Analyst** persona (validates the plan against the ticket's problem, scope, and acceptance criteria).
- **Code review** → reviewer adopts the relevant **Engineering persona(s)** (validates the diff against conventions, patterns, ADRs, and tests).

**Who reviews — chosen per ticket, always cross:**

- The reviewer is the provider + model **recorded on the ticket** (`reviewer_provider` / `reviewer_model`), selected at ticket start (see [ticket-research](../ticket-research.md)). Both gates on the ticket use it.
- The **author** is whatever tool is driving the work. The reviewer **must be a different provider** than the author — same-provider review does **not** satisfy this gate.
- Invoke the chosen provider headless per its command template in [providers#Headless (non-interactive) invocation](providers.md#headless-non-interactive-invocation), pinning the ticket's `reviewer_model`.
- **No reviewer recorded** (e.g. imported ticket)? Stop and ask the user to pick one before running the gate — the default/pre-selected choice is always a genuine cross-model one (a provider different from the current driver).

### How the reviewer runs

- **Non-interactive and autonomous.** Invoke the reviewer headless over **ACP** via `skills/shared/acp-review.mjs` (see [providers#Default transport: ACP](providers.md#default-transport-acp)) — a long-lived session whose turn is observable, so a stall is **detected and reported** (non-zero exit) instead of hanging forever. A one-shot `exec`/`-p` call is the recorded fallback when an ACP agent is unavailable. The reviewer reads the artifact paths and never stops to ask questions.
- **Point, don't paste — both ways.** Give it the persona file and the artifact paths (ticket, plan, decisions, touched code) — do not paste full context in. And do not have it paste full findings back out: the **full findings land in the phase's ledger** (`review-plan.md` / `review-code.md` in the ticket folder, from `skills/templates/review-findings-template.md`) and **only a brief summary** — the verdict, the count of findings by severity, and the ledger path — crosses back to the caller. Over ACP the runner writes the ledger from the reviewer's reply; in the exec fallback the reviewer writes it itself. Either way, this keeps findings off the caller's context on both legs of the trip and, because they are on disk before the caller acts, lets a crashed run resume from the ledger instead of re-invoking the reviewer.
- **Read-only against the repo — verified, not assumed.** The reviewer does not edit code, plans, or any other artifact — it inspects and reports. Over ACP the runner refuses every mutating/escalation request and, as the real guarantee, snapshots the repo tree before and after the turn: any change fails the gate (exit `5`), and the review must not be accepted. The repo/worktree stays untouched.
- **Pin the model.** Pin the reviewer model so the gate is reproducible; the runner logs what actually took effect.
- **Only the main agent asks the human.** If the reviewer surfaces open questions, it records them as `question` findings in the ledger and still returns a verdict; the main agent decides whether to fold them in or escalate to the human — the sub-agent itself never blocks on input.

### Verdict handling

The reviewer writes structured findings to the ledger and returns a verdict (**approve** / **revise**). Each finding carries a **severity** from the standard vocabulary — `blocker` · `major` · `minor` · `nit` · `question` (see [principal-engineer-reviewer#Severity levels](../personas/principal-engineer-reviewer.md#severity-levels)). **Blocking** means `blocker` or `major`; everything else is **non-blocking**.

The author (or implementer) **reads the ledger** — not a relayed copy of the findings — folds each into the artifact or records a deliberate dismissal (with reason), and sets that finding's `status:` in the ledger to `fixed` / `dismissed` in place. The ledger is the single source of truth carried across rounds. Only when the gate passes under the round budget below does the author advance status (writing both frontmatter and registry — see [ticket-conventions#Registry Rules](ticket-conventions.md#registry-rules)).

### Review round budget

The gate runs **at most three review rounds** (one reviewer invocation per round). It is **not** an open loop that repeats until a clean `approve`. This applies to **both** gates — plan review and code review.

- **Round 1** — the author addresses **all** actionable findings (fix, or record a deliberate dismissal with reason), then re-runs the gate.
- **Rounds 2 and 3** — the author addresses **only blocking findings** (`blocker` / `major`). Non-blocking findings (`minor` / `nit` / `question`) are **not** fixed here — record them on the ticket as deferred follow-ups. From round 2 on, the gate **passes as soon as no blocking findings remain**, even if non-blocking ones do.
- **After round 3** — if the reviewer still returns `revise` with blocking findings, **stop and hand the decision to the user**. Do not run a fourth round and do not silently advance. Present the outstanding blocking findings and let the user choose how to proceed — accept and advance as-is, keep iterating beyond the budget, re-scope the ticket, or abandon. Record the user's decision on the ticket.

Advance status (plan `peer-reviewed` / ticket `in-review`) **only** when the gate passes (no blocking findings) — never on an unresolved `revise`, unless the user explicitly directs it after round 3.

### If the reviewer provider is unavailable

If the configured reviewer CLI is not installed, not authenticated, or lacks write/trust for the project at gate time, **the main agent stops and asks the human to fix it.** It does **not** silently skip the gate or quietly downgrade to same-provider review. Proceed only after the human resolves it (installs/authorizes the CLI, or explicitly chooses an alternative). See [providers#If a provider is missing or unauthorized](providers.md#if-a-provider-is-missing-or-unauthorized).

## User Plan Review Gate

After the plan passes cross-model review, the user **always** reviews and approves it before any execution begins — a hard gate, no exceptions, regardless of how trivial the ticket looks. No worktree edits, no code changes until the user explicitly approves. Record the approval (and any requested changes) on the ticket. If the user requests changes, the Architect revises and re-presents.
