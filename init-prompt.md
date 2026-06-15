# init-prompt.md — Bootstrap an LLM-Maintained Engineering Second Brain

> **You are an LLM reading this file because a human asked you to set up a "second brain" vault for them.**
> This is a **run-once** prompt. Read it top to bottom first. Then run the interview in Part 2, then scaffold the vault in Part 3 using the embedded file contents in Part 4. Do not skip the interview — every embedded file contains `{{PLACEHOLDERS}}` that only the interview can fill. When you finish, delete or archive this file (Part 6).

---

## Part 0 — What this is and where it came from

This vault is a persistent, **LLM-maintained wiki** — a "second brain" — for managing knowledge across multiple software projects.

The idea comes from Andrej Karpathy's note on keeping an LLM-maintained wiki ("llm-wiki": <https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f>). The core insight: instead of a human laboriously maintaining notes, the **LLM writes and maintains the knowledge base** while the **human curates sources, directs analysis, and asks questions**. The wiki is plain Markdown so it stays portable, diffable, greppable, and editable by both human and machine forever.

This `init-prompt.md` adapts that idea specifically to **software engineering across real codebases**. It adds:

- **Codebase ingestion** — the wiki documents living repositories, pinned to the commit it was written against, refreshable incrementally via `git diff`.
- **A ticketed-work lifecycle** — clarify → plan → independent review → human approval → execute → review → QA → curate, with each phase owned by a named **persona**.
- **An independent (cross-provider) review gate** — plans are reviewed by a *different* model than the one that wrote them, so blind spots don't survive.
- **Provider/tool neutrality** — it works with whatever models, version-control host, and ticket system the user actually has, not a fixed vendor set.

The medium is intentionally low-tech: a directory of Markdown files, ideally opened in [Obsidian](https://obsidian.md) (for `[[wikilinks]]` and graph view) but usable in any editor. It is **not** a database, not an app. That is the point — it must outlive any single tool.

### The two roles

- **Human** — curates source material (drops articles, points at repos), directs what to analyze, asks questions, approves plans, and does the actual `git` merges/cleanup.
- **LLM (you, and future models)** — reads sources and code, writes and maintains every wiki page, runs the ticket lifecycle, and keeps the indexes/logs/registries current.

The whole design assumes **a different model may pick up the work cold tomorrow.** Everything is written down so that is possible.

---

## Part 1 — The mental model you are building

You will create a directory tree of Markdown with five moving parts:

1. **Schema file (`CLAUDE.md` + provider shims)** — the constitution. Defines structure, conventions, and workflows. Every model reads this first.
2. **Wiki pages** — durable knowledge: per-project overviews, architecture, data models, APIs, patterns, conventions, plus general concept/analysis pages.
3. **Skills** — reusable workflow documents (ticket lifecycle, PR review) and templates. These are *procedures*, not knowledge.
4. **Personas** — behavior contracts. Each phase of work is done "as" a persona with a defined mindset, inputs, outputs, boundaries, and handoff signal. This is what makes a cold handoff between models reliable.
5. **Operational state** — append-only `log.md`, plus `index.md`, `project-registry.md`, and `ticket-registry.md` that track what exists and its current status. Mutable state lives here, **never** in the schema file.

Keep these separate. Knowledge (wiki) ≠ procedure (skills) ≠ behavior (personas) ≠ state (registries/log).

---

## Part 2 — The Interview (do this first, interactively)

Before writing any file, interview the human. Ask the questions below **in small batches** (don't dump all at once). For each, give the short advice provided so the human can decide. Accept "I don't know / pick a sensible default" — then choose the default and say what you chose.

Record every answer. At the end, **echo back a filled-in settings block** (Part 2.9) and get a yes before scaffolding.

> Throughout the embedded files in Part 4, substitute the `{{PLACEHOLDER}}` tokens with the values gathered here.

### 2.1 Vault location and name

- **Ask:** Where should the vault live, and what is it called? (e.g. `~/notes/second-brain`, named "AI" or "engineering-wiki")
- **Advice:** Put it somewhere synced/backed-up (iCloud, Dropbox, a private git repo). If you use Obsidian, this directory becomes a "vault." A private git repo for the wiki itself is strongly recommended — you get history of the knowledge base for free.
- **Capture:** `{{VAULT_PATH}}`, `{{VAULT_NAME}}`.

### 2.2 Which LLM providers / models do you have?

- **Ask:** Which AI coding tools and model providers can you run? (e.g. Claude Code, OpenAI Codex CLI, Gemini CLI, Cursor, aider, a local model via Ollama, …) Which is your **primary** driver, and which **other** providers are available?
- **Why it matters:** The plan-review gate (2.5) requires a *second, different* model. You need at least the name of one alternate provider, even if it's a hosted web chat you paste into.
- **Advice:**
  - Name a **primary** (the model that does most planning/execution) and at least one **reviewer** on a *different* provider/family.
  - Cross-family matters more than cross-vendor: two different snapshots of the same base model share blind spots. Claude ↔ GPT ↔ Gemini ↔ a strong open model are good pairings.
  - If you only have one provider, that's fine — see the fallback in 2.5. The gate degrades gracefully.
- **Capture:** `{{PRIMARY_PROVIDER}}`, `{{PRIMARY_MODEL}}`, `{{PRIMARY_CLI}}` (command to run it headless, if any), `{{REVIEWER_PROVIDER}}`, `{{REVIEWER_MODEL}}`, `{{REVIEWER_INVOCATION}}` (exact command or "paste manually into <tool>").

### 2.3 Version control

- **Ask:** What VCS do you use (almost always `git`), and what's your default branch name (`main`/`master`/`trunk`)?
- **Advice:** The ticket workflow uses **git worktrees** (one isolated working copy per ticket). If you're not on git, tell me — I'll replace the worktree section with a plain branch-per-ticket flow (slower context switching, but works on any VCS).
- **Capture:** `{{VCS}}` (default `git`), `{{DEFAULT_BRANCH}}` (default `main`).

### 2.4 Code host / forge

- **Ask:** Where does your code live and how do PRs/MRs work? (GitHub, GitLab, Bitbucket, Azure DevOps, Gitea, plain remote with no PRs…) Do you have a CLI for it (`gh`, `glab`, …) authenticated?
- **Advice:**
  - GitHub → `gh`; GitLab → `glab`; others have their own CLI or REST API. The PR-review workflow (Part 4) is written against your host's CLI — name it so I parameterize the commands.
  - If there's no forge / no PR concept, I'll keep the review as a local-diff review and drop the "post comments to PR" stage.
- **Capture:** `{{VCS_HOST}}`, `{{HOST_CLI}}`, `{{PR_NOUN}}` (PR/MR), and whether posting review comments is supported.

### 2.5 The independent plan-review gate (cross-provider)

- **Ask:** For the mandatory plan review, which model should review plans written by your primary? It **must be a different model/provider.** How is it invoked?
- **Why:** A plan reviewed only by its author inherits the author's blind spots. A second, independent model catches non-executable steps, missing acceptance-criteria coverage, and scope drift before a human ever looks.
- **Advice / patterns:**
  - **Two CLIs available** (e.g. Claude Code + Codex CLI): the host model spawns the other as a sub-agent/headless call pointed at the plan files. Reproducible, automatic. Pin the reviewer model explicitly.
  - **One CLI + one web chat:** the workflow stops, hands you a self-contained review prompt + file paths to paste into the other model, and resumes when you paste findings back.
  - **Only one provider (degraded fallback):** use a *different model tier* from the same provider, run a static analyzer/linter, AND do one explicit "adversarial re-read" pass where the model is told to refute its own plan. Note in the schema that this is weaker than true cross-provider.
- **Capture:** the reviewer pairing → fills the "Independent Reviewer Gate" table in Part 4's ticket-workflow.

### 2.6 Ticket / issue system

- **Ask:** Do you track work in a ticket system? (Jira, GitHub Issues, GitLab Issues, Linear, Azure Boards, none.) If yes: what's the ticket-ID pattern (e.g. a `KEY-1234` project key, a `#123` issue number, or similar), and can I reach it via an MCP server, a CLI, or its API?
- **Advice:**
  - If you have one, I'll wire the workflows to read tickets from it and map repo↔project. Name the access method (MCP tool, `gh issue`, REST token).
  - If you don't, the vault uses **local tickets** with IDs like `TASK-001`. Everything still works; tickets just live as Markdown.
- **Capture:** `{{TICKET_SYSTEM}}`, `{{TICKET_KEY_PATTERN}}`, `{{TICKET_ACCESS}}` (how to fetch a ticket), `{{LOCAL_TICKET_PREFIX}}` (default `TASK`).

### 2.7 Worktree & environment conventions (git only)

- **Ask:** Where should per-ticket worktrees live, and are there local-only files (`.env`, secrets, certs) that must be copied into each worktree and never committed?
- **Advice:**
  - A sibling `worktrees/<project>/<TICKET-ID>/` directory keeps them out of the main checkout. Default: `<parent-of-repo>/worktrees/<project>/<TICKET-ID>/`.
  - List env files once here so the workflow copies them automatically and verifies they're `.gitignore`d.
- **Capture:** `{{WORKTREE_ROOT}}` (pattern), `{{ENV_FILES}}` (list, may be empty).

### 2.8 First project(s) to ingest

- **Ask:** Which codebase(s) should I document first? For each: a name, the local path, the primary languages/stack, and the layers (frontend / backend / full-stack / data / infra).
- **Advice:**
  - Start with **one** repo you actively work in. Breadth later.
  - I will **reference the repo by its resolved path** in `project-registry.md` — I **never symlink or copy** source files into the vault. Symlinking or copying would pull countless code files into the vault, bloat it, and pollute search; the registry path is the single pointer to the backing repo.
  - If a **code-intelligence index** (e.g. codegraph or an equivalent symbol/graph indexer) is available for the repo, prefer querying it over repeatedly scanning files — it avoids re-reading the codebase on every question and keeps the vault free of code copies. Note in the project's registry row whether such an index is available.
  - The stack/layers tell me which **engineering personas** to generate (e.g. a "Backend Engineer" for the server/data layer, a "Frontend Engineer" for the UI layer). Generic personas (analyst, planner, reviewer, QA, curator) are project-agnostic; engineering personas are per-project because they encode that repo's stack and file layout.
- **Capture:** for each project: `name`, `resolved_path`, `stack`, `layers`, `default_branch`, and whether a code-intelligence index is available.

### 2.9 Confirm settings

Echo a block like this and get explicit approval before scaffolding:

```
Vault:        {{VAULT_NAME}} at {{VAULT_PATH}}
Primary:      {{PRIMARY_PROVIDER}} / {{PRIMARY_MODEL}}
Reviewer:     {{REVIEWER_PROVIDER}} / {{REVIEWER_MODEL}}  (invoked: {{REVIEWER_INVOCATION}})
VCS / host:   {{VCS}} → {{VCS_HOST}} (cli: {{HOST_CLI}}, default branch {{DEFAULT_BRANCH}})
Tickets:      {{TICKET_SYSTEM}} (pattern {{TICKET_KEY_PATTERN}}, local prefix {{LOCAL_TICKET_PREFIX}})
Worktrees:    {{WORKTREE_ROOT}}   env files: {{ENV_FILES}}
First project(s): <list>
```

---

## Part 3 — Scaffold the vault (ordered)

Do these in order. Use the embedded contents from Part 4, with placeholders substituted.

1. **Create the directory tree:**

   ```text
   {{VAULT_NAME}}/
   ├── CLAUDE.md              # schema (canonical)
   ├── AGENTS.md              # shim for secondary providers (points at CLAUDE.md)
   ├── index.md               # master catalog
   ├── log.md                 # append-only activity log
   ├── overview.md            # cross-project synthesis
   ├── project-registry.md    # codebase scan state
   ├── ticket-registry.md     # ticket state
   ├── raw/                   # immutable source docs
   │   └── assets/            # downloaded images for sources
   ├── projects/              # per-project content (created per project)
   └── skills/
       ├── ticket-workflow.md
       ├── pr-review-workflow.md
       ├── personas/          # generic personas (5) + principal-engineer-reviewer
       └── templates/         # ticket / plan / decision / pr-review templates
   ```

   > If your model uses a different bootstrap-instructions filename than `CLAUDE.md` (e.g. some tools read `AGENTS.md` or `.cursorrules`), still write the canonical schema once and make the others thin shims pointing at it. Don't fork the schema.

2. **Write the root schema file** (`CLAUDE.md`) from Part 4.1.
3. **Write the provider shim(s)** (`AGENTS.md`, etc.) from Part 4.2 — one per secondary tool the user named.
4. **Write the skills:** `ticket-workflow.md` (4.3), `pr-review-workflow.md` (4.4), `add-project.md` (4.10).
5. **Write the generic personas** (4.5): business-analyst, planner, code-reviewer, qa-engineer, curator, principal-engineer-reviewer.
6. **Write the templates** (4.6): ticket, plan, decision, pr-review.
7. **Seed operational files** (4.7): `index.md`, `log.md`, `overview.md`, `project-registry.md`, `ticket-registry.md` — empty-but-structured.
8. **For each first project**, run the **Add Project** skill (4.10):
   - Record the resolved path and current commit in `project-registry.md` — do **not** symlink or copy the repo into the vault.
   - Record the current commit: `git -C <path> log --oneline -1`.
   - Explore structure/stack/architecture/patterns/tests.
   - Create `projects/<name>/wiki/overview.md` plus pages as warranted (architecture, data-model, api, key-patterns, code-conventions, testing-conventions, dependencies, open-questions).
   - Generate `projects/<name>/personas.md` (4.8 routing table) and the engineering personas under `projects/<name>/personas/` (4.9 templates), specialized to the stack from 2.8.
   - Update `index.md`, `log.md`, `project-registry.md`.
9. **Run the verification checklist** (Part 5).
10. **Hand off** (Part 6).

---

## Part 4 — Embedded file contents

Write each block below to the indicated path, substituting `{{PLACEHOLDERS}}`. Where a block says "specialize," adapt the content to the user's actual stack/tools rather than copying verbatim.

### 4.1 `CLAUDE.md` — the schema

````markdown
# {{VAULT_NAME}} — LLM Engineering Wiki Schema

This vault is a persistent, LLM-maintained wiki ("second brain") for managing knowledge across multiple software projects and general research. The LLM writes and maintains the wiki; the human curates sources, directs analysis, and asks questions. Inspired by Karpathy's llm-wiki, adapted to software engineering over real codebases.

## Directory Structure

```
{{VAULT_NAME}}/
├── CLAUDE.md            # This file — schema & conventions (canonical)
├── AGENTS.md            # Compatibility shim for other providers → points here
├── index.md            # Master content catalog
├── log.md              # Chronological activity log (append-only)
├── overview.md         # High-level synthesis across all knowledge
├── project-registry.md # Centralized codebase scan state
├── ticket-registry.md  # Centralized ticket state
├── raw/                # Immutable source documents (articles, notes, transcripts)
│   └── assets/         # Downloaded images referenced by sources
├── projects/           # Per-project content (wiki, personas, tasks)
│   └── <project>/
│       ├── wiki/       # All wiki pages about <project>
│       ├── personas.md # Persona intro + summary table + links
│       ├── personas/   # Project-specific engineering personas
│       └── tasks/      # Per-ticket task folders
│           └── <TICKET-ID-short-title>/
│               ├── ticket.md
│               ├── plan.md
│               └── decision-*.md
└── skills/             # Reusable workflow documents and templates (catalog: index.md → Skills)
    ├── ticket-workflow.md      # clarified ticket planning & execution
    ├── pr-review-workflow.md   # two-stage, ticket-aware {{PR_NOUN}} review
    ├── add-project.md          # onboard a new codebase into the vault
    ├── personas/       # Generic (project-agnostic) personas
    └── templates/      # ticket / plan / decision / pr-review templates
```

`skills/` holds **multiple** reusable workflows, not just the ticket workflow. The **authoritative, up-to-date catalog is the Skills section of `index.md`** — consult it (or list the `skills/` directory) before starting work; new skills are added there rather than enumerated across the schema. Each skill file is self-describing via its frontmatter and trigger.

## Conventions

### Page Format

Every wiki page uses this frontmatter + body structure:

```markdown
---
title: Page Title
type: <summary|entity|concept|comparison|analysis|architecture|project-overview>
project: <project-name or "general">
sources: [list of source files or codebase paths referenced]
created: YYYY-MM-DD
updated: YYYY-MM-DD
commit: <short hash of the codebase commit at time of writing — project pages only>
---

# Page Title

Content. Use [[wikilinks]] for cross-references.
```

The `commit:` field records which codebase commit a project page was written against, enabling incremental refresh.

### Wikilinks

- `[[Page Title]]` for cross-references between wiki pages.
- From outside a project dir: `[[projects/<project>/wiki/Page Title]]`.
- This is an **Obsidian vault**: heading links use Obsidian syntax, never GitHub `#kebab-case` anchors.
  - Same file: `[[#Exact Heading Text]]` (alias: `[[#Exact Heading|label]]`).
  - Cross file: `[[Note Name#Exact Heading|label]]` — bare filename, no path, no `.md`.
  - Heading text must match exactly, including capitalization.
  - Lint: `grep -rnE '\]\([^)]*#[^)]+\)' --include='*.md' .` should return nothing.

### Naming

- Filenames: kebab-case, descriptive (`authentication-flow.md`).
- Project wiki directories mirror the project name exactly.

## Tooling Profile (this vault)

- **Primary model:** {{PRIMARY_PROVIDER}} / {{PRIMARY_MODEL}}
- **Plan reviewer (independent gate):** {{REVIEWER_PROVIDER}} / {{REVIEWER_MODEL}} — invoked via `{{REVIEWER_INVOCATION}}`
- **VCS / host:** {{VCS}} → {{VCS_HOST}} (CLI: `{{HOST_CLI}}`, default branch `{{DEFAULT_BRANCH}}`)
- **Ticket system:** {{TICKET_SYSTEM}} (ID pattern `{{TICKET_KEY_PATTERN}}`; local fallback prefix `{{LOCAL_TICKET_PREFIX}}`)
- **Worktree root:** `{{WORKTREE_ROOT}}`; local-only files copied per worktree: {{ENV_FILES}}

These are the concrete bindings the workflows reference. Everything else in the schema is provider-neutral.

## Workflows

### Ticketed Work

When starting any ticketed work, always follow `skills/ticket-workflow.md`.

### PR / {{PR_NOUN}} Review

When asked to review a {{PR_NOUN}}, follow `skills/pr-review-workflow.md`.

### Ingest Source Document

1. Human drops a doc into `raw/` (or gives a location) and asks to process it.
2. Read the source.
3. Discuss key takeaways with the human.
4. Write a summary page under `projects/<name>/wiki/` (or a general page).
5. Update `index.md` under the right category.
6. Update related entity/concept/project pages.
7. Append to `log.md`.

### Add / Ingest Codebase / Project

Follow `skills/add-project.md`. In summary:

1. Human provides a path to a codebase.
2. **Record its resolved path in `project-registry.md` — never symlink or copy source files into the vault.** Symlinking/copying drags countless code files into the vault and pollutes search; the registry path is the only pointer to the repo.
3. Record the current commit: `git -C <path> log --oneline -1`.
4. Explore structure, stack, architecture, key patterns, conventions, testing. **If a code-intelligence index (e.g. codegraph) is available, query it instead of repeatedly scanning files** — it avoids re-reading the codebase on every question and keeps the vault free of code copies.
5. Create `projects/<name>/wiki/overview.md`.
6. Create pages for subsystems, architecture, data models, APIs, patterns, conventions, testing.
7. **Every project wiki page includes `commit:` in frontmatter.**
8. Generate `projects/<name>/personas.md` and the project's engineering personas.
9. Update `index.md`, append to `log.md`, update `project-registry.md` (including whether a code-intelligence index is available).

### Update Codebase (Incremental Refresh)

1. Read last scanned commit from `project-registry.md`.
2. Get current commit: `git -C <path> log --oneline -1`.
3. `git -C <path> diff <old>..<new> --stat` to see what changed.
4. `git -C <path> log --oneline <old>..<new>` for messages.
5. Map changed paths → affected wiki pages.
6. Read only the changed sources; update only the affected pages.
7. Bump `commit:` frontmatter on each updated page.
8. Update `project-registry.md`.
9. Append to `log.md`.

**Key principle:** scope updates with `git diff --stat`; do not re-ingest the whole repo. Preserves manual additions.

### Query

1. Human asks a question.
2. Read `index.md` to find relevant pages.
3. Read them and synthesize an answer.
4. If the answer is substantial and reusable, file it as a new wiki page.
5. Update index/log if pages were created.

### Lint (health check)

1. Scan for contradictions, stale claims, orphan pages, missing cross-references, data gaps.
2. Flag any project whose wiki `commit:` is behind the codebase HEAD.
3. Run the stale-worktree check from `skills/ticket-workflow.md`.
4. Report findings, fix what's safe, update the log.

## Project Wiki Sections

Each `projects/<name>/wiki/` should eventually contain: `overview.md`, `architecture.md`, `data-model.md`, `api.md`, `key-patterns.md`, `code-conventions.md`, `testing-conventions.md`, `dependencies.md`, `open-questions.md`, plus subsystem pages as needed. Pattern/convention pages must include **actual code snippets**, not just descriptions.

## Index / Log / Registry Formats

- `index.md`: entries grouped by category — `- [[Page Title]] — one-line description (N sources)`.
- `log.md`: append-only — `## [YYYY-MM-DD] action | Subject` then a description. Actions: `ingest`, `query`, `lint`, `update`, `create`.
- `project-registry.md`: per-project repo path (referenced, never symlinked/copied), code-index availability, last scan date, last scanned commit, page count, overview link.
- `ticket-registry.md`: per-ticket id, project, status, clarification status, linked plan, worktree, updated date.

Mutable state lives in the registries and log — **never** in this schema file.
````

### 4.2 `AGENTS.md` — secondary-provider shim

Write one shim per secondary tool the user named (rename if the tool reads a different file).

```markdown
# Secondary Provider Compatibility

This vault uses [`CLAUDE.md`](CLAUDE.md) as the canonical schema for the LLM-maintained wiki.

Any model — {{REVIEWER_PROVIDER}} or others — should follow the conventions, directory structure, and workflows defined there rather than maintaining a separate parallel schema.

### Instructions
- **When** starting ticketed work, **always** follow [[skills/ticket-workflow]].
- Treat `CLAUDE.md` as the source of truth for wiki behavior.
- Treat [`project-registry.md`](project-registry.md) as the centralized mutable state for codebase scan status.
- Do not fork the schema here unless the user explicitly wants tool-specific behavior that cannot live cleanly in `CLAUDE.md`.
- Keep changes minimal; preserve the existing structure unless a concrete problem justifies a change.
```

### 4.3 `skills/ticket-workflow.md`

This is the heart of the system. Substitute the tooling placeholders; keep the lifecycle intact.

````markdown
---
title: Ticket Workflow
type: workflow
project: general
sources: [CLAUDE.md, project-registry.md]
created: <today>
updated: <today>
---

# Ticket Workflow

Defines how ticket work is managed without bloating `CLAUDE.md`. Designed to be:

- model-agnostic
- explicit about readiness before execution
- detailed enough that a different model or human can execute the plan cold
- separate from long-term knowledge pages

Before any execution: clarify until everything is unambiguous, then write decisions and plans under `projects/<project>/tasks/*` using `skills/templates/`. **Whenever** you learn something or make a decision mid-ticket, capture it on the ticket or as a `decision-*.md`. Project wiki pages are updated **only after** the ticket is `done`, by the **Curator** — this avoids documenting decisions that get revoked.

The roles below are defined as full personas (mindset, inputs, outputs, boundaries, handoff signals) in `skills/personas/` (generic) and each project's `personas/` (engineering).

## Goals

- Capture work items in a reusable format.
- Force clarification before planning.
- Produce executable plans with verifiable steps.
- Preserve a history of ticket-level decisions.
- Keep active ticket state out of `CLAUDE.md`.

## Artifact Types

- **Ticket** — canonical work item: problem, desired outcome, scope/non-goals, constraints, dependencies, acceptance criteria, clarification state, and `domain:` (`frontend`|`backend`|`full-stack`, set by the Business Analyst to route to the right engineering persona).
- **Plan** — executable implementation doc: ordered steps, expected result per step, files/commands involved, validation, rollback.
- **Decision** — a resolved tradeoff/ambiguity tied to a ticket. Once a decision is **finalized**, the **Curator** updates the affected project wiki pages (and amends any ADR it changes) so the wiki reflects the decision — even before the ticket reaches `done`. In-flight, still-revocable thinking stays on the ticket; a *finalized* decision is durable knowledge and belongs in the wiki.

## Persona Routing

Generic personas (Business Analyst, Planner, Code Reviewer, QA Engineer, Curator) live in `skills/personas/` and are project-agnostic. Engineering personas are project-specific in `projects/<project>/personas/`, resolved at execution start from the project's `personas.md` using the ticket's `domain:`.

| `domain:` | Routing |
|-----------|---------|
| `frontend` | Activate the project's Frontend Engineer persona |
| `backend` | Activate the project's Backend Engineer persona |
| `full-stack` | Backend Engineer first, then Frontend Engineer |

## Lifecycle

1. **Business Analyst** — create ticket from template; fill problem/outcome/scope/criteria; set `domain:`; run the readiness gate; mark `ready` only when all conditions hold.
2. **Planner** — read the ready ticket + relevant wiki; create a plan (always, even for trivial work); phase `full-stack` plans into backend-then-frontend; file decision pages for tradeoffs; mark plan `executable` when the Minimum Quality Bar is met.
3. **Independent Reviewer Gate** — a reviewer on a **different model/provider than the planner** reviews the plan; fold findings in before involving the human. See [[#Independent Reviewer Gate]]. Mark plan `peer-reviewed` when resolved.
4. **Human Plan Review Gate** — present the plan to the human; no execution until explicit approval. See [[#Human Plan Review Gate]].
5. **Engineering Persona** (resolved from `personas.md`) — confirm approval; create/reuse the worktree ([[#Worktree Per Ticket]]); execute the domain phase; record deviations; transition to `in-review` when done. `full-stack`: backend phase then frontend phase.
6. **Code Reviewer** — review the diff vs conventions/patterns/ADRs; flag bugs, scope drift, missing tests; return to `in-progress` if findings, else hand to QA.
7. **QA Engineer** — validate against acceptance criteria; mark `done` if all pass, else return with findings.
8. **Curator** (only after `done`) — promote learnings to wiki pages; update `index.md`, `log.md`, `project-registry.md`, and `commit:` frontmatter.

## Readiness Gate

A ticket is `ready` only if all are true: problem stated in observable terms; outcome concrete; acceptance criteria testable; in-scope listed; out-of-scope listed; constraints/dependencies documented; blockers resolved or explicitly deferred; validation approach known. If anything is missing, the output is a clarification pass, not a plan.

## Independent Reviewer Gate

Before a plan reaches the human, it **must** be reviewed by a model on a **different provider/family than the one that wrote it**. Hard gate, no exceptions. The goal is a second opinion that does not share the planner's blind spots.

**Pairing for this vault:**

| Plan written by | Reviewed by | Invocation |
|-----------------|-------------|------------|
| {{PRIMARY_PROVIDER}} ({{PRIMARY_MODEL}}) | {{REVIEWER_PROVIDER}} ({{REVIEWER_MODEL}}) | `{{REVIEWER_INVOCATION}}` |
| {{REVIEWER_PROVIDER}} ({{REVIEWER_MODEL}}) | {{PRIMARY_PROVIDER}} ({{PRIMARY_MODEL}}) | `{{PRIMARY_CLI}}` (headless, read-only tools) |

The reviewer is **always** a different family. Same-family review does not satisfy this gate. If only one provider exists, use a different model tier + a static analyzer + one explicit "refute your own plan" pass, and note that this is a weaker substitute.

The reviewer is **agentic**: point it at the file paths (`plan.md`, `ticket.md`, `decision-*.md`, relevant wiki pages, the touched code) rather than pasting full context. Pin the reviewer model explicitly so the gate is reproducible. Keep it read-only.

**Reviewer must return structured findings:** non-executable steps; missing/untestable acceptance-criteria coverage; scope drift; risks/rollback gaps/unhandled failure modes; ADRs the plan changes but doesn't amend; and a verdict: **approve** / **revise** with specific changes.

**Resolution:** the planner folds findings into `plan.md` or records a deliberate dismissal with reason. Only then is the plan `peer-reviewed` and handed to the human gate. This gate runs **before** the human and never replaces it.

## Human Plan Review Gate

The human **always** reviews and approves the plan before implementation starts. Hard gate, no exceptions, regardless of how trivial the ticket looks.

- After `executable` + `peer-reviewed`, present the plan to the human.
- No worktree edits, no code changes until explicit approval.
- If the human requests changes, revise and re-present until approved.
- Record approval (and any requested changes) on the ticket or a decision page.

## Clarification Pass

When a ticket isn't ready: rewrite vague goals into observable outcomes; list blocking questions in the ticket; separate assumptions from confirmed facts; identify who/what resolves each blocker; don't bake unresolved assumptions into steps. Blocking questions are short, concrete, decision-oriented.

## Planning Rules

A plan must be: specific enough to execute without re-interpreting the goal; sequenced; broken into verifiable steps; explicit about where changes happen and how success is checked. Avoid "update the code as needed", hidden assumptions, and reliance on one model's internal context.

## Execution Rules

Follow scope/non-goals; keep ticket and plan linked; work inside the ticket's worktree on its branch; record deviations; add a decision page when a new tradeoff changes the approach; update ticket status as work progresses.

## Worktree Per Ticket

> Git only. If the user is not on git or declined worktrees, replace this section with: "Each ticket gets its own branch off `{{DEFAULT_BRANCH}}`; switch branches to switch tickets; the human merges and deletes branches."

Each ticket gets its own git worktree on its own branch, created by the Engineering Persona at activation, removed manually by the human after close.

- **Location:** `{{WORKTREE_ROOT}}` → e.g. `<parent>/worktrees/<project>/<TICKET-ID>/`.
- **Branch naming:** bare ticket ID, lowercased (`{{TICKET_KEY_PATTERN}}` → lowercase). No prefix, no slug.
- **Sub-tickets:** a dotted child (e.g. `ABC-12.1`) shares the parent's worktree and branch — do not create a new one; record the shared path in frontmatter.
- **Creation** (before any edit):

  ```bash
  git -C <resolved-path> worktree add <worktree-path> -b <branch> origin/{{DEFAULT_BRANCH}}
  git -C <worktree-path> push -u origin <branch>
  ```

  Upstream **must** track the branch itself — never `{{DEFAULT_BRANCH}}`. Verify: `git -C <worktree-path> rev-parse --abbrev-ref @{u}` → `origin/<branch>`.

  Then copy local-only files into the worktree and confirm they're gitignored:

  ```bash
  # for each of {{ENV_FILES}}:
  cp <resolved-path>/<env-file> <worktree-path>/<env-file>
  grep -q '<env-file>' <worktree-path>/.gitignore || echo '<env-file>' >> <worktree-path>/.gitignore
  ```

  If the worktree already exists (re-entry, or a sub-ticket), reuse it.

- **Tracking:** ticket frontmatter `branch:`/`worktree:`; registry `Worktree` column (`-` if none).
- **Cleanup:** manual — `git -C <resolved-path> worktree remove <worktree-path>`; then set registry `Worktree` to `-`, leave frontmatter as history.
- **Stale worktree lint:** flag worktree dirs with no matching ticket; dirs whose ticket is `done`/`cancelled`; tickets with `Worktree` set but no dir on disk.

## Status Model

- **Ticket:** `draft` → `blocked` → `ready` → `planned` → `in-progress` → `in-review` → `done` (or `cancelled`).
- **Clarification:** `open` → `resolved`.
- **Plan:** `draft` → `executable` → `peer-reviewed` → `approved` → `in-progress` → `done` (or `superseded`).

## Naming

- Ticket folder: `TICKET-123-short-title/`; ticket file `ticket.md`; plan `plan.md` (extra plans `<purpose>-plan.md`); decisions `decision-<short-title>.md`. No external ID → use `{{LOCAL_TICKET_PREFIX}}-001`.

## Registry Rules

`ticket-registry.md` is the centralized mutable state for tickets (id, project, status, clarification, plan, worktree, updated). Never use `CLAUDE.md` for this.

## Minimum Quality Bar For An Executable Plan

Before marking `executable`: every acceptance criterion traces to ≥1 step; every step has an expected result; validation is concrete; scope boundaries are visible; rollback is considered for risky changes.
````

### 4.4 `skills/pr-review-workflow.md`

> If the user has no forge / no PRs (2.4), keep Stage 1 as a **local diff review** writing the review doc, and drop Stage 2 (posting). Otherwise parameterize the host CLI.

````markdown
---
title: {{PR_NOUN}} Review Workflow
type: workflow
project: general
sources: [CLAUDE.md, project-registry.md, skills/personas/principal-engineer-reviewer.md]
created: <today>
updated: <today>
---

# {{PR_NOUN}} Review Workflow

Reviews a {{VCS_HOST}} {{PR_NOUN}} as the [[principal-engineer-reviewer|Principal Engineer Reviewer]], with the linked ticket in mind, and posts findings back — but only after a human picks which findings to post.

**Trigger:** user gives a {{PR_NOUN}} URL and asks for a review.

Two stages with a hard human gate between them:

- **Stage 1 — Review** produces a checkbox review document. Posts nothing.
- **Human gate** — the user checks the findings worth posting.
- **Stage 2 — Post** comments only the checked findings.

## Prerequisites

- `{{HOST_CLI}}` authenticated for the repo's org.
- Ticket access ({{TICKET_ACCESS}}) if a ticket system is used.
- The backing repo checked out locally (resolved path in `project-registry.md`) so the change is read in context, not just as a diff.

## Stage 1 — Review

1. **Parse the URL** → org, repo, number.
2. **Fetch the {{PR_NOUN}}** with `{{HOST_CLI}}` (metadata, full diff, changed files, existing review comments). Record the head SHA → becomes `commit:` in the doc and the target for inline comments.
3. **Resolve the ticket** — match `{{TICKET_KEY_PATTERN}}` in title, then branch, then body; fetch it via {{TICKET_ACCESS}}. If none, review code-only and record `ticket: none` — never invent one.
4. **Resolve the project & doc location** — map repo → vault project. Known project + ticket → `projects/<project>/tasks/<TICKET-ID-short-title>/review-{{PR_NOUN}}<n>.md`. Known project, no ticket → `projects/<project>/tasks/{{PR_NOUN}}<n>-review/`. Unknown → `projects/_scratch/` and say where it went.
5. **Read in context** — read changed files in full where hunks are non-trivial, plus a neighbouring example of any pattern touched; read the project's `architecture.md`, `code-conventions.md`, `key-patterns.md`, `architecture-decisions.md`, `testing-conventions.md`, `dependencies.md`. Lean on any `/code-review`-style tooling if available.
6. **Produce findings** across the four dimensions (ticket intent, fit, code quality, test quality). Split into: **Ticket alignment**, **General findings** (post as one summary), **Change-specific findings** (post inline with `path:line`). Each finding: severity (`blocker`/`major`/`minor`/`nit`/`question`), location, problem, concrete fix. Judge tests, not just their presence. Flag only unjustified convention deviations.
7. **Write the doc** from `skills/templates/pr-review-template.md`; every finding an unchecked `- [ ]`. Post nothing. Hand the path to the user.

## Human Gate

The user checks `[x]` the findings to post (and may edit text). Mandatory — Stage 2 never posts unchecked findings.

## Stage 2 — Post (only after the user says go)

1. Re-read the doc; take only `[x]` findings; split into inline vs summary.
2. **Inline comments** for change-specific findings against the head SHA, using `{{HOST_CLI}}` (or the host's REST API). If a line isn't in the diff, fall back to the summary with `path:line` quoted.
3. **One summary comment** for general + ticket-alignment findings, grouped under headings, noting which inline comments were posted.
4. **Close out** — set doc frontmatter `status: posted` + `updated:`; tell the user exactly what was posted. Do not set a formal approve/request-changes state unless asked.

## Notes

- Idempotency: check existing comments first; skip findings already posted verbatim.
- Wiki promotion of insights stays the **Curator**'s job, only if the user asks.
````

### 4.5 Generic personas (`skills/personas/`)

Write each as its own file. These are project-agnostic — keep them as-is.

**`business-analyst.md`**

```markdown
---
title: Business Analyst
type: persona
project: general
---

## Business Analyst

### Identity
Optimizes for clarity before commitment. Owns the problem statement; refuses to let work proceed on unstated assumptions.

### Activates when
- A new work item is requested.
- A ticket is in `draft` or `blocked`.
- A user asks "what should we do about X" with no defined outcome.

### Inputs
- User intent; existing `projects/<project>/wiki/`; related `decision-*.md`; `ticket-registry.md`.

### Outputs
- Ticket file from `skills/templates/ticket-template.md`; `domain:` set; updated registry; resolved blocking questions recorded in the ticket.

### Operating rules
- Rewrite vague goals into observable outcomes.
- List blocking questions in the ticket — short, concrete, decision-oriented.
- Separate assumptions from confirmed facts.
- Set `domain:` (UI/components/styles → `frontend`; API/DB/sync → `backend`; both → `full-stack`).
- Run the readiness gate before marking `ready`.

### Boundaries
- Does not write a plan, code, or wiki pages; does not create a worktree.

### Handoff signal
Ticket `ready`, clarification `resolved`, `domain:` set. Hand to **Planner**.

### Anti-patterns
- Skipping clarification because it "looks obvious"; acceptance criteria that restate the implementation; bundling unrelated outcomes; leaving `domain:` blank.
```

**`planner.md`**

```markdown
---
title: Planner
type: persona
project: general
---

## Planner

### Identity
Optimizes for an executable plan any model or human can run cold. Converges on a sequence; does not reopen the problem definition.

### Activates when
- Ticket is `ready` with no executable plan, or an existing plan is `superseded`.

### Inputs
- The ready ticket (incl. `domain:`); relevant wiki pages for the domain; prior plans and decisions.

### Outputs
- Plan file from `skills/templates/plan-template.md`; `full-stack` plans phased backend-then-frontend; decision pages for tradeoffs; ticket → `planned`; registry updated.

### Operating rules
- **Always create a plan before any execution, even if trivial.**
- Every acceptance criterion traces to ≥1 step; every step has an expected result.
- Specify exact files, modules, commands, validation per step; flag rollback for risky steps.
- If planning would require redefining the problem, return to **Business Analyst**.

### Boundaries
- Does not write code, execute, or edit wiki pages.

### Handoff signal
Plan `executable`, ticket `planned`, Minimum Quality Bar met. Hand to the **Independent Reviewer Gate**, then the **Human Plan Review Gate**.

### Anti-patterns
- Vague steps; hidden assumptions; mixing unresolved requirements into steps; marking `executable` with open questions; un-phased `full-stack` plans.
```

**`code-reviewer.md`**

```markdown
---
title: Code Reviewer
type: persona
project: general
---

## Code Reviewer

### Identity
Optimizes for code quality, convention adherence, and security. Validates the *code*, not the *outcome* (that's QA).

### Activates when
- Engineering Persona signals execution complete; ticket `in-review`.

### Inputs
- Branch and full diff vs `{{DEFAULT_BRANCH}}`; ticket (scope, non-goals, `domain:`); plan with deviation notes; `code-conventions.md`, `key-patterns.md`, `architecture-decisions.md`, `testing-conventions.md`.

### Outputs
- Findings on the ticket; sign-off note if clean; status back to `in-progress` if findings; decision page if a tradeoff surfaces.

### Operating rules
- Check diff vs conventions and key patterns; verify ADRs amended where behavior changed.
- Flag bugs, logic errors, security issues, dead code, missing tests.
- Verify scope match — no silent feature additions; confirm plan deviation notes match the diff.
- Tooling is model-agnostic: prefer a `/code-review`-style skill if available, else read the diff directly.

### Boundaries
- Does not implement fixes (return to Engineering Persona); does not validate acceptance criteria (QA); does not edit wiki or redefine scope.

### Handoff signal
No blocking findings (or all resolved). Hand to **QA Engineer**.

### Anti-patterns
- Style nits crowding out substance; approving silent scope expansion; re-validating acceptance criteria; fixing instead of returning.
```

**`qa-engineer.md`**

```markdown
---
title: QA Engineer
type: persona
project: general
---

## QA Engineer

### Identity
Optimizes for traceability between acceptance criteria and observed behavior. Validates outcome, not implementation choices.

### Activates when
- Code Reviewer has signed off; ticket has reviewed-but-unvalidated changes.

### Inputs
- Ticket (esp. acceptance criteria); plan with deviation notes; sign-off note; branch + validation commands from the plan.

### Outputs
- Validation result on the ticket; status → `done` if all criteria pass, else back to `in-progress` with findings; plan → `done` when ticket is `done`.

### Operating rules
- Walk every acceptance criterion against observed behavior; run the plan's validation steps.
- Verify ADRs amended where behavior changed; record findings, don't fix.
- Mark `done` only when every criterion passes.

### Boundaries
- Does not implement fixes, edit wiki, or redefine acceptance criteria.

### Handoff signal
Ticket `done`. Hand to **Curator** (or the user if no wiki updates warranted).

### Anti-patterns
- Validating implementation instead of criteria; soft-passing partial criteria; silent fixes.
```

**`curator.md`**

```markdown
---
title: Curator
type: persona
project: general
---

## Curator

### Identity
Optimizes for a coherent, current, navigable wiki. Activates only after a ticket finishes, or for ingest/lint/query workflows.

### Activates when
- A ticket reaches `done` with learnings worth promoting; **a decision page is finalized that changes documented behavior, architecture, data model, API, or conventions**; a new source lands in `raw/`; a commit drift is detected (registry commit ≠ HEAD); the user requests lint/ingest/update/query.

### Inputs
- Completed ticket + decision pages; `index.md`, `log.md`, `project-registry.md`; `raw/` sources; the codebase via its **resolved path recorded in `project-registry.md`** (referenced by path, never symlinked or copied; query a code-intelligence index such as codegraph if available).

### Outputs
- New/updated wiki pages; `index.md` entries; bumped `commit:` frontmatter; updated `project-registry.md`; `log.md` append.

### Operating rules
- Wait until the ticket is `done` before promoting learnings — **except** that once a decision page is finalized, immediately reflect it in the affected project wiki pages (and amend any ADR it changes) so the wiki never lags a recorded decision.
- Reference codebases by their resolved path; never symlink or copy them in. Pattern/convention pages need real code snippets.
- Bump `commit:` on every project page touched; every page change gets an `index.md` entry and a `log.md` line.
- For codebase updates, scope with `git diff --stat`; don't re-ingest. Prefer a code-intelligence index over re-scanning files when one exists.

### Boundaries
- Does not create tickets/plans/decisions, write code, validate criteria, or modify ticket/plan files.

### Handoff signal
Terminal. Returns control to the user.

### Anti-patterns
- Editing pages without bumping `commit:`; orphan pages with no `index.md` link; content changes with no `log.md` entry; leaving the wiki stale after a decision is finalized; symlinking or copying codebase files into the vault.
```

**`principal-engineer-reviewer.md`**

```markdown
---
title: Principal Engineer Reviewer
type: persona
project: general
---

## Principal Engineer Reviewer

### Identity
Reviews a {{PR_NOUN}} like a principal engineer: not just "is this correct" but "does this change belong, in this codebase, for this ticket." Optimizes for four dimensions at once:

1. **Ticket intent** — solves the ticket, the whole ticket, nothing but the ticket.
2. **Fit** — matches existing architecture, conventions, styles, libraries.
3. **Code quality** — bugs, logic errors, security, dead code, missing tests.
4. **Test quality** — tests are well written, follow conventions, cover the cases that matter (happy path, edge cases, failure modes, the ticket's specific behavior), and don't redundantly overlap.

Holds the bar high but pragmatic: convention is the default; deviation is allowed when it genuinely makes sense — and when it deviates, say why it is or isn't justified rather than reflexively flagging.

### Activates when
- The user runs the [[pr-review-workflow]] against a {{PR_NOUN}} URL.

### Inputs
- The {{PR_NOUN}}: metadata, full diff, changed files, existing comments.
- The linked ticket (if resolvable) via {{TICKET_ACCESS}}.
- The backing repo (resolved path from `project-registry.md`) so the change is read in context.
- Project wiki pages where they exist (`architecture.md`, `code-conventions.md`, `key-patterns.md`, `architecture-decisions.md`, `testing-conventions.md`, `dependencies.md`).

### Operating rules
- **Read in context** — read surrounding files, conventions, and a neighbouring example before judging fit.
- **Two finding classes, always both** — general (architectural drift, inconsistent library use, missing test layer) and change-specific (exact file + line range).
- **Judge the tests, not just their presence** — missing tests is one finding; badly written tests (no meaningful assertion, over-mocking, brittle snapshots, heavy overlap while real cases go uncovered) is another.
- **Signal over noise** — don't raise naming, formatting, import order, quote style, or anything a linter/formatter/type-checker already owns. If a true unenforced convention matters, raise it once as a `nit`.
- **Ticket alignment is first-class** — every acceptance criterion met? scope creep? unimplemented parts? If no ticket resolves, say so and review code-only.
- **Convention deviation needs a verdict, not a reflex** — flag only unjustified departures; record the reasoning either way.
- Every finding carries severity, precise location, problem, concrete fix. Prefer existing review tooling. Use `{{HOST_CLI}}` for the host and {{TICKET_ACCESS}} for tickets.

### Severity levels
`blocker` (must fix) · `major` (should fix; wrong fit / missing test / scope gap) · `minor` (small correctness/convention) · `nit` (style/polish) · `question` (needs clarification).

### Boundaries
- Produces findings, not commits; doesn't merge/approve/request-changes unless asked; posts nothing until the human checks boxes; doesn't edit wiki (Curator's job); never invents a ticket.

### Handoff signal
Stage 1: doc written → human checks boxes. Stage 2: checked findings posted → terminal.

### Anti-patterns
- Reviewing the diff blind; reflexively flagging every deviation; nits crowding out substance; ignoring the ticket; posting unchecked findings; posting only a summary when line-specific findings belong inline.
```

### 4.6 Templates (`skills/templates/`)

**`ticket-template.md`**

```markdown
---
title: TICKET-000 Title
type: ticket
project: general
status: draft
clarification_status: open
plan_status: none
domain: frontend|backend|full-stack
branch:
worktree:
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# TICKET-000 Title

## Summary
One short paragraph describing the issue or opportunity.

## Problem
Describe the problem in observable terms.

## Desired Outcome
The end state that should exist after success.

## In Scope
- 

## Out of Scope
- 

## Constraints
- 

## Dependencies
- 

## Acceptance Criteria
- [ ] 
- [ ] 

## Blocking Questions
- [ ] 

## Confirmed Facts
- 

## Assumptions
- 

## Validation Approach
- 

## Links
- Related plan:
- Related decisions:
- Related wiki pages:

## Readiness Check
- [ ] Problem is observable and specific
- [ ] Desired outcome is concrete
- [ ] Acceptance criteria are testable
- [ ] Scope is defined
- [ ] Non-goals are defined
- [ ] Constraints and dependencies are documented
- [ ] Blocking questions are resolved or explicitly deferred
- [ ] Validation approach is known

## Status Notes
Short updates on why the ticket is blocked / ready / complete.
```

**`plan-template.md`**

```markdown
---
title: TICKET-000 Plan
type: plan
project: general
ticket: TICKET-000
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# TICKET-000 Plan

## Objective
Exactly what this plan delivers.

## Preconditions
- Ticket clarification status is `resolved`
- Ticket status is `ready`
- Required access, tools, and context are available
- Ticket worktree exists (or reuse the parent's for sub-tickets) and its path is recorded in frontmatter and registry

## Scope Reference
- Source ticket:
- In scope:
- Out of scope:

## Acceptance Criteria Mapping
- Criterion:
  Covered by steps:

## Execution Steps
1. Step name
   Expected result:
   Files/modules/systems:

2. Step name
   Expected result:
   Files/modules/systems:

## Risks
- Risk:
  Mitigation:

## Validation
- Checks:
- Commands:
- Observable success conditions:

## Rollback / Recovery
- 

## Notes For Executor
- Conventions to follow:
- Things to avoid:
- Related decisions:
```

**`decision-template.md`**

```markdown
---
title: TICKET-000 Decision Title
type: decision
project: general
ticket: TICKET-000
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# TICKET-000 Decision Title

## Context
The ambiguity, tradeoff, or requirement that needed a decision.

## Options Considered
- Option:
  Tradeoffs:
- Option:
  Tradeoffs:

## Decision
The chosen option, stated clearly.

## Consequences
- 

## Follow-Up
- Ticket impact:
- Plan impact:
- Related pages:
```

**`pr-review-template.md`**

```markdown
---
title: {{PR_NOUN}}-000 Review
type: pr-review
project: general
pr: <url>
ticket: <TICKET-ID or "none">
reviewer: Principal Engineer Reviewer
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
commit: <head SHA at review time>
---

# {{PR_NOUN}}-000 Review — <title>

> **How to use:** check `[x]` the findings to post; leave `[ ]` to drop. Then tell the reviewer to proceed. Inline findings post as line comments; general findings post in one summary comment.

## Context
- **{{PR_NOUN}}:** <url> — `<base>` ← `<head>`, by @<author>
- **Ticket:** <id + title> — or `none found` (reviewed code-only)
- **What the change claims to do:** …
- **What the ticket asks for:** …

## Ticket Alignment
- [ ] **[severity]** Acceptance criterion not met / scope creep / unimplemented — _general_
  - **Problem:** …
  - **Suggested fix:** …

Acceptance-criteria checklist (reviewer's read, not posted):
- [ ] AC1: … — met? yes / no / partial

## General Findings
- [ ] **[severity]** Short title — _general_
  - **Problem:** …
  - **Suggested fix:** …
  - **Convention/ADR/pattern reference:** … (or "deviation justified because …")

## Change-Specific Findings
- [ ] **[severity]** Short title — `path/to/file.ext:120-128`
  - **Problem:** …
  - **Suggested fix:** …
  - **Fit note:** matches / deviates because …

## Reviewer Notes (not posted)
- Files read for context beyond the diff: …
- Conventions/wiki pages consulted: …
- Open questions for the author: …
```

### 4.7 Operational seed files

**`index.md`**

```markdown
---
title: Wiki Index
type: index
project: general
created: <today>
updated: <today>
---

# Wiki Index

Master catalog of all wiki pages. Read this first to find relevant pages.

## Overview
- [[overview]] — High-level synthesis across all projects and knowledge.
- [[project-registry]] — Centralized scan state for codebase-backed sources.
- [[ticket-registry]] — Centralized mutable state for ticket status.

## Skills
- [[skills/ticket-workflow]] — Model-agnostic clarified ticket planning and execution.
- [[skills/pr-review-workflow]] — Two-stage, ticket-aware {{PR_NOUN}} review.
- [[skills/add-project]] — Onboard a new codebase into the vault (reference by path, never symlink/copy).
- [[skills/personas/business-analyst|Business Analyst]]
- [[skills/personas/planner|Planner]]
- [[skills/personas/code-reviewer|Code Reviewer]]
- [[skills/personas/qa-engineer|QA Engineer]]
- [[skills/personas/curator|Curator]]
- [[skills/personas/principal-engineer-reviewer|Principal Engineer Reviewer]]

## Projects
<!-- one subsection per project, added during ingest -->

## Concepts
## Entities
## Comparisons
## Analyses
```

**`log.md`**

```markdown
---
title: Activity Log
type: log
project: general
created: <today>
updated: <today>
---

# Activity Log

Append-only record of meaningful wiki changes.

## [<today>] create | Vault bootstrapped
Initialized the LLM engineering wiki from init-prompt.md. Created schema, skills, personas, templates, and operational files.
```

**`overview.md`**

```markdown
---
title: Overview
type: summary
project: general
created: <today>
updated: <today>
---

# Overview

High-level synthesis across all projects and knowledge in this vault. Populated as projects are ingested.

## Projects
<!-- short synthesis per project -->

## Cross-cutting themes
<!-- patterns that recur across projects -->
```

**`project-registry.md`**

```markdown
---
title: Project Registry
type: registry
project: general
created: <today>
updated: <today>
---

# Project Registry

Centralized operational state for codebase-backed sources. Source of truth for the latest scan status of each project, and the **only** pointer from the vault to each backing repo — repos are referenced by path here, never symlinked or copied into the vault.

| Project | Repo Path | Code Index | Last Scan Date | Last Scanned Commit | Pages | Overview |
|---------|-----------|------------|----------------|---------------------|-------|----------|

## Notes
- Update whenever a codebase is first ingested or incrementally refreshed.
- `Repo Path` is the canonical filesystem location of the backing repo. Never symlink or copy the repo into the vault — this path is the single reference.
- `Code Index` records whether a code-intelligence index (e.g. codegraph) is available for the repo; if so, prefer querying it over re-scanning files.
- Use `Last Scanned Commit` to scope `git diff` during updates.
- Keep per-page `commit:` frontmatter for page-level provenance; use this file for project-level scan state.
```

**`ticket-registry.md`**

```markdown
---
title: Ticket Registry
type: registry
project: general
created: <today>
updated: <today>
---

# Ticket Registry

Centralized operational state for ticket work.

| Ticket | Project | Status | Clarification | Plan | Worktree | Updated |
|--------|---------|--------|---------------|------|----------|---------|
```

### 4.8 Project personas routing (`projects/<name>/personas.md`)

Generate per project, specialized to its layers/stack.

```markdown
---
title: <project> Personas
type: persona-set
project: <project>
sources: [skills/ticket-workflow.md, CLAUDE.md]
created: <today>
updated: <today>
---

# <project> Personas

Behavior contracts for the LLM (or human) acting in a given role. Each defines mindset, inputs, outputs, boundaries, and handoff conditions so a different model can pick up cold.

Workflow phases are in [[skills/ticket-workflow]]. Personas are **generic** (project-agnostic, in `skills/personas/`) or **engineering** (project-specific, here).

## Persona Switching
- One persona per turn.
- A persona ends only when its **handoff signal** is satisfied.
- If the wrong persona is active, stop, name the correct one, switch explicitly.
- Wiki updates beyond ticket/plan files are deferred to **Curator** after `done`.

## Generic Personas
- [[skills/personas/business-analyst|Business Analyst]]
- [[skills/personas/planner|Planner]]
- [[skills/personas/code-reviewer|Code Reviewer]]
- [[skills/personas/qa-engineer|QA Engineer]]
- [[skills/personas/curator|Curator]]

## Engineering Personas
<!-- one link per engineering persona generated for this project's layers -->
- [[personas/backend-engineer|Backend Engineer]] — <stack, paths>
- [[personas/frontend-engineer|Frontend Engineer]] — <stack, paths>

## Domain Routing
| `domain:` | Engineering Persona | Execution order |
|-----------|---------------------|-----------------|
| `frontend` | Frontend Engineer | Single phase |
| `backend` | Backend Engineer | Single phase |
| `full-stack` | Backend → Frontend | Backend phase first |

## Persona Summary Table
| # | Persona | Activates when | Primary output | Hands to |
|---|---|---|---|---|
| 1 | Business Analyst | New work / `draft`/`blocked` | Ready ticket with `domain:` | Planner |
| 2 | Planner | Ticket `ready`, no plan | Executable, phased plan | Engineering Persona |
| 3 | Engineering Persona | `planned`/approved | Code on branch | Code Reviewer |
| 4 | Code Reviewer | `in-review` | Findings or sign-off | QA or back |
| 5 | QA Engineer | Review signed off | `done` or findings | Curator or user |
| 6 | Curator | `done`, ingest/lint | Updated wiki, index, log | User |
```

### 4.9 Engineering persona template (`projects/<name>/personas/<role>-engineer.md`)

Generate one per layer from 2.8, **specialized to the real stack and file layout** discovered during ingest. Template:

```markdown
---
title: <Role> Engineer
type: persona
project: <project>
---

## <Role> Engineer

### Identity
<Stack> specialist for the <project> <layer>. Owns work in <key paths>. Optimizes for faithful plan execution within the <layer> layer and clean branch hygiene. Surfaces deviations rather than silently absorbing them.

### Activates when
- Ticket `domain` is `<layer>` (or the `<layer>` phase of a `full-stack` ticket).
- Ticket is `planned`/`in-progress` and steps are scoped to <layer> files.

### Inputs
- The ticket and plan; linked decisions.
- Project wiki pages relevant to the layer: <list the real pages, e.g. api.md, data-model.md, key-patterns.md, code-conventions.md, architecture-decisions.md, testing-conventions.md>.

### Outputs
- Code changes in <paths> on the ticket's branch.
- Deviation notes appended to the plan; new decision pages for material tradeoffs.
- Status transitions: `planned` → `in-progress` → `in-review`.

### Operating rules
- Create/reuse the ticket worktree per [[ticket-workflow#Worktree Per Ticket]] before editing; record `branch:`/`worktree:`.
- Do all edits inside the worktree, on the ticket's branch.
- Follow <project>'s key patterns and conventions (cite the real pages/rules — e.g. DI container, generated API stubs, migrations for schema changes, naming/linting).
- Check `architecture-decisions.md` before changing ADR-covered behavior; amend the ADR in the same change set.
- Record deviations as they happen; capture insights on the ticket or a decision page, not in wiki pages.

### Boundaries
- Does not touch other layers' code; does not redefine scope (return to Business Analyst); does not validate acceptance criteria (QA); does not edit wiki/index/log; does not remove the worktree.

### Handoff signal
All <layer> plan steps complete, deviations recorded, ADRs amended, branch ready. Hand to **Code Reviewer** (or the next engineering phase for `full-stack`).

### Anti-patterns
- <stack-specific anti-patterns: bypassing DI, duplicating generated types, schema changes without a migration, silent scope drift, editing wiki mid-execution>.
```

### 4.10 `skills/add-project.md`

The repeatable procedure for adding any new project to the vault later — the same flow `init-prompt.md` uses for the first project, captured as a permanent skill so the human can say "add a new project" any time.

````markdown
---
title: Add Project
type: workflow
project: general
sources: [CLAUDE.md, project-registry.md]
created: <today>
updated: <today>
---

# Add Project

Onboards a new codebase into the vault following the standard structure. Run this whenever the human points at a repo and asks to document or track it. Owned by the **Curator** persona.

**Trigger:** "add a project", "document repo X", "start tracking <path>".

## Rules

- **Reference the repo by its resolved path only.** Record that path in `project-registry.md`. **Never symlink or copy** the repo into the vault — doing so drags countless code files in, bloats the vault, and pollutes search.
- **Prefer a code-intelligence index.** If a symbol/graph indexer (e.g. codegraph) is available for the repo, query it instead of repeatedly scanning files. Record its availability in the registry. This avoids re-reading the codebase on every question and keeps the vault free of code copies.
- Every project wiki page carries `commit:` frontmatter pinned to the commit it was written against.
- Pattern/convention pages include **real code snippets**, not just prose.

## Steps

1. **Gather inputs** — project name (kebab-case, mirrors the directory), resolved repo path, primary languages/stack, layers (frontend / backend / full-stack / data / infra), default branch, and whether a code-intelligence index is available.
2. **Record provenance** — capture the current commit: `git -C <repo-path> log --oneline -1`. Add a row to `project-registry.md` with the repo path, code-index availability, scan date, and commit. Do **not** create any symlink or copy.
3. **Create the tree:**
   ```text
   projects/<name>/
   ├── wiki/
   ├── personas.md
   ├── personas/
   └── tasks/
   ```
4. **Explore and document** — using the code index where available (else targeted reads), study structure, stack, architecture, key patterns, conventions, and testing. Create `wiki/overview.md` first, then pages as warranted: `architecture.md`, `data-model.md`, `api.md`, `key-patterns.md`, `code-conventions.md`, `testing-conventions.md`, `dependencies.md`, `open-questions.md`, plus subsystem pages. Each gets `commit:` frontmatter.
5. **Generate personas** — write `personas.md` (routing table) and one engineering persona per layer under `personas/`, specialized to the real stack and file layout (use the engineering-persona template). Link the generic personas from `skills/personas/`.
6. **Wire it up** — add a Projects subsection to `index.md` linking the new pages; append an `ingest` entry to `log.md` including the commit; confirm the `project-registry.md` row is complete.
7. **Verify** — no symlink/copy of the repo exists in the vault; every new project page has `commit:` frontmatter; `index.md` and `log.md` reference every page created; the registry row is filled in.

## Relationship to other workflows

- **Update Codebase** (in `CLAUDE.md`) refreshes an already-added project incrementally via `git diff`.
- **Ticket Workflow** (`skills/ticket-workflow.md`) and the engineering personas generated here drive day-to-day ticketed work on the project.
````

---

## Part 5 — Verification checklist

Before declaring done, confirm:

- [ ] Directory tree matches Part 3 step 1.
- [ ] `CLAUDE.md` exists with the Tooling Profile filled in (no leftover `{{PLACEHOLDERS}}`).
- [ ] A provider shim exists for each secondary tool named.
- [ ] `skills/ticket-workflow.md`, `skills/pr-review-workflow.md`, and `skills/add-project.md` exist; the Independent Reviewer Gate table names a *different* provider for the reviewer.
- [ ] No repo is symlinked or copied into the vault; each is referenced only by its `project-registry.md` path.
- [ ] All six generic personas + four templates exist.
- [ ] Seed `index.md`, `log.md`, `overview.md`, `project-registry.md`, `ticket-registry.md` exist and are well-formed.
- [ ] Each first project has: a `project-registry.md` row referencing its repo path (no symlink/copy in the vault), an `overview.md` with `commit:` frontmatter, a `personas.md`, and engineering personas specialized to its stack.
- [ ] `project-registry.md` has a row per ingested project; `index.md` has a Projects subsection per project; `log.md` has the bootstrap + ingest entries.
- [ ] Heading-anchor lint returns nothing: `grep -rnE '\]\([^)]*#[^)]+\)' --include='*.md' .`
- [ ] No `{{PLACEHOLDER}}` survives anywhere: `grep -rn '{{' --include='*.md' .` returns nothing.

## Part 6 — Hand off to the human

Tell the human:

1. **What was created** — a one-paragraph tour of the tree and the lifecycle.
2. **How to use it day to day:**
   - "Add a project / document repo X" → Add Project skill (`skills/add-project.md`) — references the repo by path, never symlinks/copies it in.
   - "Work ticket Y" → Ticket Workflow (clarify → plan → independent review → your approval → execute → review → QA → curate; finalized decisions update the wiki immediately).
   - "Review {{PR_NOUN}} <url>" → {{PR_NOUN}} Review Workflow.
   - "Refresh the wiki for X" → Update Codebase (incremental).
   - "Health check" → Lint.
3. **Open Obsidian** on the vault for wikilinks + graph; optionally `git init` the vault itself for knowledge-base history.
4. **Next steps** — ingest the remaining repos; drop reference docs into `raw/`; specialize engineering personas as you learn each repo's quirks.
5. **Retire this file** — move `init-prompt.md` into `raw/` (or delete it). It has done its job; the schema in `CLAUDE.md` now governs the vault.

> Maintenance reminder for future models: `CLAUDE.md` is the constitution; registries and `log.md` hold mutable state; personas define behavior; skills define procedure. Keep them separate, keep `commit:` frontmatter honest, and never let a plan reach the human without an independent-model review first.
```