---
title: Ticket Registry
type: registry
project: general
created: <today>
updated: <today>
---

# Ticket Registry

Centralized operational state for ticket work. The `Status` column must always match the `status:` frontmatter of each `ticket.md` — the [lint](skills/lint.md) skill reconciles the two. Statuses: `draft` · `blocked` · `ready` · `planned` · `in-progress` · `in-review` · `done` · `curated` · `cancelled` (see [ticket-status-model](skills/shared/ticket-status-model.md)). The `Reviewer` column mirrors the ticket's chosen cross-model reviewer (`reviewer_provider` / `reviewer_model`, e.g. `codex / <model>`).

| Ticket | Project | Status | Clarification | Plan | Reviewer | Worktree | Updated |
|--------|---------|--------|---------------|------|----------|----------|---------|
