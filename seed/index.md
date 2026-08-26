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
- [overview](overview.md) — High-level synthesis across all projects and knowledge.
- [project-registry](project-registry.md) — Centralized scan state for codebase-backed sources.
- [ticket-registry](ticket-registry.md) — Centralized mutable state for ticket status.

## Skills
- [ticket-workflow](skills/ticket-workflow.md) — Composer for ticketed work: single entry point, dispatches the five phase skills by status and enforces gates.
- [ticket-research](skills/ticket-research.md) — Phase 1 (Business Analyst): clarify, set `domain:`, produce a `ready` ticket.
- [ticket-planning](skills/ticket-planning.md) — Phase 2 (Domain Architect): code-level plan, cross-model review, user approval.
- [ticket-execution](skills/ticket-execution.md) — Phase 3 (Engineering personas): implement with tests; cross-model code review.
- [ticket-finalizing](skills/ticket-finalizing.md) — Phase 4 (QA → Ship): validate, commit, push, open {{PR_NOUN}}; ends at `done`.
- [ticket-curation](skills/ticket-curation.md) — Phase 5 (Curator): harvest learnings into the wiki; `done` → `curated`.
- [pr-review-workflow](skills/pr-review-workflow.md) — Standalone, two-stage, ticket-aware {{PR_NOUN}} review: reviewer lineup from the project's strategy, one pass per reviewer, consolidated into a checkbox doc.
- [add-project](skills/add-project.md) — Onboard a new codebase (installer; reference by path, never copy).
- [commit](skills/commit.md) — Conventional-commit helper; the ship stage delegates to it.
- [lint](skills/lint.md) — Health check + status/registry reconciliation + stale-worktree check.
- [Ticket Status Model](skills/shared/ticket-status-model.md) — status vocabularies.
- [Ticket Conventions](skills/shared/ticket-conventions.md) — knowledge sources, artifacts, naming, registry, templates.
- [Ticket Personas](skills/shared/ticket-personas.md) — persona routing.
- [Ticket Gates](skills/shared/ticket-gates.md) — cross-model + user gates, provider pairing.
- [Ticket Worktrees](skills/shared/ticket-worktrees.md) — worktree per ticket.
- [Providers](skills/shared/providers.md) — provider/model setup, ACP + headless invocation, write permissions.
- [ACP review runner](skills/shared/acp-review.mjs) — the vault's ACP client; runs one cross-model review turn and enforces the gate invariants in code.
- [ACP Protocol](skills/shared/acp-protocol.md) — wire-level JSON-RPC flow underneath the runner; read when debugging a review or adding an ACP agent.
- [Business Analyst](skills/personas/business-analyst.md) — problem definition + cross-model plan reviewer.
- [Architect](skills/personas/architect.md) — generic fallback architect (needs user confirmation).
- [QA Engineer](skills/personas/qa-engineer.md) — acceptance-criteria validation.
- [Curator](skills/personas/curator.md) — wiki harvest after ticket completion.
- [Principal Engineer Reviewer](skills/personas/principal-engineer-reviewer.md) — {{PR_NOUN}} review persona and **review lead**: builds the per-project reviewer lineup and consolidates its findings.

## Projects
<!-- one subsection per project, added during ingest -->

## Concepts
## Entities
## Comparisons
## Analyses
