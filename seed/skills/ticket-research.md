---
title: Ticket Research
type: workflow
project: general
sources: [ticket-workflow.md]
created: <today>
updated: <today>
---

# Ticket Research — Phase 1

**Owner:** Business Analyst (`skills/personas/business-analyst.md`)
**Consumes:** user intent or a ticket-system ID. **Produces:** a `ready` `ticket.md` with `domain:` and the cross-model reviewer set.
**Shared infra:** [ticket-status-model](shared/ticket-status-model.md), [ticket-conventions](shared/ticket-conventions.md) (knowledge sources, naming, registry, templates). Entry point: [ticket-workflow](ticket-workflow.md).

The goal of this phase is clarity before commitment. No plan, no code — only a well-defined work item. Think deeply about the problem and the shape of the solution before writing.

## Steps

1. **Pull the source.**
   - If a ticket-system ID is provided (matching `{{TICKET_KEY_PATTERN}}`), fetch it via `{{TICKET_ACCESS}}`. Read summary, description, comments, and linked issues.
   - Otherwise, take the user's described task as the input.
2. **Gather context** in the [knowledge-source order](shared/ticket-conventions.md#knowledge-sources): ticket → project docs → llm-wiki → code-intelligence index → code (`grep`). Understand what exists, what the change touches, and where the risks are.
3. **Think through problem and solution.** Restate vague goals as observable outcomes. Separate confirmed facts from assumptions. Sketch the solution direction far enough to expose ambiguities — but do not design the implementation (that is Planning).
4. **Create the ticket** from `skills/templates/ticket-template.md` at `projects/<project>/tasks/<TICKET-ID-short-title>/ticket.md`. Fill problem, desired outcome, in/out scope, constraints, dependencies, and **testable** acceptance criteria.
5. **Set `domain:`** — `frontend` (UI/components/styles), `backend` (API/DB/sync), or `full-stack` (both). This routes Planning and Execution.
6. **Choose the cross-model reviewer.** Ask the user which provider + model should review this ticket's plan and code, and record it on the ticket (`reviewer_provider` / `reviewer_model`). **Pre-select a genuine cross-model default** — a provider different from the tool you are driving with; a same-provider reviewer does not satisfy the gate. See [providers#Choosing the reviewer (per ticket)](shared/providers.md#choosing-the-reviewer-per-ticket).
7. **Surface assumptions, then clarify — mandatory round.** Never treat a ticket as fully clear. First, **write out the assumptions** you would otherwise make silently: chosen defaults, scope edges, data shapes, edge-case behaviour, integration points. Then turn the riskiest of them into questions and put them to the user.
   - **Ask at least 5 questions, even when nothing looks unclear.** The floor is deliberate: it forces the hidden assumptions into the open instead of into the plan. On a genuinely small ticket, 5 may feel like a stretch — ask them anyway; the marginal question is cheap, a wrong silent assumption is not.
   - **Every question must earn its place.** Each one must be (a) *unanswerable* from context already gathered (ticket, project docs, llm-wiki, code) — never ask what the sources already answer — and (b) *decision-changing* — the plan or acceptance criteria differ depending on the answer. No filler to hit the count; if you cannot reach 5 real questions, that itself is a signal you have not dug into the assumptions hard enough.
   - Record the questions directly in the ticket — short, concrete, decision-oriented — and identify who/what resolves each. Keep the ticket `blocked` while any question is open.
8. **Run the readiness gate.** Mark the ticket `ready` (clarification `resolved`) only when every condition below is true.
9. **Write the status** (`ready`, clarification `resolved`, `domain:`) and the chosen reviewer to **both** the ticket frontmatter and `ticket-registry.md` — same step, with `updated:`.

## Readiness Gate

A ticket is `ready` only if all are true:

- Problem is described in observable terms.
- Desired outcome is concrete.
- Acceptance criteria are testable.
- In-scope work is listed.
- Out-of-scope work is listed.
- Constraints and dependencies are documented.
- Assumptions were surfaced and the mandatory clarification round ran (≥5 real, decision-changing questions).
- Blocking questions are resolved or explicitly deferred.
- The validation approach is known.
- A cross-model reviewer (`reviewer_provider` / `reviewer_model`) is selected and recorded.

If any is missing, the output is not a ticket-ready handoff — it is another clarification pass.

## Boundaries

- Does not write a plan or code.
- Does not create a worktree or branch.
- Does not edit project wiki pages.

## Handoff

Ticket `ready`, clarification `resolved`, `domain:` set, registry updated → hand to [ticket-planning](ticket-planning.md).
