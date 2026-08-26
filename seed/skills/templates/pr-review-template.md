---
title: {{PR_NOUN}}-000 Review
type: pr-review
project: general
pr: <url>
ticket: <TICKET-ID or "none">
lead_reviewer: Principal Engineer Reviewer
pr_review_strategy: projects/<project>/pr-review-strategy.md   # or "none (lead-only review)"
reviewers: [<lineup members that ran>]
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
commit: <head SHA at review time>
---

# {{PR_NOUN}}-000 Review — <title>

> **How to use:** check `[x]` the findings to post; leave `[ ]` to drop. Then tell the reviewer to proceed. Inline findings post as line comments; general findings post in one summary comment.

## Context
- **{{PR_NOUN}}:** <url> — `<base>` ← `<head>`, by @<author>
- **Ticket:** <id + title> — or `none found` (reviewed code-only)
- **What the change claims to do:** …
- **What the ticket asks for:** …
- **Diff shape:** <N files, +A/-D>; areas touched: <from the strategy's Area Map>

## Reviewer Lineup

> Built from `projects/<project>/pr-review-strategy.md`. Every row that did **not** run states its evidence.

| Reviewer | Ran? | Scope / evidence |
|----------|------|------------------|
| Lead — Principal Engineer Reviewer | yes | always-on |
| <Reviewer> | yes | <areas / files covered> |
| <Reviewer> | **n/a** | <diffstat evidence the area is untouched> |

- **Area-map gaps:** <paths matching no glob — or "none">
- **Escalation triggers fired:** <trigger → reviewer added — or "none">

## Checklist Audit

> Per reviewer: `[x]` pass, `[!]` finding (links to the finding below), `[n/a]` + reason. Shows what was checked and passed, not only what failed.

### <Reviewer>
- [x] <checklist item>
- [!] <checklist item> → Finding N
- [n/a] <checklist item> — <reason>

## Ticket Alignment
- [ ] **[severity]** Acceptance criterion not met / scope creep / unimplemented — _general_
  - **Problem:** …
  - **Suggested fix:** …

Acceptance-criteria checklist (reviewer's read, not posted):
- [ ] AC1: … — met? yes / no / partial

## General Findings
- [ ] **[severity]** Short title — _general_
  - **Reviewer(s):** <who raised it; two names = independent duplicate, higher confidence>
  - **Problem:** …
  - **Suggested fix:** …
  - **Convention/ADR/pattern reference:** … (or "deviation justified because …")

## Change-Specific Findings
- [ ] **[severity]** Short title — `path/to/file.ext:120-128`
  - **Reviewer(s):** …
  - **Problem:** …
  - **Suggested fix:** …
  - **Fit note:** matches / deviates because …

## Cross-Cutting Risks (not posted unless promoted to a finding)

> Themes the lead saw only by reading all passes together — accepted windows nobody owns, duplication held together by convention alone, blast radius hidden by the title.

- …

## Reviewer Notes (not posted)
- Files read for context beyond the diff: …
- Conventions/wiki pages consulted: …
- Open questions for the author: …
- **Proposed strategy amendments** (for the human to land in `pr-review-strategy.md`; never written by the reviewer): …
