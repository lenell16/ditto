---
name: browser-verification
description: Browser verification for the Ditto monorepo — extends browser-verification-workflow with local Memoria dev setup (vp dev, Portless, memoria.localhost, check/test). Use when verifying UI, routes, or interactions in apps/web.
---

# Browser Verification (Ditto)

Ditto-specific wrapper for browser verification. Load `agent-browser skills get core`, then follow `browser-verification-workflow` for isolated/headed sessions, state mode, evidence capture, triage, and reporting. This skill adds only what is unique to this repo.

## Repo Details

| Item | Value |
|------|-------|
| App package | `apps/web` |
| Dev command | `vp run --filter web dev` |
| Portless name | `memoria` (URL from `portless get memoria`) |
| Dev browser user seed | `vp run --filter web seed:dev-user` |
| Cheap checks | `vp run --filter web check`, `vp run --filter web test` |
| Routes | `apps/web/src/routes/` — `routeTree.gen.ts` auto-updates when dev server is running |
| Evidence dir | `tmp/ditto-browser-evidence/` |
| Auth constants | `apps/web/src/dev/browser-auth.ts` |

Resolve the app URL at runtime — do not hardcode `https://memoria.localhost` in linked worktrees:

```bash
MEMORIA="$(portless get memoria)"
# Main worktree: https://memoria.localhost
# Linked worktree on branch fix-ui: https://fix-ui.memoria.localhost
```

## Dev Browser Auth

Local-only credentials for pglite dev databases (not production secrets):

| Field | Value |
|-------|-------|
| Email | `agent@memoria.local` |
| Password | `local-dev-password` |
| Vault profile | `ditto` |
| Login selectors | `#email`, `#password`, `button[type="submit"]` |

Each worktree has its own `.data/pglite` database. Seed the dev user once per worktree before authenticated browser flows:

```bash
vp run --filter web seed:dev-user
```

### One-time Agent Browser vault setup (per machine)

Save credentials and selectors locally. The saved URL is a placeholder; always override with `portless get memoria` at login time.

```bash
echo "local-dev-password" | agent-browser auth save ditto \
  --url "https://memoria.localhost/login" \
  --username "agent@memoria.local" \
  --password-stdin \
  --username-selector "#email" \
  --password-selector "#password" \
  --submit-selector 'button[type="submit"]'
```

### Authenticated browser session

Use auth vault + worktree-scoped `--restore` (not a shared Chrome profile — cookies are origin-specific per Portless subdomain):

```bash
MEMORIA="$(portless get memoria)"
SESSION="$(agent-browser session id --scope worktree --prefix ditto)"

vp run --filter web seed:dev-user

agent-browser --session "$SESSION" --restore auth login ditto \
  --url "${MEMORIA}/login"

agent-browser --session "$SESSION" --restore open "${MEMORIA}/<route>"
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i -c
```

Use `--profile Default` only when the user asks for their personal Chrome identity (OAuth/SSO). Do not use `~/.agent-browser-profiles/ditto` for cross-worktree auth.

## Workflow

1. Identify the affected route, user flow, and expected behavior.
2. Check existing terminals — reuse a healthy `vp run --filter web dev` process; do not start duplicates unless stale or failed.
3. Run cheap checks when practical: `vp run --filter web check`, `vp run --filter web test`.
4. Start or reuse `vp run --filter web dev` (runs Portless for `apps/web`). On `EMFILE`, retry: `ulimit -n 65536; vp run --filter web dev`.
5. Set `MEMORIA="$(portless get memoria)"` and confirm dev output prints `-> ${MEMORIA}` (or the equivalent worktree-prefixed URL).
6. If Portless shows 404, the proxy is up but the app is not registered — restart dev and wait for the URL line above.
7. Follow `browser-verification-workflow` default mode: use a clean worktree-scoped isolated session. Add `--headed` only when the user says `headed`, `visible`, `watch`, or asks to see the browser. Use auth vault + `--restore` only when the flow needs authenticated state (see Dev Browser Auth above).

```bash
MEMORIA="$(portless get memoria)"
SESSION="$(agent-browser session id --scope worktree --prefix ditto)"
agent-browser --session "$SESSION" open "${MEMORIA}/<route>"
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i -c
```

For visible verification, keep the same URL and session prefix:

```bash
MEMORIA="$(portless get memoria)"
SESSION="$(agent-browser session id --scope worktree --prefix ditto)"
agent-browser --session "$SESSION" --headed open "${MEMORIA}/<route>"
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i -c
```

8. Exercise the flow; capture evidence to `tmp/ditto-browser-evidence/`; also check server logs from the dev terminal. If blocked in either headed or headless mode, capture snapshot, screenshot, console, and errors before retrying or switching mode.
9. Return compact verdict per `browser-verification-workflow` report format.

```bash
mkdir -p tmp/ditto-browser-evidence
agent-browser --session "$SESSION" screenshot tmp/ditto-browser-evidence/<name>.png
agent-browser --session "$SESSION" console
agent-browser --session "$SESSION" errors
```

## Route Tree Note

When the dev server is already running, adding or renaming files under `apps/web/src/routes/` updates `routeTree.gen.ts` automatically. If dev is not running, start it or run a build to regenerate. Commit `routeTree.gen.ts` when it changes.

## When To Delegate

More than one or two browser actions → subagent. Template below.

## Subagent Prompt Template

```markdown
You are the Ditto UI Verification Subagent.

Goal: Verify or reproduce: <behavior, bug, or demo flow>

Context:
- Workspace: /Users/alonzothomas/Developer/personal/ditto
- App: apps/web at $(portless get memoria)
- Routes: <routes>
- Expected behavior: <expected behavior>
- Changed files: <files>
- Dev browser auth: agent@memoria.local / local-dev-password (see apps/web/src/dev/browser-auth.ts)

Workflow:
1. Load `agent-browser skills get core`.
2. Reuse healthy `vp run --filter web dev` if present; else start it.
3. Run `vp run --filter web check` / `test` when practical.
4. Set `MEMORIA="$(portless get memoria)"`.
5. Follow `browser-verification-workflow` skill default: clean isolated worktree-scoped session.
6. Add `--headed` only if the user asks for `headed`, `visible`, or wants to watch the browser.
7. For authenticated flows: run `vp run --filter web seed:dev-user`, then `agent-browser auth login ditto --url "${MEMORIA}/login"` with `--restore` on the worktree session.
8. Open `"${MEMORIA}/<route>"` directly in that session.
9. Capture screenshots to `tmp/ditto-browser-evidence/`; check console, network, server logs.
10. If blocked, capture snapshot/screenshot/console/errors before retrying or switching mode.

Return: Verdict (PASS/FAIL/BLOCKED), mode used (headless/headed, clean/auth-restore), scope tested, commands run, browser actions, evidence paths, console/network summary, findings, repro steps if failing, suspected files if failing.
```
