---
title: <project> Guardrails
type: guardrails
project: <project>
created: <today>
updated: <today>
---

# <project> Guardrails

**Prescriptive, human-owned rules the agent MUST follow when working on this project.** This file is the single place to declare project conventions, coding guidelines, and dos/don'ts. Both the human and the AI may edit it — the human sets policy, the AI proposes additions as it learns.

Distinct from the `wiki/` pages: those are *descriptive* (what the code currently is, regenerated on refresh); this is *prescriptive* (what work must obey) and is **never overwritten by incremental refresh**. When a rule here conflicts with an observation in the wiki, **this file wins** — treat the divergence as something to fix in the code or flag to the human.

> Keep rules short, imperative, and testable ("Always X", "Never Y"). Delete rules that no longer apply. When a rule needs background, link the wiki page that explains it rather than restating it.

## Coding guidelines
<!-- Language/style rules, structure, error handling, naming beyond kebab-case. -->
-

## Testing
<!-- What must be tested, frameworks, coverage expectations, how tests are run. -->
-

## Architecture & patterns
<!-- Boundaries that must hold, patterns to follow or avoid, ADR conventions. -->
-

## Do / Don't
<!-- Hard constraints. e.g. "Never edit generated files under gen/." -->
-

## Dependencies & tooling
<!-- Allowed/forbidden libraries, version pins, build/lint/format commands. -->
-
