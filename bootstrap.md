# bootstrap.md — Install an LLM-Maintained Engineering Second Brain

> **You are an LLM reading this because a human asked you to install a "second brain" vault.**
> This is a **run-once installer**. Read it top to bottom first. Then run it as an installation: **check prerequisites → ask where to install → interview → confirm → scaffold → install first project(s) → verify → hand off.** Present it like an installer — announce each stage, report each artifact as it's created, and finish with a clear ✓ summary. When you finish, retire this file (final step).

The files you will write live next to this one in **`seed/`** — a complete, place-held copy of the vault. Your job is mostly: gather settings, then **copy `seed/**` into the target folder, substituting every `{{PLACEHOLDER}}`**, then install the first project(s). Do **not** hand-author the vault files from scratch — they already exist in `seed/`.

---

## Part 0 — What you're installing

A persistent, **LLM-maintained wiki** ("second brain") for software engineering across real codebases. The LLM writes and maintains it; the human curates sources, directs analysis, approves plans. It is plain Markdown (ideally opened in [Obsidian](https://obsidian.md)) — no app, no database. The idea comes from Karpathy's llm-wiki, adapted to engineering with: codebase ingestion pinned to a commit, a five-phase ticket lifecycle owned by named personas, two independent cross-provider review gates, and provider/tool neutrality.

Five moving parts, kept separate: **schema** (`CLAUDE.md`), **wiki pages** (knowledge), **skills** (procedure), **personas** (behavior), **operational state** (registries + log).

### The ticket lifecycle

A thin **composer** (`ticket-workflow.md`) dispatches by ticket status to one of **five** self-contained phase skills, enforcing a hard gate at each boundary:

```
research → planning → execution → finalizing → curation
(Business   (Domain    (Engineer   (QA → Ship)   (Curator)
 Analyst)    Architect)  persona)        │             │
   ready      plan+       code+          done       curated
   ticket     xreview     tests+                    (+ wiki
              +USER GATE   xreview                   harvest)
```

`done` (shipped + QA-passed) and `curated` (learnings harvested to the wiki) are **distinct** statuses so a shipped-but-unharvested ticket is visible and resumable.

---

## Part 1 — Prerequisite checks (announce as "Checking prerequisites…")

Check and report each, ✓ / ✗:

1. **git** — `git --version`. The default flow uses one worktree per ticket. If not on git, note it; you'll swap the worktree section for branch-per-ticket during scaffold.
2. **Primary AI CLI** — the tool you're running in.
3. **A second provider CLI** for the cross-model gates — this vault supports **Claude Code** (`claude`) and **OpenAI Codex** (`codex`). Check whichever the user doesn't drive with. If the intended reviewer CLI is missing or unauthenticated, **do not paper over it** — tell the user it must be installed and working, and offer to help set it up. The gates are core, not optional.
4. **Code-host CLI** (optional but recommended) — `gh` / `glab`, authenticated.
5. **Code-intelligence index** (recommended) — e.g. an MCP like codegraph. Strongly suggest enabling one; it makes every phase cheaper and keeps the vault free of code copies.

Report the results, then proceed to the interview. Missing *optional* tools are fine; a missing *reviewer* provider is a blocker to raise.

---

## Part 2 — The interview (ask in small batches; offer a default for each)

Record every answer. Substitute the `{{PLACEHOLDER}}` tokens (right column) throughout `seed/**` during scaffold.

### 2.0 Install location (ask FIRST)

- **Ask:** *Where should I install the vault, and what should it be called?* Give me an **absolute path to an empty (or new) folder** — somewhere synced/backed-up (iCloud, Dropbox, …) — plus a name.
- **Advice:** The folder should be dedicated to this vault. If you use Obsidian, it becomes a "vault." Do not install into this seed repo.
- **Capture:** `{{VAULT_PATH}}`, `{{VAULT_NAME}}`. Confirm the folder exists and is empty (create it if needed); if non-empty, stop and ask before writing.

### 2.1 Providers & models (Claude Code + Codex)

- **Ask:** Which is your **primary driver**, Claude Code or Codex? Which **model**? And the **reviewer** — the *other* provider — which model there? (Cross-*family* is the point: the reviewer must differ from the author.)
- **Headless invocations** used by the gates (see `seed/skills/shared/providers.md`): Claude → `claude -p "<prompt>"`; Codex → `codex exec - < <prompt-file>`. Reviewers run **non-interactively** (one-shot exec), never as a spawned interactive agent.
- **Per-project write perms:** remind the user each chosen CLI must be run **once inside each repo** to gain write/trust there — this also goes on the add-project checklist.
- **If the chosen provider isn't installed/working:** convince the user to fix it before continuing; don't silently degrade.
- **Capture:** `{{PRIMARY_PROVIDER}}`, `{{PRIMARY_MODEL}}`, `{{PRIMARY_CLI}}`, `{{REVIEWER_PROVIDER}}`, `{{REVIEWER_MODEL}}`, `{{REVIEWER_INVOCATION}}`.

### 2.2 Version control

- **Ask:** VCS (almost always `git`) and default branch (`main`/`master`/`trunk`)?
- **Capture:** `{{VCS}}` (default `git`), `{{DEFAULT_BRANCH}}` (default `main`).

### 2.3 Code host / forge

- **Ask:** Where does code live (GitHub/GitLab/…), which CLI (`gh`/`glab`), and any auto-reviewer bot to request on each {{PR_NOUN}}? No forge → local-diff review only.
- **Capture:** `{{VCS_HOST}}`, `{{HOST_CLI}}`, `{{PR_NOUN}}` (PR/MR), `{{PR_AUTO_REVIEWER}}` (may be empty).

### 2.4 Ticket system

- **Ask:** Jira / GitHub Issues / Linear / none? ID pattern (e.g. `KEY-1234`, `#123`)? How to reach it (MCP tool, CLI, API)? None → local Markdown tickets `TASK-001`.
- **Capture:** `{{TICKET_SYSTEM}}`, `{{TICKET_KEY_PATTERN}}`, `{{TICKET_ACCESS}}`, `{{LOCAL_TICKET_PREFIX}}` (default `TASK`).

### 2.5 Worktrees & env files

- **Ask:** Default per-project worktree root, and any local-only files (`.env`, secrets, certs) to copy into each worktree?
- **Advice:** Default worktree root is **`<repo>/.worktrees`** — recorded per project in the registry and overridable at add-project time. If it sits inside the repo, the **user must gitignore it** (the workflow won't edit their ignore rules — it only reminds).
- **Capture:** `{{WORKTREE_DEFAULT}}` (default `<repo>/.worktrees`), `{{ENV_FILES}}` (list, may be empty).

### 2.6 Code-intelligence index

- **Ask:** Do you have a symbol/graph index (e.g. codegraph)? **Recommend** enabling one.
- **Capture:** `{{CODE_INDEX}}` (tool name or "none").

### 2.7 First project(s)

- **Ask:** Which repo(s) to document first? For each: name, resolved path, stack, layers (frontend/backend/full-stack/data/infra), default branch, worktree root (default `<repo>/.worktrees`), code-index availability.
- **Advice:** Start with **one** repo. Referenced by path only — **never copied in**. Per layer you'll generate a Domain Architect + an Engineer persona.

### 2.8 Confirm settings

Echo a filled-in block and get an explicit **yes** before writing anything:

```
Install to:   {{VAULT_NAME}} at {{VAULT_PATH}}
Primary:      {{PRIMARY_PROVIDER}} / {{PRIMARY_MODEL}}  (headless: {{PRIMARY_CLI}})
Reviewer:     {{REVIEWER_PROVIDER}} / {{REVIEWER_MODEL}}  (invoked: {{REVIEWER_INVOCATION}})
VCS / host:   {{VCS}} → {{VCS_HOST}} (cli {{HOST_CLI}}, branch {{DEFAULT_BRANCH}}, auto-reviewer {{PR_AUTO_REVIEWER}})
Tickets:      {{TICKET_SYSTEM}} (pattern {{TICKET_KEY_PATTERN}}, access {{TICKET_ACCESS}}, local prefix {{LOCAL_TICKET_PREFIX}})
Worktrees:    {{WORKTREE_DEFAULT}}   env files: {{ENV_FILES}}
Code index:   {{CODE_INDEX}}
First project(s): <list>
```

---

## Part 3 — Scaffold (announce "Installing vault…"; tick each item)

1. **Copy the seed.** Copy every file under `seed/` into `{{VAULT_PATH}}/`, preserving the tree. Then **substitute all `{{PLACEHOLDER}}` tokens** with the interview values in every copied file, and replace `<today>` with the current date.
   - If a secondary provider reads a different bootstrap filename than `AGENTS.md`, still keep `CLAUDE.md` canonical and make the other a thin shim (copy/rename `AGENTS.md`).
   - **Not on git / no worktrees?** Replace `skills/shared/ticket-worktrees.md` body with the branch-per-ticket fallback noted at its top.
   - **No forge?** In `skills/pr-review-workflow.md`, keep Stage 1 as a local-diff review and drop Stage 2 (posting).
2. **Verify no token survives:** `grep -rn '{{' "{{VAULT_PATH}}" --include='*.md'` must return nothing (except intended examples). Fill any leftover.
3. Report the tree written (schema, composer + 5 phase skills, shared refs, personas, templates, commit/lint, operational files).

---

## Part 4 — Install the first project(s) (announce "Installing project <name>…")

For each project from 2.7, run the **Add Project** installer (`{{VAULT_PATH}}/skills/add-project.md`) end to end:

- Preflight: confirm the repo path & git; **run each configured CLI once inside the repo** to grant write/trust; note code-index availability.
- Record the resolved path + current commit in `project-registry.md` (never copy the repo in). Fill the `Worktree Root` column.
- Create `projects/<name>/{raw,wiki,personas,tasks}/`.
- Explore (prefer the code index) and write `wiki/overview.md` + warranted pages, each with `commit:` frontmatter and real code snippets on pattern pages.
- Generate `personas.md` + a Domain Architect and Engineer per layer, from the templates, specialized to the real stack. Record the project's commit scope map in its `code-conventions.md` (the `commit` skill reads it per project).
- Update `index.md` (Projects subsection), `log.md` (ingest entry + commit), and complete the registry row.

---

## Part 5 — Verify (announce "Verifying installation…")

- [ ] Tree matches: `CLAUDE.md`, `AGENTS.md`, `index.md`, `log.md`, `overview.md`, `project-registry.md`, `ticket-registry.md`, `raw/`, `projects/`, `skills/`.
- [ ] `skills/` has the composer + 5 phase skills (research, planning, execution, finalizing, curation), `pr-review-workflow`, `add-project`, `commit`, `lint`.
- [ ] `skills/shared/` has all 6 refs (status-model, conventions, personas, gates, worktrees, providers).
- [ ] `skills/personas/` has 5 generic personas; `skills/templates/` has 7 templates.
- [ ] No repo is copied into the vault; each is referenced only by its `project-registry.md` path.
- [ ] `ticket-gates.md` names a **different** provider for the reviewer than the primary.
- [ ] Each first project: registry row (repo path, code index, worktree root, commit), `overview.md` with `commit:`, `personas.md`, and a Domain Architect + Engineer per layer.
- [ ] No `{{PLACEHOLDER}}` survives: `grep -rn '{{' "{{VAULT_PATH}}" --include='*.md'`.
- [ ] Anchor-link lint clean: `grep -rnE '\]\([^)]*#[^)]+\)' "{{VAULT_PATH}}" --include='*.md'`.

---

## Part 6 — Hand off (announce "✓ Installed")

Tell the human:

1. **What was installed** — a one-paragraph tour of the tree and the lifecycle (composer → five phases → gates).
2. **Day-to-day:**
   - "Add a project / document repo X" → `skills/add-project.md` (installer; references by path, never copies).
   - "Work ticket Y" → start at the composer `skills/ticket-workflow.md` (clarify → plan → cross-model plan review → your approval → execute → cross-model code review → QA → ship → **curate**).
   - "Review {{PR_NOUN}} <url>" → `skills/pr-review-workflow.md`.
   - "Refresh the wiki for X" → Update Codebase (incremental, in `CLAUDE.md`).
   - "Health check" → `skills/lint.md` (also catches forgotten status changes and un-curated `done` tickets).
3. **Open Obsidian** on the vault for wikilinks + graph view.
4. **Next steps** — add remaining repos; drop reference docs into `raw/` or `projects/<name>/raw/`; run each provider CLI once per new repo; periodically check for newer model IDs and update the Tooling Profile.
5. **Retire this installer** — move `bootstrap.md` (and `seed/`) out of the vault, or delete your copy. Its job is done; `CLAUDE.md` now governs the vault.

> Maintenance reminder for future models: `CLAUDE.md` is the constitution; registries + `log.md` hold mutable state; personas define behavior; skills define procedure (composer routes, phase skills do the work, `skills/shared/` holds the facts). Keep them separate, keep `commit:` frontmatter honest, write every status change to **both** frontmatter and registry, and never let a plan reach the human — or a diff reach QA — without an independent-model review first.
