# The Concept

Simple Second Brain is built on the **llm-wiki** approach, popularized by Andrej Karpathy
([original note](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)). The core insight:
instead of a human laboriously maintaining notes, the **LLM writes and maintains the knowledge base** while
the **human curates sources, directs analysis, and asks questions**. The twist is to build a wiki that is
suitable for an AI to read and maintain — not primarily for human readers. The medium is plain Markdown, so it
stays portable, diffable, greppable, and editable by both human and machine forever.

## Why this exists

I wanted a foundation for agentic engineering in my day-to-day work as a software engineer. There are plenty of
tools that promise a lot — up to running an entire enterprise without a human. I tried many of them. Most were
overpowered for what I actually wanted. I already have tools for ticketing; why add another one just for coding?

On top of that, most tools — even the open-source ones — aren't easily customizable. I wanted something I could
adjust freely. The llm-wiki approach fit:

- **Super simple.**
- **No external tools or libraries needed** beyond an AI coding tool (Obsidian is handy but optional).
- **Adjustable with nothing but Markdown edits** — or by asking your AI tool to change it for you.

## The two roles

- **Human** — curates source material (drops articles, points at repos), directs what to analyze, asks
  questions, approves plans, and does the actual `git` merges/cleanup.
- **LLM (you, and future models)** — reads sources and code, writes and maintains every wiki page, runs the
  ticket lifecycle, and keeps the indexes/logs/registries current.

The whole design assumes **a different model may pick up the work cold tomorrow.** Everything is written down so
that is possible — which is also why each workflow phase is owned by a named *persona* with explicit inputs,
outputs, and handoff signals.

## A composed five-phase ticket lifecycle

The ticket workflow is deliberately **not** one big procedure. A thin **composer** (`ticket-workflow.md`) reads
the ticket's current status and dispatches to one of five self-contained **phase skills** — research, planning,
execution, finalizing, **curation** — enforcing a hard gate at each boundary. The facts every phase needs
(status vocabularies, conventions, persona routing, gate mechanics, worktree rules, provider setup) live in
**shared reference files** that each phase links to, so nothing is duplicated and any phase can be resumed cold.

Two design choices come straight from real-world pain:

- **`done` and `curated` are separate statuses.** "Shipped" and "knowledge harvested into the wiki" are
  different milestones. Curation is its own phase, not a footnote to shipping — so a shipped-but-unharvested
  ticket is *visible* (the `lint` skill flags it) and *resumable* (re-run the workflow; it dispatches straight to
  curation). Curation used to get skipped; now it can't quietly vanish.
- **Every status change is written twice — to the ticket and to the registry — in the same step**, and the
  `lint` skill reconciles the two. Forgotten transitions (especially "→ done") were a recurring failure; now
  they surface.

Each phase is owned by a persona. **Generic** personas (Business Analyst, QA Engineer, Curator, Principal
Engineer Reviewer) are shared across all projects; **project-specific** personas come in pairs per layer — a
**Domain Architect** that plans and an **Engineer** that executes — so they encode each repo's real stack and
file layout.

## The independent review gates

Work reviewed only by its author inherits the author's blind spots. So the lifecycle has **two** cross-provider
review gates, each run by a **second model on a different provider** (this vault pairs **Claude Code** and
**OpenAI Codex**). You **choose the reviewer per ticket** — at ticket start you pick the provider + model, and it's
recorded on the ticket; the default is always a genuine cross-model choice (a provider different from the one
you're driving). There is no fixed vault-wide reviewer, so it's easy to vary per piece of work:

- **Plan review** — before any plan reaches you, a different model (acting as the Business Analyst) checks it
  for non-executable steps, missing acceptance-criteria coverage, and scope drift.
- **Code review** — before a change reaches QA, a different model (acting as the relevant Engineer) reviews the
  diff against conventions, patterns, ADRs, behavior impact, and test quality.

Reviewers run **non-interactively** — a one-shot headless `exec` (`codex exec`, `claude -p`), not a spawned
interactive agent. That matters: interactive/ACP sub-agents were observed to *stall* mid-review; the one-shot
form is reliable and autonomous. The reviewer returns findings and a verdict; **only the main agent** ever stops
to ask you something. And if a reviewer provider is missing or unauthorized at gate time, the main agent stops
and asks you to fix it — it never silently skips the gate. The *plan* also always passes a hard **human approval
gate** before any code is written.

## Not a deterministic tool

It helps to be clear about what this is. Simple Second Brain is **not a program that runs deterministically** —
there is no engine, no compiled logic, no guaranteed output. It is a **prompt-driven workflow harness**: a set of
plain-Markdown instructions (schema, skills, personas, templates) that steer an AI agent through a repeatable
process. The agent interprets those instructions and does the actual work, which means:

- **Results depend on the model.** A stronger model produces better plans, reviews, and wiki pages; a weaker one
  produces weaker ones. Swapping the model changes the behavior.
- **It is not reproducible run-to-run.** Ask twice and you may get two different (both reasonable) plans. That is
  normal for LLM-driven work, not a bug.
- **The structure is the whole point.** The five phases, the two independent review gates, the registries, and the
  `lint` skill exist to impose checkpoints, hand-off contracts, and guardrails *on top of* inherently probabilistic
  behavior — to make it repeatable and reviewable, not to make it deterministic.

So treat it as a disciplined workflow you drive an AI through — you stay in the loop, approve the plan, and do the
merges — not as a tool that will do the exact same thing every time on its own.

## Opinionated by design

This implementation is opinionated. It's tailored to my needs, which may not match yours. It is definitely
**not** a silver bullet, and you should have a little experience with agentic coding — or at least have tried
some AI-driven coding with tools like Claude Code or Codex.

It is **not** a fully automated system. It is low-level and deliberately so. It's like having a person you can
tell *what* to do and *how* to do it. I want you to adjust it to your needs — though you can use it as-is.

Because it's all text, you can change anything at any time. Want to switch from Jira to Trello? From GitHub to
GitLab? Just tell your AI tool to do it, and ask for help if needed.
