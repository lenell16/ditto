---
name: browser-verification
description: Browser verification for the Ditto monorepo — extends agent-browser with local Memoria dev setup (vp dev, Portless, memoria.localhost, check/test). Use when verifying UI, routes, or interactions in apps/web.
---

# Browser Verification (Ditto)

Extends the **`agent-browser`** skill with Ditto-specific setup. Follow `agent-browser` for Chrome connect, labeled tabs, interaction, evidence capture, triage, and reporting. This skill adds only what is unique to this repo.

## Repo Details

| Item | Value |
|------|-------|
| App package | `apps/web` |
| Dev command | `vp run --filter web dev` |
| Portless name | `memoria` → `https://memoria.localhost` |
| Cheap checks | `vp run --filter web check`, `vp run --filter web test` |
| Routes | `apps/web/src/routes/` — `routeTree.gen.ts` auto-updates when dev server is running |
| Work tab label | `ditto` |
| Evidence dir | `/tmp/ditto-browser-evidence/` |

## Workflow

1. Identify the affected route, user flow, and expected behavior.
2. Check existing terminals — reuse a healthy `vp run --filter web dev` process; do not start duplicates unless stale or failed.
3. Run cheap checks when practical: `vp run --filter web check`, `vp run --filter web test`.
4. Start or reuse `vp run --filter web dev` (runs Portless for `apps/web`). On `EMFILE`, retry: `ulimit -n 65536; vp run --filter web dev`.
5. Confirm dev output prints `-> https://memoria.localhost`.
6. If Portless shows 404 for `memoria.localhost`, the proxy is up but the app is not registered — restart dev and wait for the URL line above.
7. Follow **`agent-browser`** to connect to real Chrome, then open Memoria:

```bash
agent-browser --session actual-browser tab new --label ditto https://memoria.localhost/<route>
agent-browser --session actual-browser tab ditto
agent-browser --session actual-browser wait --load networkidle
agent-browser --session actual-browser snapshot -i -c
```

8. Exercise the flow; capture evidence to `/tmp/ditto-browser-evidence/`; also check server logs from the dev terminal.
9. Close only the `ditto` tab. Return compact verdict per `agent-browser` report format.

```bash
agent-browser --session actual-browser screenshot /tmp/ditto-browser-evidence/<name>.png
agent-browser --session actual-browser tab close ditto
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
3. Follow `agent-browser` skill for Chrome connect and interaction.
4. Open labeled `ditto` tab at https://memoria.localhost/<route>.
5. Capture screenshots to /tmp/ditto-browser-evidence/; check console, network, server logs.
6. Close only the `ditto` tab.

Return: Verdict (PASS/FAIL/BLOCKED), scope tested, commands run, browser actions, evidence paths, console/network summary, findings, repro steps if failing, suspected files if failing.
```
