---
title: Ticket Status Model
type: reference
project: general
sources: [ticket-workflow.md]
created: <today>
updated: <today>
---

# Ticket Status Model

Shared status vocabularies for ticketed work. Phase skills set and read these; the composer ([[ticket-workflow]]) dispatches by ticket status. **Every phase and gate that changes a status must write it in both the ticket frontmatter and `ticket-registry.md` in the same step** — see [[ticket-conventions#Registry Rules]]. The [[lint]] skill reconciles the two.

## Ticket Status
- `draft` — initial capture
- `blocked` — clarification or dependency gap prevents progress
- `ready` — clarification complete; planning may start
- `planned` — executable, user-approved plan exists
- `in-progress` — execution started; also held through the cross-model code review (the review is part of execution, not a separate status)
- `in-review` — implementation complete **and the cross-model code review has passed**; awaiting QA. A ticket only reaches `in-review` after the code-review gate approves, so resuming an `in-review` ticket never re-opens the gate.
- `done` — QA-passed and shipped (committed, pushed, {{PR_NOUN}} opened)
- `curated` — learnings harvested into the wiki; terminal
- `cancelled` — intentionally stopped or superseded; terminal

`done` and `curated` are **distinct on purpose**: `done` means the work shipped and passed QA; `curated` means the knowledge was promoted to the wiki. A `done`-but-not-`curated` ticket is an unfinished tail the [[lint]] skill flags and the composer can resume by dispatching to [[ticket-curation]].

## Clarification Status
- `open` — unresolved blocking questions exist
- `resolved` — all blocking questions addressed

## Plan Status
- `draft` — not yet review-ready
- `executable` — meets the quality bar; awaiting cross-model review
- `peer-reviewed` — reviewed cross-model; findings resolved; awaiting user approval
- `approved` — user approved; execution may start
- `in-progress` — being executed
- `done` — execution and validation complete
- `superseded` — replaced by a newer plan
