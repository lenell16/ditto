---
name: browser-verification
description: Browser verification for the Ditto monorepo — extends agent-browser with local Memoria dev setup (vp dev, Portless, memoria.localhost, check/test). Use when verifying UI, routes, or interactions in apps/web.
---

# Browser Verification (Ditto)

Extends the **`agent-browser`** skill with Ditto-specific setup. Follow `agent-browser` for isolated/headed sessions, interaction, evidence capture, triage, and reporting. This skill adds only what is unique to this repo.

## Repo Details

| Item | Value |
|------|-------|
| App package | `apps/web` |
| Dev command | `vp run --filter web dev` |
| Portless name | `memoria` → `https://memoria.localhost` |
| Cheap checks | `vp run --filter web check`, `vp run --filter web test` |
| Routes | `apps/web/src/routes/` — `routeTree.gen.ts` auto-updates when dev server is running |
| Evidence dir | `tmp/ditto-browser-evidence/` |

## Workflow

1. Identify the affected route, user flow, and expected behavior.
2. Check existing terminals — reuse a healthy `vp run --filter web dev` process; do not start duplicates unless stale or failed.
3. Run cheap checks when practical: `vp run --filter web check`, `vp run --filter web test`.
4. Start or reuse `vp run --filter web dev` (runs Portless for `apps/web`). On `EMFILE`, retry: `ulimit -n 65536; vp run --filter web dev`.
5. Confirm dev output prints `-> https://memoria.localhost`.
6. If Portless shows 404 for `memoria.localhost`, the proxy is up but the app is not registered — restart dev and wait for the URL line above.
7. Follow **`agent-browser`** default mode: use a clean worktree-scoped isolated session. Add `--headed` only when the user says `headed`, `visible`, `watch`, or asks to see the browser. Use `--profile Default`, an app profile, or `--restore` only when the task needs authenticated/persona-specific state.

```bash
SESSION="$(agent-browser session id --scope worktree --prefix ditto)"
agent-browser --session "$SESSION" open https://memoria.localhost/<route>
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i -c
```

For visible verification:

```bash
SESSION="$(agent-browser session id --scope worktree --prefix ditto)"
agent-browser --session "$SESSION" --headed open https://memoria.localhost/<route>
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i -c
```

For a Ditto-specific authenticated browser identity, initialize or reuse an app profile only when needed:

```bash
APP_PROFILE="$HOME/.agent-browser-profiles/ditto"
SESSION="$(agent-browser session id --scope worktree --prefix ditto)"
agent-browser --session "$SESSION" --profile "$APP_PROFILE" open https://memoria.localhost/<route>
```

8. Exercise the flow; capture evidence to `tmp/ditto-browser-evidence/`; also check server logs from the dev terminal. If blocked in either headed or headless mode, capture snapshot, screenshot, console, and errors before retrying or switching mode.
9. Return compact verdict per `agent-browser` report format.

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
- App: apps/web at https://memoria.localhost
- Routes: <routes>
- Expected behavior: <expected behavior>
- Changed files: <files>

Workflow:
1. Reuse healthy `vp run --filter web dev` if present; else start it.
2. Run `vp run --filter web check` / `test` when practical.
3. Follow `agent-browser` skill default: clean isolated worktree-scoped session.
4. Add `--headed` only if the user asks for `headed`, `visible`, or wants to watch the browser.
5. Use `--profile Default`, `~/.agent-browser-profiles/ditto`, or `--restore` only for authenticated/persona-specific scenarios.
6. Open https://memoria.localhost/<route> directly in that session.
7. Capture screenshots to tmp/ditto-browser-evidence/; check console, network, server logs.
8. If blocked, capture snapshot/screenshot/console/errors before retrying or switching mode.

Return: Verdict (PASS/FAIL/BLOCKED), mode used (headless/headed, clean/profile/restore), scope tested, commands run, browser actions, evidence paths, console/network summary, findings, repro steps if failing, suspected files if failing.
```
