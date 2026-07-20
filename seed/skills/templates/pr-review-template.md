---
title: {{PR_NOUN}}-000 Review
type: pr-review
project: general
pr: <url>
ticket: <TICKET-ID or "none">
reviewer: Principal Engineer Reviewer
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

## Ticket Alignment
- [ ] **[severity]** Acceptance criterion not met / scope creep / unimplemented — _general_
  - **Problem:** …
  - **Suggested fix:** …

Acceptance-criteria checklist (reviewer's read, not posted):
- [ ] AC1: … — met? yes / no / partial

## General Findings
- [ ] **[severity]** Short title — _general_
  - **Problem:** …
  - **Suggested fix:** …
  - **Convention/ADR/pattern reference:** … (or "deviation justified because …")

## Change-Specific Findings
- [ ] **[severity]** Short title — `path/to/file.ext:120-128`
  - **Problem:** …
  - **Suggested fix:** …
  - **Fit note:** matches / deviates because …

## Reviewer Notes (not posted)
- Files read for context beyond the diff: …
- Conventions/wiki pages consulted: …
- Open questions for the author: …
