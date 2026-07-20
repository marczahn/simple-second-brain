---
cssclasses:
---
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
├── raw/                # Immutable source documents that are general or span projects
│   └── assets/         # Downloaded images referenced by sources
├── projects/           # Per-project content (raw sources, wiki, personas, tasks)
│   └── <project>/
│       ├── raw/        # Immutable source documents scoped to <project> only
│       ├── wiki/       # All wiki pages about <project>
│       ├── personas.md # Persona intro + routing table + links
│       ├── personas/   # Project-specific architects + engineers
│       └── tasks/      # Per-ticket task folders
│           └── <TICKET-ID-short-title>/
│               ├── ticket.md
│               ├── plan.md
│               └── decision-*.md
└── skills/             # Reusable workflow documents, shared references, and templates (catalog: index.md → Skills)
    ├── ticket-workflow.md      # composer: dispatches the 5 phase skills by status + enforces gates
    ├── ticket-research.md      # phase 1 — Business Analyst: clarify, ready the ticket
    ├── ticket-planning.md      # phase 2 — Domain Architect: plan + cross-model review + user gate
    ├── ticket-execution.md     # phase 3 — Engineers: implement + tests + cross-model review
    ├── ticket-finalizing.md    # phase 4 — QA Engineer → ship (ends at `done`)
    ├── ticket-curation.md      # phase 5 — Curator: harvest learnings (`done` → `curated`)
    ├── pr-review-workflow.md   # two-stage, ticket-aware {{PR_NOUN}} review (separate from ticket workflow)
    ├── add-project.md          # onboard a new codebase into the vault (installer)
    ├── commit.md               # conventional-commit helper (ship delegates to it)
    ├── lint.md                 # health check + status/registry reconciliation
    ├── shared/         # Self-contained shared reference the phase skills link to (not runnable skills)
    │   ├── ticket-status-model.md  # ticket / clarification / plan status vocabularies
    │   ├── ticket-conventions.md   # knowledge sources, artifact types, naming, registry, templates
    │   ├── ticket-personas.md      # persona routing: generic vs project, domain mapping
    │   ├── ticket-gates.md         # cross-model review + user plan review gates, provider pairing
    │   ├── ticket-worktrees.md     # worktree per ticket: location, branch, creation, cleanup, lint
    │   └── providers.md            # provider/model setup, headless invocations, per-project write perms
    ├── personas/       # Generic (project-agnostic) personas + principal-engineer-reviewer
    └── templates/      # ticket / plan / decision / pr-review / project-personas / architect / engineer
```

`skills/` holds **multiple** reusable workflows, not just the ticket workflow. The **authoritative, up-to-date catalog is the Skills section of [`index.md`](index.md)** — consult it (or list the `skills/` directory) before starting work; new skills are added there rather than enumerated across the schema. Each skill file is self-describing via its frontmatter and trigger.

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

- **Primary driver:** {{PRIMARY_PROVIDER}} / {{PRIMARY_MODEL}} — headless call: `{{PRIMARY_CLI}}`
- **Cross-model reviewer (independent gates):** {{REVIEWER_PROVIDER}} / {{REVIEWER_MODEL}} — invoked via `{{REVIEWER_INVOCATION}}`
- **VCS / host:** {{VCS}} → {{VCS_HOST}} (CLI: `{{HOST_CLI}}`, default branch `{{DEFAULT_BRANCH}}`, auto-reviewer `{{PR_AUTO_REVIEWER}}`)
- **Ticket system:** {{TICKET_SYSTEM}} (ID pattern `{{TICKET_KEY_PATTERN}}`; access `{{TICKET_ACCESS}}`; local fallback prefix `{{LOCAL_TICKET_PREFIX}}`)
- **Worktree root (default):** `{{WORKTREE_DEFAULT}}` — per-project override recorded in `project-registry.md`
- **Code-intelligence index:** {{CODE_INDEX}}

Concrete provider setup, headless invocation patterns, and per-project write-permission notes live in [[skills/shared/providers|providers.md]]. Everything else in the schema is provider-neutral.

> **Maintenance:** model IDs age. Every so often, check whether newer models exist for the configured providers and update this Tooling Profile (and `providers.md`) rather than pinning stale IDs forever.

## Workflows

### Ticketed Work

When starting (or resuming) any ticketed work, always start at `skills/ticket-workflow.md` — the composer. It dispatches to the right phase skill by ticket status and enforces the gates. Do not inline phase steps in `CLAUDE.md`.

### {{PR_NOUN}} Review

When asked to review a {{PR_NOUN}}, follow `skills/pr-review-workflow.md`. This is **separate** from the ticket workflow.

### Ingest Source Document

1. Human drops a doc into `raw/` (general/cross-project) or `projects/<name>/raw/` (scoped to one project — use this whenever the source is clearly about a single project), or gives a location, and asks to process it.
2. Read the source.
3. Discuss key takeaways with the human.
4. Write a summary page under `projects/<name>/wiki/` (or a general page).
5. Update `index.md` under the right category.
6. Update related entity/concept/project pages.
7. Append to `log.md`.

### Add / Ingest Codebase / Project

Follow `skills/add-project.md` (runs as an installer). In summary:

1. Human provides a path to a codebase.
2. **Record its resolved path in `project-registry.md` — never copy source files into the vault.** Copying drags countless code files into the vault and pollutes search; the registry path is the only pointer to the repo.
3. Record the current commit: `git -C <path> log --oneline -1`.
4. Explore structure, stack, architecture, key patterns, conventions, testing. **If a code-intelligence index is available, query it instead of repeatedly scanning files.**
5. Create `projects/<name>/wiki/overview.md` plus pages as warranted.
6. **Every project wiki page includes `commit:` in frontmatter.** Pattern/convention pages include **real code snippets**.
7. Generate `projects/<name>/personas.md` plus the project's architects and engineers.
8. Update `index.md`, append to `log.md`, update `project-registry.md` (including code-index availability and worktree root).

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

Follow `skills/lint.md`. It scans for contradictions, stale claims, orphan pages, missing cross-references, and data gaps; flags any project whose wiki `commit:` is behind the codebase HEAD; **reconciles ticket status** (frontmatter ↔ `ticket-registry.md`, `done`-but-not-`curated` tickets); and runs the stale-worktree check from `skills/shared/ticket-worktrees.md`. Report findings, fix what's safe, update the log.

## Project Wiki Sections

Each `projects/<name>/wiki/` should eventually contain: `overview.md`, `architecture.md`, `data-model.md`, `api.md`, `key-patterns.md`, `code-conventions.md`, `testing-conventions.md`, `dependencies.md`, `open-questions.md`, plus subsystem pages as needed. Pattern/convention pages must include **actual code snippets**, not just descriptions.

## Index / Log / Registry Formats

- `index.md`: entries grouped by category — `- [[Page Title]] — one-line description (N sources)`.
- `log.md`: append-only — `## [YYYY-MM-DD] action | Subject` then a description. Actions: `ingest`, `query`, `lint`, `update`, `create`, `curate`.
- `project-registry.md`: per-project repo path (referenced, never copied), code-index availability, worktree root, last scan date, last scanned commit, page count, overview link.
- `ticket-registry.md`: per-ticket id, project, status, clarification status, linked plan, worktree, updated date.

Mutable state lives in the registries and log — **never** in this schema file.
