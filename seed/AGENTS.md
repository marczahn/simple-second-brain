# Secondary Provider Compatibility

This vault uses [`CLAUDE.md`](CLAUDE.md) as the canonical schema for the LLM-maintained wiki.

Any model — {{REVIEWER_PROVIDER}} or others — should follow the conventions, directory structure, and workflows defined there rather than maintaining a separate parallel schema.

### Instructions
- **When** starting ticketed work, **always** start at the composer [[skills/ticket-workflow]].
- Treat `CLAUDE.md` as the source of truth for wiki behavior.
- Treat [`project-registry.md`](project-registry.md) and [`ticket-registry.md`](ticket-registry.md) as the centralized mutable state.
- Do not fork the schema here unless the user explicitly wants tool-specific behavior that cannot live cleanly in `CLAUDE.md`.
- Keep changes minimal; preserve the existing structure unless a concrete problem justifies a change.
- When invoked as a cross-model reviewer, run non-interactively and autonomously: read the artifact paths, return structured findings + a verdict, and do **not** stop to ask questions — surfacing open items to the human is the main agent's job (see [[skills/shared/providers]] and [[skills/shared/ticket-gates]]).
