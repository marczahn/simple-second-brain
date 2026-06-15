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

## The independent review gate

A plan reviewed only by its author inherits the author's blind spots. So before any plan reaches you, it is
reviewed by a **second model on a different provider/family**. This catches non-executable steps, missing
acceptance-criteria coverage, and scope drift before a human ever looks. If you only have one provider, the gate
degrades gracefully (different model tier + a static analyzer + an explicit "refute your own plan" pass) — weaker,
but still useful.

## Opinionated by design

This implementation is opinionated. It's tailored to my needs, which may not match yours. It is definitely
**not** a silver bullet, and you should have a little experience with agentic coding — or at least have tried
some AI-driven coding with tools like Claude Code, Codex, or OpenCode.

It is **not** a fully automated system. It is low-level and deliberately so. It's like having a person you can
tell *what* to do and *how* to do it. I want you to adjust it to your needs — though you can use it as-is.

Because it's all text, you can change anything at any time. Want to switch from Jira to Trello? From GitHub to
GitLab? Just tell your AI tool to do it, and ask for help if needed.
