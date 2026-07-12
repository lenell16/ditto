---
name: browser-verification
description: Verify UI, routes, authentication, and browser interactions in Ditto's apps/web using the project's Vite+, Portless, PGlite, and dev-user setup. Use for Memoria browser smoke tests, visual checks, bug reproduction, screenshots, console/network diagnostics, repeated browser loops, and end-of-task PASS/FAIL/BLOCKED reports. Extends browser-verification-workflow and selects Codex Browser, Playwright CLI, Chrome, Computer Use, or Agent Browser according to the scenario.
---

# Browser Verification (Ditto)

Load and follow `browser-verification-workflow`. This wrapper supplies only Ditto-specific setup, recovery, authentication, and validation.

## Project map

| Item | Value |
| --- | --- |
| App package | `apps/web` |
| Dev command | `vp run --filter web dev` |
| App URL | Resolve with `portless get memoria`; never hardcode it |
| Dev-user seed | `vp run --filter web seed:dev-user` |
| Cheap validation | `vp run --filter web check`, `vp run --filter web test` |
| Full tests | `vp run -r test` |
| Routes | `apps/web/src/routes/` |
| Evidence | `tmp/ditto-browser-evidence/` |
| Auth constants | `apps/web/src/dev/browser-auth.ts` |

Use Vite+ commands; do not replace them with raw package-manager equivalents.

## Preflight

1. Inspect existing task terminal output and reuse a healthy `vp run --filter web dev` process.
2. Resolve `MEMORIA="$(portless get memoria)"`.
3. Confirm the app serves: `curl -sk -o /dev/null -w '%{http_code}' "$MEMORIA/login"` must return `200`.
4. If the app is unavailable, start the Portless proxy before the dev server when necessary, then run `vp run --filter web dev`.
5. Confirm dev output shows the resolved Portless URL.
6. Run `vp run --filter web check` and the relevant package tests when practical for the change under verification.

Do not start duplicate dev servers. A registered Portless alias can still return `000` or `404` when the app process is absent.

### Portless

The main worktree normally resolves to `https://memoria.localhost`; linked worktrees receive a prefixed hostname. Always use the runtime-resolved URL.

If the proxy is not running, start it before `vp dev`:

```bash
portless proxy start -p 1355
```

An existing privileged `:443` proxy is also valid. Do not attempt interactive `sudo` from a non-interactive shell.

If login returns `INVALID_ORIGIN`, confirm the dev process received the exact `PORTLESS_URL`. Better Auth trusts that value in development.

### PGlite recovery

`RuntimeError: Aborted()` from PGlite usually means the worktree-local database is corrupted and the Node process is poisoned.

1. Stop the process using the database.
2. Move `.data/pglite` to a timestamped `.data/pglite.corrupt-*` path; do not delete it.
3. Run `vp run --filter web seed:dev-user`.
4. Restart the dev server.

## Authentication

Local development credentials are defined in `apps/web/src/dev/browser-auth.ts`:

| Field | Value |
| --- | --- |
| Email | `agent@memoria.local` |
| Password | `local-dev-password` |
| Email selector | `#email` |
| Password selector | `#password` |
| Submit selector | `button[type="submit"]` |

Seed once per worktree before authenticated flows:

```bash
vp run --filter web seed:dev-user
```

The login form is server-rendered. Wait for React hydration before submitting. Do not use `networkidle`; Vite HMR and the devtools console pipe keep connections open.

A suitable React readiness check is:

```js
Object.keys(document.querySelector('#email') || {}).some(
  (key) => key.startsWith('__reactFiber$') || key.startsWith('__reactProps$'),
)
```

Confirm successful authentication with the unambiguous home signal `Project ready!`.

### Browser state

- Use the in-app Browser's current state for ordinary authenticated verification when shared state is acceptable.
- Use an isolated Playwright CLI scenario for clean login/logout, multiple users, or conflicting storage.
- Use Chrome only when the user's real Chrome identity is part of the test.
- Agent Browser's `ditto` vault remains a portable fallback outside Codex; do not require it for Codex-native verification.

Worktree URLs isolate app instances, not necessarily browser cookies. Separate tabs do not create separate authentication contexts.

## Ditto verification loop

1. Identify the route, scenario, expected behavior, and success signal.
2. Complete preflight and seed the dev user when required.
3. Let `browser-verification-workflow` select the surface and scenario state.
4. Open `${MEMORIA}/<route>` directly.
5. Wait for target hydration before interactions.
6. Exercise the flow and capture evidence in `tmp/ditto-browser-evidence/`.
7. Inspect browser console warnings/errors. Add network or trace evidence for request, timing, or intermittent failures.
8. Check dev-server logs for server-side failures.
9. Return the standard verdict and embed decisive screenshots.

For Codex in-app Browser verification, leave the final tab open as a deliverable when it helps the user review or continue the flow. Clean up login, duplicate, or intermediate tabs.

For repeat loops, use Playwright CLI with a scenario name that includes the worktree and feature when useful, for example `ditto-main-chat-streaming`. Do not commit a regression test unless requested or clearly in scope.

## Route tree

When the dev server is running, adding or renaming files under `apps/web/src/routes/` updates `routeTree.gen.ts` automatically. Otherwise start the server or run a build. Commit the generated route tree when it changes.

## Evidence and report

Prefer viewport screenshots with stable names:

```text
tmp/ditto-browser-evidence/
  <scenario>-before.png
  <scenario>-after.png
  <scenario>-failure.png
```

Capture `before` only when comparison matters; always capture the decisive final state for visual/interaction verification. Verify screenshots render correctly before reporting them.

Include:

- PASS, FAIL, or BLOCKED
- Surface and state mode
- Resolved Memoria environment when relevant
- Flow and strongest assertions
- Console/network/server-log summary
- Embedded decisive screenshots and links to traces or extra artifacts
- Findings and concise repro steps when failing
