---
title: Project Registry
type: registry
project: general
created: <today>
updated: <today>
---

# Project Registry

Centralized operational state for codebase-backed sources. Source of truth for the latest scan status of each project, and the **only** pointer from the vault to each backing repo — repos are referenced by path here, never copied into the vault.

| Project | Repo Path | Code Index | Worktree Root | Last Scan Date | Last Scanned Commit | Pages | Overview |
|---------|-----------|------------|---------------|----------------|---------------------|-------|----------|

## Notes
- Update whenever a codebase is first ingested or incrementally refreshed.
- `Repo Path` is the canonical filesystem location of the backing repo. Never copy the repo into the vault — this path is the single reference.
- `Code Index` records whether a code-intelligence index is available for the repo; if so, prefer querying it over re-scanning files.
- `Worktree Root` is where per-ticket worktrees live for this project (default `<repo>/.worktrees`). If it sits inside the repo, the user is responsible for gitignoring it.
- Use `Last Scanned Commit` to scope `git diff` during updates.
- Keep per-page `commit:` frontmatter for page-level provenance; use this file for project-level scan state.
