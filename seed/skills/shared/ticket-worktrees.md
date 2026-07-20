---
title: Ticket Worktrees
type: reference
project: general
sources: [ticket-workflow.md, project-registry.md]
created: <today>
updated: <today>
---

# Worktree Per Ticket

> Git only. If the user is not on git or declined worktrees, replace this file with: "Each ticket gets its own branch off `{{DEFAULT_BRANCH}}`; switch branches to switch tickets; the user merges and deletes branches."

Each ticket gets its own git worktree on its own branch. Created by the **Engineering Persona** at execution start, removed manually by the user after the ticket closes.

## Location

Worktrees live under the project's **worktree root**, recorded per project in `project-registry.md`. Default: `<repo>/.worktrees/`, i.e.:

```
<worktree-root>/<TICKET-ID>/
```

where `<repo>` is the project's resolved repo path from `project-registry.md`, and `<worktree-root>` is that project's `Worktree Root` column (default `<repo>/.worktrees`).

> The default `.worktrees` sits **inside** the repo working tree. Keeping it out of version control (`.gitignore`, `.git/info/exclude`, or a global exclude) is the **user's responsibility** — the workflow flags this at add-project time but does not edit the repo's ignore rules for them.

## Branch naming

Bare ticket ID, lowercased (`{{TICKET_KEY_PATTERN}}` → lowercase). No prefix, no slug.

## Sub-tickets

A dotted child ticket (e.g. `ABC-12.1`, `ABC-12.tests`) shares the parent's worktree and branch. Record the shared worktree path in the sub-ticket's frontmatter; do not create a separate worktree.

## Creation

Engineering Persona runs at activation, before any edit:

```bash
git -C <repo> worktree add <worktree-root>/<TICKET-ID> -b <branch> origin/{{DEFAULT_BRANCH}}
git -C <worktree-root>/<TICKET-ID> push -u origin <branch>
```

The upstream **must always** track the branch itself — never `{{DEFAULT_BRANCH}}`. This guarantees `git push`/`git pull` from the worktree only ever touch the ticket's own branch. Verify with `git -C <worktree-path> rev-parse --abbrev-ref @{u}` → must return `origin/<branch>`.

After creation, copy any local-only files into the worktree (these must never be committed):

```bash
# for each of {{ENV_FILES}}:
cp <repo>/<env-file> <worktree-path>/<env-file>
grep -q '<env-file>' <worktree-path>/.gitignore || echo '<env-file>' >> <worktree-path>/.gitignore
```

If the worktree already exists (re-entry after review findings, or a sub-ticket sharing a parent's worktree), reuse it — do not recreate.

## Tracking

- Ticket frontmatter: `branch:` and `worktree:` fields, set at worktree creation.
- Ticket registry: `Worktree` column with the path (or `-` if not yet created or already removed).

## Cleanup

Manual. The user removes worktrees when ready:

```bash
git -C <repo> worktree remove <worktree-path>
```

When removed, set the registry's `Worktree` column to `-`. Leave the ticket frontmatter `branch:`/`worktree:` intact as historical record.

## Stale worktree lint

The [[lint]] skill flags:

- worktree directories with no matching ticket
- worktree directories whose ticket is `done`, `curated`, or `cancelled` (removal candidates)
- tickets with `Worktree` set in the registry but no directory on disk
