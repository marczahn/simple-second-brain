#!/usr/bin/env node
/**
 * acp-review.mjs — run one cross-model review gate over ACP (Agent Client Protocol).
 *
 * The wire-level JSON-RPC flow this client speaks is documented in skills/shared/acp-protocol.md
 * (initialize -> session/new -> session/set_config_option -> session/prompt, streamed
 * session/update events, session/request_permission replies). Read that when debugging or
 * porting to a new agent; this file adds the gate invariants on top of that flow.
 *
 * This is the vault's ACP *client*. It drives a reviewer agent through exactly one prompt
 * turn and enforces the gate's invariants in code rather than in prose:
 *
 *   - the reviewer model is pinned and read back (never assumed);
 *   - the reviewer is STRICTLY read-only — every mutating tool is refused, no exceptions;
 *   - THE CLIENT writes the findings ledger, from the reviewer's reply. The reviewer never
 *     writes a file, so it needs no write scope anywhere;
 *   - full findings go stream -> ledger on disk. Only a short summary reaches stdout, so the
 *     findings stay off the calling agent's context (it reads the ledger instead);
 *   - the repo tree is verified unchanged after the turn — the real read-only guarantee;
 *   - a stalled turn is detected and reported instead of hanging forever.
 *
 * READ-ONLY IS NOT A MODE — IT IS A POST-CONDITION. Measured 2026-08-04:
 *   - codex-acp routes every edit through `session/request_permission`, so refusals bite.
 *     It reaches paths outside its workspace via a shell `execute` tool that carries no
 *     path argument, which is why the policy refuses mutating tools outright rather than
 *     trying to whitelist paths out of a command string.
 *   - claude-agent-acp does NOT ask for its own Write tool: it executes locally, `plan`
 *     mode leaked a write in 2 of 5 runs against a real repo, and declaring
 *     `clientCapabilities.fs.writeTextFile: true` does not redirect writes to the client.
 * So the mode + policy are best-effort and the git cleanliness check is the guarantee.
 * Never loosen the post-check on the assumption that a mode is holding.
 *
 * Usage:
 *   node skills/shared/acp-review.mjs \
 *     --agent claude|codex \
 *     --model <reviewer-model> \
 *     --cwd <repo-or-worktree-path> \
 *     --ledger <absolute path to review-plan.md | review-code.md> \
 *     --prompt-file <path to the review prompt> \
 *     [--agent-bin /abs/path/to/agent] [--stall-timeout 180] [--turn-timeout 1800] [--verbose]
 *
 * The agent binary is resolved to an ABSOLUTE path — --agent-bin, then $ACP_CLAUDE_BIN /
 * $ACP_CODEX_BIN, then PATH, then well-known install dirs (~/.volta/bin, ~/.local/bin, …).
 * Never depends on an inherited PATH, which is thin under cron/CI.
 *
 * The prompt must tell the reviewer to return its full findings AS ITS REPLY and to write
 * no files. See providers.md -> "The prompt file must contain".
 *
 * Exit codes: 0 = gate ran clean · 2 = bad usage · 3 = stalled ·
 *             4 = protocol/agent error · 5 = read-only violation (repo mutated).
 */
import { spawn, execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { homedir } from 'node:os'

const AGENTS = {
  claude: {
    bin: 'claude-agent-acp',
    env: 'ACP_CLAUDE_BIN',
    pkg: '@agentclientprotocol/claude-agent-acp',
    args: () => [],
    pinModel: 'config-option',
    readOnlyMode: 'plan',
  },
  codex: {
    bin: 'codex-acp',
    env: 'ACP_CODEX_BIN',
    pkg: '@zed-industries/codex-acp',
    args: (model) => ['-c', `model="${model}"`],
    pinModel: 'launch-flag',
    readOnlyMode: 'read-only',
  },
}

// Never rely on an inherited PATH: a cron/headless/CI shell often has a thin one, and on this
// machine `claude` already lives outside it. Resolve to an absolute path, in priority order.
const resolveBin = (spec) => {
  const explicit = opt('agent-bin') ?? process.env[spec.env]
  if (explicit) {
    if (!existsSync(explicit)) die(2, `--agent-bin / $${spec.env} points at a missing file: ${explicit}`)
    return { path: explicit, how: opt('agent-bin') ? '--agent-bin' : `$${spec.env}` }
  }
  try {
    const onPath = execFileSync('command', ['-v', spec.bin], { encoding: 'utf8', shell: '/bin/sh' }).trim().split('\n')[0]
    if (onPath && existsSync(onPath)) return { path: onPath, how: 'PATH' }
  } catch { /* not on PATH — fall through to the well-known locations */ }
  const candidates = [
    join(homedir(), '.volta', 'bin', spec.bin),
    join(homedir(), '.local', 'bin', spec.bin),
    join(homedir(), '.npm-global', 'bin', spec.bin),
    `/opt/homebrew/bin/${spec.bin}`,
    `/usr/local/bin/${spec.bin}`,
  ]
  const found = candidates.find((c) => existsSync(c))
  if (found) return { path: found, how: 'well-known location' }
  die(4, `cannot find ${spec.bin} on PATH or in ${candidates.join(', ')}.\n  Install it:  npm i -g ${spec.pkg}\n  Or point at it:  --agent-bin /abs/path/to/${spec.bin}  (or $${spec.env})`)
}

// ---------- args ----------
const argv = process.argv.slice(2)
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt
}
const flag = (name) => argv.includes(`--${name}`)

const agentKey = opt('agent')
const model = opt('model')
const cwd = opt('cwd')
const ledger = opt('ledger')
const promptFile = opt('prompt-file')
const stallTimeout = Number(opt('stall-timeout', 180)) * 1000
const turnTimeout = Number(opt('turn-timeout', 1800)) * 1000
const verbose = flag('verbose')

const log = (msg) => console.error(`[acp-review] ${msg}`)
const vlog = (msg) => { if (verbose) log(msg) }
const die = (code, msg) => { log(msg); process.exit(code) }

if (!AGENTS[agentKey]) die(2, `--agent must be one of: ${Object.keys(AGENTS).join(', ')}`)
if (!model) die(2, "--model is required (pin the ticket's reviewer_model)")
if (!cwd) die(2, '--cwd is required (the repo or worktree to review)')
if (!ledger) die(2, '--ledger is required (where the findings are written)')
if (!promptFile) die(2, '--prompt-file is required')

const spec = AGENTS[agentKey]
const absCwd = resolve(cwd)
const absLedger = resolve(ledger)
let promptText
try { promptText = readFileSync(promptFile, 'utf8') } catch (e) { die(2, `cannot read --prompt-file: ${e.message}`) }

// ---------- repo tree snapshot ----------
// The enforceable half of "read-only": compared again after the turn, any delta fails the gate.
// Independent of whether the agent honoured a read-only mode.
const gitSnapshot = () => {
  try {
    return execFileSync('git', ['-C', absCwd, 'status', '--porcelain=v1', '--untracked-files=all'], { encoding: 'utf8' })
  } catch {
    return null // not a git repo (or git unavailable) — post-check skipped, warned about
  }
}

// ---------- write policy ----------
// The reviewer needs no write access at all: it reports findings in its reply and the client
// persists them. So every mutating tool is refused. Reads are allowed. This is deliberately
// blunt — a reviewer that wants to edit is already outside its remit.
const MUTATING_KINDS = new Set(['edit', 'delete', 'move', 'execute'])
// Escalation requests, refused unconditionally. `switch_mode` is how claude-agent-acp asks
// to leave `plan` mode ("Ready to code?") — granting it would hand back the very write
// capability the gate exists to withhold.
const ESCALATION_KINDS = new Set(['switch_mode', 'set_mode', 'mode', 'permission'])
// Word-anchored: a bare /^read/ prefix match also matches "Ready to code?", which is
// exactly the escalation title above. Prefix matching here is a security bug, not a nicety.
const READ_TOOL = /^(read|grep|glob|search|list|ls|find|fetch|view|codegraph|think)\b/i
const decide = (params) => {
  const kind = params?.toolCall?.kind ?? ''
  const title = String(params?.toolCall?.title ?? '')
  if (ESCALATION_KINDS.has(kind)) {
    return { allow: false, why: `escalation refused — reviewer stays read-only (${kind}: ${title.slice(0, 80)})` }
  }
  if (MUTATING_KINDS.has(kind)) {
    return { allow: false, why: `mutating tool refused — reviewer is read-only (${kind}: ${title.slice(0, 80)})` }
  }
  if (kind === 'read' || READ_TOOL.test(title)) {
    return { allow: true, why: `read-only (${kind || title})` }
  }
  return { allow: false, why: `unrecognised tool refused by default (${kind || title || 'unknown'})` }
}

// ---------- transport ----------
const bin = resolveBin(spec)
log(`agent binary: ${bin.path} (via ${bin.how})`)
const child = spawn(bin.path, spec.args(model), { stdio: ['pipe', 'pipe', 'pipe'], cwd: absCwd })
child.on('error', (e) => die(4, `cannot launch ${bin.path}: ${e.message}. Install it: npm i -g ${spec.pkg}`))

let buf = ''
let nextId = 1
const pending = new Map()
let lastActivity = Date.now()
const denials = []
let transcript = ''

const send = (o) => { vlog(`-> ${o.method ?? 'reply:' + o.id}`); child.stdin.write(JSON.stringify(o) + '\n') }
const call = (method, params) => new Promise((res, rej) => {
  const id = nextId++
  pending.set(id, { resolve: res, reject: rej })
  send({ jsonrpc: '2.0', id, method, params })
})

child.stdout.on('data', (d) => {
  lastActivity = Date.now()
  buf += d.toString()
  let i
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim()
    buf = buf.slice(i + 1)
    if (!line) continue
    let msg
    try { msg = JSON.parse(line) } catch { vlog(`unparsed: ${line.slice(0, 160)}`); continue }

    if (msg.id !== undefined && msg.method) {
      if (msg.method === 'session/request_permission') {
        const { allow, why } = decide(msg.params)
        const options = msg.params?.options ?? []
        const pick = allow
          ? options.find((o) => o.kind === 'allow_once') ?? options.find((o) => /allow/i.test(o.kind ?? o.optionId ?? ''))
          : options.find((o) => o.kind === 'reject_once') ?? options.find((o) => /reject|deny/i.test(o.kind ?? o.optionId ?? ''))
        log(`${allow ? 'ALLOW' : 'DENY '} — ${why}`)
        if (!allow) denials.push(why)
        send(pick
          ? { jsonrpc: '2.0', id: msg.id, result: { outcome: { outcome: 'selected', optionId: pick.optionId } } }
          : { jsonrpc: '2.0', id: msg.id, result: { outcome: { outcome: 'cancelled' } } })
      } else {
        // Any other agent-initiated request (elicitation, etc.) is refused: the gate is
        // non-interactive by contract and a reviewer must never block on input.
        vlog(`refusing agent request: ${msg.method}`)
        send({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'client is non-interactive' } })
      }
      continue
    }
    if (msg.id !== undefined) {
      const r = pending.get(msg.id)
      pending.delete(msg.id)
      if (r) msg.error ? r.reject(new Error(JSON.stringify(msg.error))) : r.resolve(msg.result)
      continue
    }
    if (msg.method === 'session/update') {
      const u = msg.params?.update
      // Findings accumulate here and go to the ledger — deliberately NOT to stdout.
      if (u?.sessionUpdate === 'agent_message_chunk') transcript += u.content?.text ?? ''
      else vlog(`update: ${u?.sessionUpdate}${u?.title ? ' ' + u.title : ''}`)
    }
  }
})
child.stderr.on('data', (d) => vlog(`agent stderr: ${d.toString().trim().slice(0, 300)}`))

// ---------- stall watchdog ----------
// The point of ACP over a bare CLI call: a wedged turn is *observable*.
let stalled = false
const watchdog = setInterval(() => {
  if (Date.now() - lastActivity > stallTimeout) {
    stalled = true
    clearInterval(watchdog)
    log(`STALL — no agent activity for ${stallTimeout / 1000}s. Aborting the turn.`)
    writeLedger('stalled')
    finish(3)
  }
}, 5000)

const finish = (code) => {
  clearInterval(watchdog)
  child.kill('SIGTERM')
  // codex-acp does not exit on stdin EOF; never leave it running.
  setTimeout(() => { child.kill('SIGKILL'); process.exit(code) }, 1500)
}
const withTimeout = (p, ms, label) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout after ${ms / 1000}s: ${label}`)), ms)),
])

// ---------- ledger ----------
const writeLedger = (outcome) => {
  if (!transcript.trim()) { log('reviewer produced no text — nothing to write to the ledger'); return }
  const header = [
    '<!-- written by skills/shared/acp-review.mjs — do not hand-edit the header -->',
    `reviewer: ${agentKey} (${spec.bin})`,
    `model_requested: ${model}`,
    `repo: ${absCwd}`,
    `outcome: ${outcome}`,
    denials.length ? `policy_denials: ${denials.length}` : null,
    '',
  ].filter((l) => l !== null).join('\n')
  try {
    mkdirSync(dirname(absLedger), { recursive: true })
    writeFileSync(absLedger, header + transcript.trimEnd() + '\n', 'utf8')
    log(`ledger written: ${absLedger} (${transcript.length} chars)`)
  } catch (e) {
    log(`WARNING — could not write the ledger (${e.message}); dumping findings to stdout as a fallback`)
    process.stdout.write(transcript)
  }
}

// A short summary is all the caller should see; the detail lives in the ledger.
const summarise = () => {
  const verdict = /\b(approve|revise)\b/i.exec(transcript)?.[1]?.toLowerCase() ?? 'unknown'
  const counts = ['blocker', 'major', 'minor', 'nit', 'question']
    .map((s) => [s, (transcript.match(new RegExp(`\\b${s}\\b`, 'gi')) ?? []).length])
    .filter(([, n]) => n > 0)
    .map(([s, n]) => `${s}:${n}`)
  process.stdout.write(`verdict=${verdict} ledger=${absLedger}${counts.length ? ' mentions[' + counts.join(' ') + ']' : ''}\n`)
  if (verdict === 'unknown') log('could not read a verdict from the reply — read the ledger before acting')
}

// ---------- the gate ----------
const treeBefore = gitSnapshot()
if (treeBefore === null) log(`WARNING — ${absCwd} is not a git repo; the post-turn cleanliness check cannot run`)
else if (treeBefore !== '') log(`note — tree already dirty before the review (${treeBefore.trim().split('\n').length} entry/entries); only NEW changes fail the gate`)

try {
  const init = await withTimeout(call('initialize', {
    protocolVersion: 1,
    clientCapabilities: { fs: { readTextFile: false, writeTextFile: false }, terminal: false },
  }), 60000, 'initialize')
  log(`agent ${init.agentInfo?.name} v${init.agentInfo?.version} (protocol ${init.protocolVersion})`)

  const session = await withTimeout(call('session/new', { cwd: absCwd, mcpServers: [] }), 120000, 'session/new')
  log(`session ${session.sessionId}`)

  const readOption = (result, id) => (result?.configOptions ?? []).find((o) => o.id === id)?.currentValue

  // Pin the model. codex-acp takes it as a launch flag; claude-agent-acp as a config option.
  if (spec.pinModel === 'config-option') {
    const r = await withTimeout(call('session/set_config_option', { sessionId: session.sessionId, configId: 'model', value: model }), 60000, 'set model')
    // The agent canonicalises to its own local alias (e.g. claude-opus-5 -> opus[1m]), so an
    // exact string match is the wrong assertion — surface what took effect and move on.
    log(`model pinned: requested "${model}" -> in effect "${readOption(r, 'model')}"`)
  } else {
    const got = readOption(session, 'model')
    log(`model pinned via launch flag: requested "${model}" -> in effect "${got}"`)
    if (got && got !== model) log(`WARNING — agent reports model "${got}", not the requested "${model}"`)
  }

  // Pin read-only. Best-effort; the post-check is the guarantee.
  const modes = session.modes?.availableModes ?? (session.configOptions ?? []).find((o) => o.id === 'mode')?.options ?? []
  if (modes.some((m) => (m.id ?? m.value) === spec.readOnlyMode)) {
    const r = await withTimeout(call('session/set_config_option', { sessionId: session.sessionId, configId: 'mode', value: spec.readOnlyMode }), 60000, 'set mode')
    log(`mode: ${readOption(r, 'mode') ?? spec.readOnlyMode}`)
  } else {
    log(`mode "${spec.readOnlyMode}" not offered; relying on the write policy and the post-check`)
  }

  log('prompting the reviewer…')
  const turn = await withTimeout(call('session/prompt', {
    sessionId: session.sessionId,
    prompt: [{ type: 'text', text: promptText }],
  }), turnTimeout, 'session/prompt')
  log(`turn ended: stopReason=${turn.stopReason}`)
  if (denials.length) log(`policy refused ${denials.length} action(s): ${denials.slice(0, 3).join(' | ')}`)

  // The guarantee: did the reviewer leave the repo exactly as it found it?
  const treeAfter = gitSnapshot()
  const mutated = treeBefore !== null && treeAfter !== null && treeAfter !== treeBefore

  writeLedger(mutated ? 'repo-mutated' : turn.stopReason)

  if (mutated) {
    const before = new Set(treeBefore.split('\n'))
    log('GATE FAILED — the reviewer modified the repo. It is supposed to be read-only.')
    treeAfter.split('\n').filter((l) => l && !before.has(l)).slice(0, 20).forEach((l) => log(`  ${l}`))
    log('Revert these changes and re-run the gate; do not accept this review.')
    finish(5)
  } else if (denials.length) {
    // Consistent across providers: codex-acp cancels the turn when refused, claude-agent-acp
    // carries on and ends normally. Either way the reviewer tried to step outside read-only,
    // so its findings are not trustworthy as a gate result.
    log(`GATE NOT RUN — the reviewer attempted ${denials.length} refused action(s); it is meant to only read and report.`)
    log('Check the prompt is telling it to write nothing, then re-run.')
    finish(4)
  } else if (turn.stopReason !== 'end_turn' && turn.stopReason !== 'max_turn_requests') {
    log(`stopReason "${turn.stopReason}" — treat this gate as NOT RUN`)
    finish(4)
  } else {
    if (treeAfter !== null) log('repo tree unchanged — read-only invariant held')
    summarise()
    finish(0)
  }
} catch (e) {
  if (!stalled) { log(`FAILED — ${e.message}`); writeLedger('error'); finish(4) }
}
