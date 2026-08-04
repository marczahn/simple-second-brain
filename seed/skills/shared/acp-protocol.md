---
title: ACP Protocol (wire-level reference)
type: reference
project: general
sources: [acp-review.mjs, providers.md, https://agentclientprotocol.com]
created: <today>
updated: <today>
---

# ACP Protocol (wire-level reference)

The JSON-RPC flow underneath [`acp-review.mjs`](acp-review.mjs). Read this when **debugging a stuck review, adding a new ACP agent, or extending the runner** — for running a review you only need [providers#Default transport: ACP](providers.md#default-transport-acp), which documents the runner's flags and exit codes. This page documents the layer the runner sits on top of, so a failure can be reproduced with a bare client rather than guessed at.

The one-sentence model: **ACP is a local stdio JSON-RPC conversation with an agent binary** — spawn it, send `initialize` → `session/new` → `session/set_config_option` → `session/prompt`, consume `session/update` events, answer `session/request_permission` requests, and wait for the `session/prompt` result's `stopReason`.

## Transport

- The agent is a child process (`claude-agent-acp` or `codex-acp`) speaking JSON-RPC 2.0 over **stdin/stdout**.
- **One JSON object per line**, newline-delimited (`JSON.stringify(obj) + '\n'`). Read stdout the same way: buffer, split on `\n`, parse each line. stderr is diagnostics only.
- Spawn with the **repo/worktree as `cwd`** — the agent reads code relative to it. See [providers#binary resolution](providers.md#default-transport-acp) for why the binary path must be resolved absolutely and never trusted to an inherited `PATH`.
- Maintain a monotonically increasing request `id` and a map of pending requests keyed by `id`; match each reply back to its request.

Three kinds of message arrive on stdout, distinguished before dispatch:

| Shape | What it is | How to handle |
|-------|------------|---------------|
| has `id` **and** `method` | an agent-initiated **request** (it wants something from the client) | reply with the same `id` |
| has `id`, no `method` | a **reply** to a request the client sent | resolve/reject the pending promise for that `id` |
| has `method`, no `id` | a **notification** (fire-and-forget, e.g. streamed output) | consume; never reply |

## The flow

### 1. `initialize`

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":1,"clientCapabilities":{"fs":{"readTextFile":false,"writeTextFile":false},"terminal":false}}}
```

The reply carries `agentInfo` (name/version) and the `protocolVersion` actually in effect. Declaring `fs.writeTextFile: false` does **not** guarantee read-only — see [providers#Read-only is a post-condition](providers.md#read-only-is-a-post-condition-not-a-mode); `claude-agent-acp` ignores it and writes locally anyway.

### 2. `session/new`

```json
{"jsonrpc":"2.0","id":2,"method":"session/new","params":{"cwd":"/abs/path/to/worktree","mcpServers":[]}}
```

Returns a `sessionId` used by every subsequent call. Empty `mcpServers` keeps the reviewer to its own tools. The reply may also carry `modes.availableModes` and/or `configOptions` — inspect these before setting a mode, because not every agent offers every mode (the runner only sets a mode it sees listed).

### 3. `session/set_config_option` — pin model and mode

```json
{"jsonrpc":"2.0","id":3,"method":"session/set_config_option","params":{"sessionId":"<id>","configId":"model","value":"claude-opus-5"}}
{"jsonrpc":"2.0","id":4,"method":"session/set_config_option","params":{"sessionId":"<id>","configId":"mode","value":"plan"}}
```

The reply echoes the resulting `configOptions`; read back `currentValue` rather than assuming the request stuck. Provider differences that matter:

- **`claude-agent-acp`** takes the model as a config option (above) and **canonicalises** it to a local alias — asking for `claude-opus-5` yields something like `opus[1m]`. Assert on *what took effect*, never on string equality with what you asked for. Its read-only-ish mode is `plan`.
- **`codex-acp`** takes the model as a **launch flag** (`-c model="<id>"`) rather than a config option; its read-only mode is `read-only`, and it genuinely mediates writes through `session/request_permission`.

### 4. `session/prompt` — run the turn

```json
{"jsonrpc":"2.0","id":5,"method":"session/prompt","params":{"sessionId":"<id>","prompt":[{"type":"text","text":"…the review prompt…"}]}}
```

`prompt` is an array of content blocks (`{"type":"text","text":…}`). This request stays open for the whole turn; its **reply is the last thing to arrive**, after all the streamed events below:

```json
{"jsonrpc":"2.0","id":5,"result":{"stopReason":"end_turn","usage":{"inputTokens":2,"outputTokens":4}}}
```

Treat only `end_turn` (and `max_turn_requests`) as a turn that actually completed; any other `stopReason` means the gate did not run.

## Streamed events during the turn

### `session/update` — notifications (no reply)

```json
{"jsonrpc":"2.0","method":"session/update","params":{"sessionId":"…","update":{"sessionUpdate":"agent_message_chunk","content":{"type":"text","text":"O"},"messageId":"…"}}}
```

Dispatch on `params.update.sessionUpdate`. The reply text streams as a sequence of `agent_message_chunk` updates (one chunk `"O"`, then `"K"`, …) — **concatenate the `content.text`** to reconstruct the full reply. Other `sessionUpdate` kinds (tool-call notifications, plan updates, etc.) are informational. The runner accumulates the chunks into the ledger and keeps them off the caller's stdout.

### `session/request_permission` — a request (must reply)

When the agent wants to run a tool that needs consent:

```json
{"jsonrpc":"2.0","id":"<perm-id>","method":"session/request_permission","params":{"toolCall":{"kind":"edit","title":"…"},"options":[{"optionId":"…","kind":"allow_once"},{"optionId":"…","kind":"reject_once"}]}}
```

Reply by selecting one of the offered `options` by its `optionId`:

```json
{"jsonrpc":"2.0","id":"<perm-id>","result":{"outcome":{"outcome":"selected","optionId":"<chosen optionId>"}}}
```

To decline without selecting, reply `{"outcome":{"outcome":"cancelled"}}`. The runner's policy ([`acp-review.mjs`](acp-review.mjs) `decide()`) refuses every `edit`/`delete`/`move`/`execute` and every mode-escalation request, and allows reads — picking the `reject_once` / `allow_once` option accordingly. Note the word-anchored read matcher: a bare `/^read/` prefix would also match the escalation title *"Ready to code?"*, so matching is a security detail, not a nicety.

Any **other** agent-initiated request (elicitation, etc.) is refused with a JSON-RPC error — a review gate is non-interactive by contract and must never block on input:

```json
{"jsonrpc":"2.0","id":"<id>","error":{"code":-32601,"message":"client is non-interactive"}}
```

## Why a client, not a raw session

Everything above is enough to *talk* to an agent; it is not enough to *gate* on one. [`acp-review.mjs`](acp-review.mjs) adds the invariants that make the turn trustworthy as a review gate, none of which the protocol gives you for free:

- **absolute binary resolution** (never trusts `PATH`);
- **model pinning** read back from what took effect;
- **read-only as a verified post-condition** — a `git status --porcelain` snapshot before and after the turn, failing the gate on any delta, because no mode reliably prevents writes;
- **flat refusal** of every mutating/escalation permission request;
- **stall detection** — a watchdog on time-since-last-activity, so a wedged turn is reported (non-zero exit) instead of hanging;
- **ledger writing** — the client persists the streamed findings to disk and emits only a one-line summary, keeping detail off the caller's context.

See [providers#Read-only is a post-condition](providers.md#read-only-is-a-post-condition-not-a-mode) for the measured provider behaviour those invariants defend against.

## Minimal debug client

To reproduce a failure with no guardrails (Node):

```js
const { spawn } = require('node:child_process')
const child = spawn('/abs/path/to/claude-agent-acp', [], { stdio: ['pipe', 'pipe', 'pipe'], cwd: '/abs/path/to/worktree' })
// write newline-delimited JSON to child.stdin; parse newline-delimited JSON from child.stdout;
// keep an incrementing id and a Map of pending requests by id; answer request_permission by hand.
```

Run [`acp-review.mjs`](acp-review.mjs) with `--verbose` to get the same JSON-RPC trace on stderr without hand-rolling a client. `codex-acp` does **not** exit on stdin EOF — always kill the child explicitly when done.
