# Usage

Once your vault is installed, you work by asking your AI tool to run one of the built-in **skills**. Everything
is text, so you can also just edit files directly or describe changes in plain language.

## Add a project

The vault is meant to track multiple projects — most often one per repository. To document a new codebase, call
the **`add-project`** skill (e.g. "add a project", "document repo X", "start tracking `<path>`"). It **runs as a
guided installation**: it checks the repo, gathers a few inputs, reports each artifact as it's created, and
verifies the result.

It records the repo by its **resolved path** (never copying source into the vault), pins the current commit,
explores the structure/stack/architecture/patterns/tests, and generates the project's wiki pages plus a
**Domain Architect and Engineer persona for each layer**, specialized to that stack. It also reminds you to run
each configured CLI **once inside the repo** so it has write/trust there, and to gitignore the worktree root if
it lives inside the repo. It also seeds a **`guardrails.md`** for the project (see next).

## Set project rules (guardrails)

Each project gets a **`projects/<name>/guardrails.md`** — the one place to declare that project's conventions,
coding guidelines, and hard don'ts as **rules the AI must obey**. `add-project` seeds it from what it observed in
the repo, but **it's yours to edit**: add, tighten, or delete rules in plain Markdown at any time, and the AI will
also propose additions as it learns. Keep them short and imperative ("Always…", "Never…").

It sits *outside* `wiki/` on purpose: the wiki *describes* what the code is (and gets regenerated on refresh),
while guardrails *prescribe* what work must follow — so a wiki refresh **never overwrites it**. Every ticket phase
(planning, execution, both review gates, PR review) reads it, and it's authoritative: if a guardrail and a wiki
page disagree, the guardrail wins.

## Work a ticket

This is the heart of the system. Call the **`ticket-workflow`** skill with a ticket (or a description of what you
want). It's a **composer**: it reads the ticket's current status and dispatches to the right phase skill,
enforcing a gate at each boundary. You'll be asked for clarification or input whenever something is ambiguous.
The lifecycle:

1. **Research** *(Business Analyst)* — turn vague goals into observable outcomes and testable acceptance criteria; produce a `ready` ticket. You also **pick this ticket's cross-model reviewer** here (provider + model), defaulting to a provider different from the one you're driving — it's stored on the ticket and used by both review gates below.
2. **Planning** *(Domain Architect)* — produce a detailed, code-level plan (always, even for trivial work), with the fewest changes that satisfy the ticket and a test planned for every change.
3. **Cross-model plan review** — the ticket's chosen reviewer (a *different* provider, acting as the Business Analyst), run non-interactively, reviews the plan; findings are folded in.
4. **Your approval** — nothing is implemented until you approve the plan. Hard gate.
5. **Execution** *(Engineer)* — work happens inside the ticket's own worktree/branch; no code change without an automated test.
6. **Cross-model code review** — the ticket's chosen reviewer (a *different* provider, acting as the Engineer) reviews the diff against conventions, scope, ADRs, and tests.
7. **QA** — the change is validated against every acceptance criterion. Passing → `done`.
8. **Ship** — changes are committed (via the `commit` skill, conventional commits, no AI mentions), pushed, and a PR/MR is opened.
9. **Curate** — a separate phase: once `done`, learnings are promoted to the wiki and the ticket moves to `curated`.

Every status change is written to both the ticket and the registry. Resuming a half-finished ticket just means
calling `ticket-workflow` again — the composer picks up from the current status, **including a `done` ticket
that was never curated** (it dispatches straight to curation).

## Review a PR / MR

Call the **`pr-review-workflow`** skill with a PR/MR URL. This is **separate** from the ticket workflow. It
reviews the change like a principal engineer — with the linked ticket in mind — and writes a checkbox review
document. **It posts nothing** until you check the findings worth posting; then it posts only those (inline +
one summary comment).

## Refresh the wiki for a codebase

Ask to **update** a project. It reads the last scanned commit, runs `git diff` against HEAD, and updates only the
affected pages — it does not re-ingest the whole repo, so your manual additions are preserved. Your
`guardrails.md` is never touched.

## Other everyday asks

- **Ingest a source doc** — drop an article/note into `raw/` (general) or `projects/<name>/raw/` (project-scoped) and ask to process it into a wiki page.
- **Curate a ticket** — ask to "curate ticket X" / "harvest the learnings" any time a `done` ticket wasn't curated yet.
- **Query** — ask a question; the AI reads the index and relevant pages and synthesizes an answer (and may file a reusable page).
- **Health check (lint)** — ask for a lint pass to find stale pages, orphans, commit drift, stale worktrees, **status drift between ticket and registry, and un-curated `done` tickets**.

## Customizing it

It's all Markdown — adjust it anytime to your needs. The `commit` skill's scope map, the personas, the gates,
the worktree root — all editable. Want to switch ticket systems (Jira → Trello) or code hosts (GitHub → GitLab)?
Just tell your AI tool to do it, and ask for help if needed. If you get stuck somewhere, ask your AI tool to
explain more.

The point worth stressing: there is **no compiled logic and no settings schema to fight** — the workflow *is* a set
of plain-language instructions. So "configuring" it is just editing those instructions, and you can do that by
**telling the AI what you want** rather than hunting for the right file. That makes it far more malleable than most
software, without any of it being magic. Two examples:

- **Drop the human plan-approval gate.** Say *"stop requiring my approval before execution — let planning flow
  straight into execution once the cross-model review passes."* The AI edits the User Plan Review Gate out of
  [`skills/shared/ticket-gates.md`](../seed/skills/shared/ticket-gates.md) (and the composer's flow). No fork, no
  code change — it's a paragraph of English becoming a different paragraph. (Reverse it just as easily; and note
  this removes a real safety check, so it's your call.)
- **Add or swap a model provider.** Say *"add OpenCode as a third author/reviewer alongside Claude Code and Codex,"*
  or *"switch the review gate to talk to reviewers over ACP instead of headless `exec`."* The AI updates
  [`skills/shared/providers.md`](../seed/skills/shared/providers.md) with the new invocation pattern and the gate
  picks it up — because the gate only ever says "invoke the chosen provider headless," never hard-codes one.
- **Change language.** If - for whatever reason - you want to use a different language, say *"use Spanish for
  this entire second brain."*. AI will ask back for confirmation, if necessary and translate the entire second brain
  into Spanish..

Because the "code" is prose, the limit is roughly *what you can describe*, not *what a config file exposes*. It's
still LLM-driven, so changes are as reliable as the model applying them — read the diff before you rely on it, same
as any other edit.
