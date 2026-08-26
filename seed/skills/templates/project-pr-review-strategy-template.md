---
title: <project> {{PR_NOUN}} Review Strategy
type: pr-review-strategy
project: <project>
sources: [skills/pr-review-workflow.md, projects/<project>/guardrails.md]
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# <project> {{PR_NOUN}} Review Strategy

**How a {{PR_NOUN}} is reviewed for this project.** Read by [pr-review-workflow](../pr-review-workflow.md) to build the reviewer lineup. Same ownership model as `guardrails.md`: human sets policy, the AI proposes additions, incremental refresh **never** overwrites it.

Scope: *how to review* (which lenses run, on which paths, against which checklist). The rules being reviewed *against* live in `guardrails.md` and the `wiki/` convention pages — link them, don't copy them.

> Strategy files are a family, one per activity (`pr-review-strategy.md` today; a `plan-strategy.md` may join it). Each answers "how is this activity run **here**", never "what are the rules".

## Area Map

Classify every changed path into exactly one area. An area with no changed file is **not reviewed**, and the review doc records that as `n/a` with the diffstat as evidence.

| Area | Path globs | Notes |
|------|-----------|-------|
| `backend` | `<paths>` | |
| `frontend` | `<paths>` | |
| `contract` | `<paths>` | API spec / generated clients |
| `data` | `<paths>` | migrations, schema |
| `infra` | `<paths>` | |
| `docs` | `<paths>` | ADRs, docs |

Unmapped paths default to the lead and are listed in the review doc so the map can grow.

## Reviewer Lineup

Each row is one review pass with its own context and checklist. "Runs when" decides membership; nothing else does.

| Reviewer | Contract | Runs when | Focus |
|----------|----------|-----------|-------|
| Lead — Principal Engineer Reviewer | [principal-engineer-reviewer](../personas/principal-engineer-reviewer.md) | always | ticket intent, consolidation, final call |
| Guardrails Reviewer | `projects/<project>/guardrails.md` | always | prescriptive-rule violations |
| Architecture Reviewer | project architect persona, review mode | always | fit, boundaries, ADR consistency |
| <Layer> Reviewer | project engineer persona, review mode | `<area>` touched | see the checklist below |
| Contract Reviewer | `wiki/api.md` | `contract` touched | |
| Test Reviewer | `wiki/testing-conventions.md` | always — a code change with no test is itself the finding | |
| Data Reviewer | `wiki/data-model.md` | `data` touched | |

**Always-on reviewers run even on a one-line diff.** Scoped reviewers are skipped with evidence, never silently.

Reuse the project's existing architects and engineers **in review mode** rather than inventing review-only personas; add a row with an inline checklist only for a lens no persona covers.

## Escalation Triggers

Conditions that add a reviewer regardless of the area map.

| Trigger | Adds |
|---------|------|
| `<e.g. a new migration>` | Data Reviewer |
| `<e.g. a shared client/transport file>` | Architecture Reviewer pass on blast radius |
| `<e.g. diff over N lines>` | second Lead pass on scope creep |

## Per-Area Checklists

Keep every item **checkable against the diff**. A reviewer reports each as `[x]` pass, `[!]` finding, or `[n/a]` + reason.

### <Area> checklist

- [ ] `<rule>` — link the guardrail or wiki page it comes from

## Hot Spots

Recurring, project-specific failure modes every reviewer should actively probe for — what this codebase has actually been burned by. One line each, with the incident or ADR that earned the entry.

- `<hot spot>` — why it bites, what to check.

## Calibration

- **Severity mapping** — e.g. "a guardrail violation is never below `major`".
- **Noise floor** — what this project does *not* want raised, beyond the generic list in the reviewer persona.
- **Independent-duplicate rule** — two reviewers reaching the same finding separately: one entry, both named, higher confidence, same severity.
