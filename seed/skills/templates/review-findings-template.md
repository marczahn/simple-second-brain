---
title: TICKET-000 Review Findings — <plan|code>
type: review-findings
project: general
ticket: TICKET-000
phase: <plan|code>
reviewer_provider: <provider>
reviewer_model: <model>
round: 0
verdict: <approve|revise>
counts: { blocker: 0, major: 0, minor: 0, nit: 0, question: 0 }
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# TICKET-000 Review Findings — <plan|code>

Rolling ledger for this phase's Cross-Model Review Gate. **The reviewer writes and
updates this file** (its only write target — the repo stays read-only). The author
reads it, acts on each finding, and records the outcome in `status:` below. Both
carry it forward across the three-round budget — one file, not one per round.

To the caller the reviewer returns only a brief summary (verdict + severity counts +
this file's path); the detail lives here so it survives a crash and is not paraphrased
through the caller.

## Findings

<!-- One entry per finding. Reviewer appends new findings and re-scores existing
     ones each round; author sets `status:` after acting. -->

### F1 — <one-line title>
- **severity:** <blocker|major|minor|nit|question>
- **location:** <file:line or plan step / acceptance criterion>
- **round:** <round first raised>
- **status:** open <!-- open | fixed | dismissed -->
- **finding:** What is wrong and why it matters.
- **resolution:** <how it was fixed, or the dismissal reason — filled in by the author>

## Round Log

<!-- Append one line per round: what the reviewer returned and what the author did. -->
- r1 — reviewer: <verdict, counts>; author: <action>
