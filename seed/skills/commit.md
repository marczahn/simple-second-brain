---
title: Commit
type: workflow
project: general
sources: [ticket-finalizing.md]
created: <today>
updated: <today>
---

# Commit

Create one or more commits from the current uncommitted changes, logically grouped by functionality, using **Conventional Commits**. Called by the Ship stage of [ticket-finalizing](ticket-finalizing.md), and usable standalone whenever the user asks to "commit".

> **Adjust this skill to your project.** The commit *type* vocabulary here is standard and global. The **scope map is per-project** — it lives in each project's `projects/<project>/wiki/code-conventions.md` (written during [add-project](add-project.md) from the repo's module layout), **not** in this file. This skill reads the active project's map at commit time, so multiple projects never collide.

## Workflow

1. **Extract the ticket reference.**
   - Get the current branch name.
   - Extract the ticket ID from it (typically the first segment, matching `{{TICKET_KEY_PATTERN}}`). Example: `proj-123-add-auth` → `PROJ-123`.
   - If unclear, ask the user. If the project uses no ticket IDs, skip the reference.
2. **Analyze changes.**
   - `git status` for staged, unstaged, and untracked files.
   - `git diff HEAD` for the actual changes.
   - Default scope is all changed files; determine logical functional groupings.
3. **Confirm exclusions.** Ask which files, if any, to exclude. Default: include everything. Keep an explicit include set and exclude set.
4. **Preflight the staging state.**
   - `git diff --cached --name-only` before proposing batches.
   - If the index is non-empty, list the staged files and ask whether to keep them in the first batch or unstage everything (`git restore --staged :/`).
5. **Propose logical batches.** Group by functionality; split into multiple commits only when it genuinely improves history; keep implementation and its tests together; each batch leaves the tree working. The union of batch files must equal the include set minus exclusions. Present each batch as:

   ```
   Batch 1: <functionality>
     Type: <feat|fix|refactor|...>   Scope: <scope|scope1,scope2|empty>   Breaking: <yes|no>
     Files:
       - path/to/file.ext
       - path/to/file_test.ext
     Message: <type>(<scope>)[!]: <concise subject>
              Refs: <TICKET-ID>
   ```
   Ask the user to confirm / adjust / merge before executing.
6. **Type per batch** (suggest, let the user override): `feat` · `fix` · `test` · `docs` · `refactor` · `style` · `perf` · `chore` · `ci` · `build`.
7. **Scope per batch** — read the **active project's scope map** from its `projects/<project>/wiki/code-conventions.md` and auto-detect from changed paths; support multiple scopes (comma-separated); allow empty for cross-cutting. The map is a list of `path/prefix/* → scope` rules, e.g. `apps/api/* → api`, `packages/ui/* → ui`. If the project has no scope map yet, infer from the top-level module layout and offer to record it in that project's `code-conventions.md`.
8. **Breaking changes** — flag API/contract changes, schema/compat changes, removed/renamed public interfaces, config-requirement changes. If unsure, ask. If yes, add `!` to the header.
9. **Draft messages** — `<type>(<scope>)[!]: <subject>` with a trailing `Refs: <TICKET-ID>` line where a ticket exists. Concise single-line subject. **Never add AI attribution.**
10. **Execute in order.** For each confirmed batch: stage only its files (`git add ...`), verify with `git diff --cached --name-only`, commit with the approved message, **never `--no-verify`** (let hooks run; if hooks modify files, re-stage and re-verify), report hash + subject.
11. **Report** — list created commits (hash + message), show `git log --oneline -n <count>`, and the final `git status`. Verify no non-excluded change was left out.

## Principles

- Logical grouping over mechanical splitting; a single commit when changes are cohesive.
- All intended changes are included across batches.
- Confirm batching and messages with the user before executing.
- Keep history parseable and stable with conventional-commit structure.
