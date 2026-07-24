---
title: Add Project
type: workflow
project: general
sources: [CLAUDE.md, project-registry.md, providers.md]
created: <today>
updated: <today>
---

# Add Project

Onboards a new codebase into the vault. **Runs as a guided installation** — it checks prerequisites, gathers a few inputs, then reports each artifact as it is created and verifies the result at the end. Run this whenever the human points at a repo and asks to document or track it. Owned by the **Curator** persona.

**Trigger:** "add a project", "document repo X", "start tracking <path>".

## Rules

- **Reference the repo by its resolved path only.** Record that path in `project-registry.md`. **Never copy** the repo into the vault — doing so drags countless code files in, bloats the vault, and pollutes search.
- **Prefer a code-intelligence index.** If a symbol/graph indexer ({{CODE_INDEX}}) is available for the repo, query it instead of repeatedly scanning files. One query usually answers an architecture/trace/where-is-X question that would otherwise cost dozens of reads. **Strongly recommend enabling one** if the repo has none — note the recommendation to the user and record availability in the registry.
- Every project wiki page carries `commit:` frontmatter pinned to the commit it was written against.
- Pattern/convention pages include **real code snippets**, not just prose.

## Install steps

### 1. Preflight (installer checks)

- Confirm the repo path exists and is a git repo (`git -C <path> rev-parse --show-toplevel`).
- Confirm the configured provider CLIs are installed and working (see [providers](shared/providers.md)). **Grant per-project write/trust now:** run each configured CLI **once inside this repo** so it can operate there later — a common cause of later gate failures is skipping this one-time grant.
- Note whether a code-intelligence index covers the repo; if not, recommend enabling one.

### 2. Gather inputs

- Project **name** (kebab-case; mirrors the directory under `projects/`).
- Resolved **repo path**.
- Primary **languages/stack**.
- **Layers** (frontend / backend / full-stack / data / infra) — drives which architect/engineer personas are generated.
- **Default branch**.
- **Worktree root** — where per-ticket worktrees live. Default `<repo>/.worktrees`. **Remind the user** that if it sits inside the repo, they must gitignore it (the workflow does not edit their ignore rules).
- Whether a **code-intelligence index** is available.
- The repo's top-level module layout → seeds the **scope map** in [commit](commit.md).

### 3. Record provenance

Capture the current commit (`git -C <repo> log --oneline -1`) and add a row to `project-registry.md`: repo path, code-index availability, worktree root, scan date, commit. Do **not** copy the repo in.

### 4. Create the tree

```text
projects/<name>/
├── guardrails.md # prescriptive, human-owned rules (seeded here, then user-edited)
├── raw/          # project-scoped source documents
├── wiki/
├── personas.md
├── personas/
└── tasks/
```

### 5. Explore and document

Using the code index where available (else targeted reads), study structure, stack, architecture, key patterns, conventions, and testing. Create `wiki/overview.md` first, then pages as warranted: `architecture.md`, `data-model.md`, `api.md`, `key-patterns.md`, `code-conventions.md`, `testing-conventions.md`, `dependencies.md`, `open-questions.md`, plus subsystem pages. Each gets `commit:` frontmatter. **Record the project's commit convention and its scope map** (a list of `path/prefix/* → scope` rules from the repo's module layout) in this project's `code-conventions.md` — the [commit](commit.md) skill reads it from there per project.

### 6. Seed guardrails

Write `projects/<name>/guardrails.md` from `skills/templates/project-guardrails-template.md`, pre-filled with the conventions, patterns, and constraints observed during the scan (coding style, testing expectations, hard don'ts). Keep rules short and imperative. This file is **prescriptive and human-owned** — it lives outside `wiki/`, is never overwritten by incremental refresh, and every ticket phase must respect it. **Tell the user it is theirs to edit** and that the AI will propose additions over time.

### 7. Generate personas

Write `personas.md` (the routing table) from `skills/templates/project-personas-template.md` and, **per layer**, a Domain Architect (`skills/templates/domain-architect-template.md`) and an Engineer (`skills/templates/engineer-template.md`) under `personas/`, specialized to the real stack and file layout. Link the generic personas from `skills/personas/`.

### 8. Wire it up

Add a Projects subsection to `index.md` linking the new pages; append an `ingest` entry to `log.md` including the commit; confirm the `project-registry.md` row is complete (page count filled in).

### 9. Verify (installer checklist)

- [ ] No copy of the repo exists in the vault; it is referenced only by its registry path.
- [ ] `projects/<name>/guardrails.md` exists (seeded from the template) and the user has been told it is theirs to edit.
- [ ] Every new project page has `commit:` frontmatter.
- [ ] `index.md` and `log.md` reference every page created.
- [ ] The `project-registry.md` row is complete (repo path, code index, worktree root, commit, scan date, page count).
- [ ] Configured CLIs have been run once in the repo (write/trust granted).
- [ ] Link lint is clean (standard Markdown links only, no stray wikilinks): `grep -rnE '\[\[' --include='*.md' .`

Report the result as an installation summary: **✓ Project `<name>` installed** — what was created, and the next steps (run a ticket, refresh later via Update Codebase).

## Relationship to other workflows

- **Update Codebase** (in `CLAUDE.md`) refreshes an already-added project incrementally via `git diff` against the last scanned commit — use that, not this skill, once a project exists.
- **Ticket Workflow** (`skills/ticket-workflow.md`) and the architects/engineers generated here drive day-to-day ticketed work.
- Wiki harvest and all page edits stay the **Curator**'s responsibility ([ticket-curation](ticket-curation.md)).
