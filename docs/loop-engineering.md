# Loop Engineering

This project's ticket lifecycle is an **adapted form of _loop engineering_** — the discipline of designing the
loops an AI agent runs in, rather than just the prompt you hand it. This page explains the concept and how Simple
Second Brain adapts it.

## The concept

Past a certain point, agent quality comes less from a better model and more from a better *loop* around the model.
Loop engineering (LangChain also calls it "loopcraft") is the practice of building that loop: how the system
repeatedly **observes → acts → verifies → recovers** until a goal is met — and, crucially, how it knows when to
*stop*. An LLM has no built-in concept of "done," so a loop left to its own devices either refines forever, drifts
off the goal, or stalls silently. Much of the craft is therefore the guardrails: bounded iterations, explicit stop
conditions, and verification against a real target.

The commonly cited framing stacks loops, each one wrapping and improving the one below it:

1. **Agent loop** — the model calls tools until a task is done. The base.
2. **Verification loop** — a grader checks the output against a rubric and feeds corrective findings back.
3. **Event-driven loop** — triggers (webhooks, cron) run the agent on their own, without a human kicking it off.
4. **Self-improvement (hill-climbing) loop** — signals from finished runs feed back to improve the harness itself.

> **Official source.** The term is developed in LangChain's
> [*The Art of Loop Engineering*](https://www.langchain.com/blog/the-art-of-loop-engineering). For a broader survey
> of loop patterns (ReAct, Reflexion, plan-and-execute, and the stopping-condition problem), see Data Science Dojo's
> [*Agentic Loops: From ReAct to Loop Engineering*](https://datasciencedojo.com/blog/agentic-loops-explained-from-react-to-loop-engineering-2026-guide/).

## How Simple Second Brain adapts it

Most loop-engineering writing chases **autonomy** — let the loop run until it decides it's done. This project
deliberately dials autonomy *down* and verification *up*, because the goal is **trustworthy, auditable, resumable**
work, not a hands-off machine.

It stacks three of the four loops, the way the pattern prescribes:

- **Agent loop** — each phase skill (research → planning → execution → finalizing → curation) is a named persona
  running tools to produce one artifact, then handing off.
- **Verification loop** — the two [cross-model review gates](concept.md#the-independent-review-gates) grade each
  artifact against a persona's rubric and feed findings back to the author. It is bounded to **at most three
  rounds**: round 1 addresses all actionable findings, rounds 2–3 clear only blockers, and after round 3 the loop
  **stops and escalates to you** rather than refining forever.
- **Self-improvement loop** — the [curation phase](concept.md#a-composed-five-phase-ticket-lifecycle) harvests each
  finished ticket's learnings into the wiki and `guardrails.md`, so the next ticket starts from a better substrate.
  This is hill-climbing through *knowledge*, not by rewriting agent config.

Where it departs from the textbook — on purpose:

- **A human gate sits on the critical path.** No code is written until you approve the plan, *every* time — not just
  for actions flagged "risky." Standard loop engineering reserves human approval for irreversible actions; here it's
  mandatory at the plan boundary.
- **Verification is cross-_provider_, not just cross-rubric.** The reviewer must run on a different model *and*
  provider than the author (this vault pairs Claude Code and OpenAI Codex) — a stronger independence guarantee than a
  same-model grader, closer to adversarial verification.
- **State lives on disk, not in the context window.** Ticket status, plans, and review ledgers are plain Markdown, so
  a fresh model — or you — can resume any phase cold. The `lint` skill reconciles ticket status against the registry,
  surfacing forgotten transitions. Together with the bounded rounds and stop-and-escalate rule, these are the
  guardrails against the loop's classic failure modes: infinite refinement, goal drift, and silent stalls.
- **It is deliberately not event-driven** (loop 3). The loop only turns when you turn it — no triggers spawn
  autonomous background runs. A conscious trade of autonomy for control.

The net: **loop engineering with the autonomy dialed down and the verification dialed up** — the same essential
machinery (stacked loops, externalized state, bounded feedback, a hill-climbing knowledge loop), reorganized around
the thesis that the loop exists to produce work you can trust, audit, and resume.
