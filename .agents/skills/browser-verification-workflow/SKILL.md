---
name: browser-verification-workflow
description: Browser verification workflow for using Agent Browser CLI with isolated worktree-scoped sessions, headed-on-request runs, repo-local evidence, and clean/profile/restore state choices. Use alongside product Agent Browser skills/docs when verifying UI, reproducing browser bugs, walking flows, or capturing evidence beyond unit tests.
---

# Browser Verification Workflow

Local policy wrapper for browser verification with Agent Browser CLI. Before running browser commands, load the version-matched Agent Browser guide:

```bash
agent-browser skills get core
```

Use `agent-browser skills get core --full` only when you need command details beyond the core loop.

Prefer repeatable evidence over saying something was checked.

Default to an isolated worktree-scoped Agent Browser session with no profile and no restore. Use a profile, saved state, auth vault, or restore only when the flow needs authenticated/persona-specific browser state. Use a headed browser only when the user says `headed`, `visible`, `watch`, or otherwise asks to see the browser.

## Verification Steps

1. Identify the URL, user flow, and expected behavior.
2. Start or reuse a dev server only if the app is local and not already running.
3. Pick the browser state mode (clean, personal profile, or app profile).
4. Open the target URL directly in that isolated session.
5. Wait for readiness (see Waiting for Readiness), snapshot, interact, and re-snapshot after each navigation or re-render. Before clicking/typing on a hydrated app, wait for interactivity — not just element presence or `--load networkidle`.
6. Capture evidence in the repo-local temp directory when available: screenshots, console, errors. If anything blocks or looks wrong, capture a snapshot and screenshot before retrying or changing approach.
7. Return a compact verdict (see Report Format).

## State Mode

Use this quick assessment before opening the browser:

- Clean default: use no `--profile` and no `--restore` for ordinary UI flow testing, regression checks, and login/logout/auth testing.
- Personal seed: use `--profile Default` only when the user asks to use their normal browser identity or the flow depends on existing social/SSO auth.
- App profile: use `--profile ~/.agent-browser-profiles/<app>` when the user wants a durable app-specific agent identity.
- Restore: add `--restore` only when continuing a previous agent session's cookies/storage is useful.

If the right mode is unclear, ask which identity to use: clean browser, user's `Default` profile, or an app profile.

## Isolated Session

Generate a stable worktree-scoped session. The default is clean: no source profile and no saved restore state.

```bash
mkdir -p tmp/browser-evidence
SESSION="$(agent-browser session id --scope worktree --prefix agent-work)"
agent-browser --session "$SESSION" open <url>
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i -c
```

For visible verification, add `--headed` to the first command when the user says `headed`, `visible`, `watch`, or asks to see it:

```bash
SESSION="$(agent-browser session id --scope worktree --prefix agent-work)"
agent-browser --session "$SESSION" --headed open <url>
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i -c
```

For personal browser auth, use `--profile Default` only when the user asks for their normal browser identity:

```bash
SESSION="$(agent-browser session id --scope worktree --prefix agent-work)"
agent-browser --session "$SESSION" --profile Default open <url>
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" snapshot -i -c
```

## Waiting for Readiness (Hydration), Not Network Idle

Server-rendered HTML (Next, Remix, TanStack Start, SvelteKit, Nuxt, etc.) appears in the DOM **before** the framework hydrates. If you interact after only confirming an element exists, clicks and submits can silently no-op: a `<form>` does a native GET (the URL gains a trailing `?`), buttons do nothing, and typed values never reach component state. So "element is present" is not "page is interactive."

Pick the wait that matches what you actually need:

- Element present (enough for reading/snapshotting): `wait "<selector>"` or `wait --text "<text>"`.
- Navigation finished: `wait --url "<glob>"`.
- Interactive, before clicking/typing on a hydrated app: `wait --fn "<framework-ready condition>"` (see below).

### Avoid `--load` for "is it ready?" on dev servers

- `--load networkidle` waits for ~500ms of network silence. Dev servers hold persistent connections open (Vite HMR WebSocket, devtools console-pipe SSE, live-reload), so they **never** go idle and the wait burns its full timeout (~25s). It's fine on production, unreliable on dev.
- `agent-browser`'s `wait --load load` / `--load domcontentloaded` wait for the event to fire **again** after the command runs. `open` already passed those milestones, so they also sit until timeout. Don't use them as an "is it loaded" check after `open`.

### Readiness via `--fn`

`document.readyState === 'complete'` means all files finished loading (and it ignores open WebSockets/SSE) — but on an SSR app it can fire *before* the framework hydrates, so it is too early to click.

For a React app, wait for React to have attached to the element you'll interact with — the fiber/props keys appear only after hydration/render:

```bash
HYDRATED="Object.keys(document.querySelector('#email')||{}).some(k=>k.startsWith('__reactFiber\$')||k.startsWith('__reactProps\$'))"
agent-browser --session "$SESSION" wait "#email"          # exists (SSR HTML)
agent-browser --session "$SESSION" wait --fn "$HYDRATED"  # interactive (hydrated)
```

Does the fiber check work for SPAs too, or only server-rendered apps? It's a universal React signal, but it matters most for SSR:

- **SSR / hydration** (Next, Remix, TanStack Start): the element is in the server HTML before hydration, so `wait <selector>` is *not* enough — the fiber check is what tells you React has wired up its handlers. This is where it's essential.
- **Client-only SPA** (Vite+React, CRA): the element does not exist until React renders it, so `wait <selector>` already implies React owns it (fiber present). The fiber check is redundant but harmless.
- **Non-React**: adapt the `--fn` condition — an app-exposed flag like `window.appReady === true`, a framework root marker (`[data-v-app]` for Vue, Svelte hydration markers), or simply a client-only element that only appears after mount.

Prefer an app-provided readiness flag (e.g. `window.appReady`) when one exists — it's the most explicit and robust signal. Otherwise the framework-attached check above is the next best thing.

## App Profile Setup

Use this when the user wants an app-specific Agent Browser identity that is not dependent on their daily Chrome profile. Prefer headed setup so the user can log into GitHub, SSO, the app, docs, or other supporting sites manually.

```bash
APP_PROFILE="$HOME/.agent-browser-profiles/<app>"
SESSION="$(agent-browser session id --scope worktree --prefix <app>-setup)"
agent-browser --session "$SESSION" --profile "$APP_PROFILE" --headed open <url>
```

After setup, use the same app profile only for flows that need that identity:

```bash
SESSION="$(agent-browser session id --scope worktree --prefix <app>)"
agent-browser --session "$SESSION" --profile "$APP_PROFILE" open <url>
```

Do not use an app profile for clean-state testing unless the user explicitly asks. If auth is required and profile seeding is insufficient, try a saved state, auth vault, or headed manual login in the isolated session.

## Evidence

Evidence goes to repo-local `tmp/browser-evidence/` so artifacts are easy to inspect, attach to PRs, or share. Do not use the global `/tmp` directory for repo browser verification.

```bash
mkdir -p tmp/browser-evidence
agent-browser --session "$SESSION" screenshot tmp/browser-evidence/<name>.png
agent-browser --session "$SESSION" errors
agent-browser --session "$SESSION" console
```

## Bug Triage

Capture **before** evidence before changing code: URL, action sequence, expected vs actual, screenshot, console errors, failed requests, smallest likely fix area.

After fixing, rerun the same flow and provide **after** evidence.

If the browser workflow blocks in either headless or headed mode, do not silently retry in a different mode. Capture `snapshot -i -c`, screenshot, console, and errors first, then report the blocker and the mode used.

## Demo Capture

Find the clean flow in the isolated session first. Once repeatable, promote to a scripted Playwright capture with fixed viewport and deterministic data.

## When To Delegate

More than one or two browser actions → launch a subagent. Especially for multi-page flows, screenshot/video/trace collection, or visual regressions.

## Subagent Prompt Template

```markdown
You are the Browser Verification Subagent.

Goal: Verify or reproduce: <behavior, bug, or demo flow>

Context:
- Target URL(s): <urls>
- Expected behavior: <expected behavior>

Workflow:
1. Load `agent-browser skills get core`.
2. Use an isolated worktree-scoped Agent Browser session by default: `SESSION="$(agent-browser session id --scope worktree --prefix agent-work)"`.
3. Open the target URL directly with no profile/restore by default; add `--headed` only when requested.
4. Use `--profile Default`, an app profile, or `--restore` only when the user or scenario calls for that browser identity.
5. Exercise flow; capture screenshots to repo-local `tmp/browser-evidence/`.
6. Check console errors and failed network requests.
7. If blocked, capture snapshot/screenshot/console/errors before retrying or switching mode.

Return: Verdict (PASS/FAIL/BLOCKED), mode used (headless/headed, clean/profile/restore), scope tested, commands run, browser actions, evidence paths, console/network summary, findings, repro steps if failing.
```

## Fallbacks

Only when Agent Browser is unavailable: repo Playwright scripts if present, or a temporary browser harness.

## Report Format

```markdown
Verdict: PASS / FAIL / BLOCKED

Checked:
- <commands and browser flows>

Evidence:
- <artifact paths>

Findings:
- <bugs, risks, or "No issues found">
```
