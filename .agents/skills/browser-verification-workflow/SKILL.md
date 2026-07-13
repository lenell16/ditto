---
name: browser-verification-workflow
description: Verify browser UI, reproduce web bugs, exercise user flows, and capture reviewable evidence across agent runtimes (Cursor Cloud, Cursor local, Codex, Claude Code/CLI). Selects the native browser surface for the current runtime first; uses Playwright CLI for isolation/traces and Agent Browser only when explicitly needed. Use for local or remote browser testing, visual checks, authenticated flows, console/network inspection, screenshots, and PASS/FAIL/BLOCKED reports. For polished videos, load demo-making.
---

# Browser Verification Workflow

Verify behavior with the lightest surface that already exists in the current agent runtime. Keep policy independent of any one browser tool. Prefer a short end report over ceremony.

## Detect the runtime first

Pick the surface from what this agent already has. Do **not** default to Agent Browser when a native browser, Computer Use, or in-app Browser is available.

| Runtime | Prefer for ordinary UI checks | Prefer for demos / video | Prefer for isolation / traces |
| --- | --- | --- | --- |
| **Cursor Cloud** | Computer Use (desktop Chrome in the VM) | `demo-making` → RecordScreen + Computer Use | Playwright CLI when available; otherwise Computer Use with a clean profile |
| **Cursor local** | Computer Use / local browser tools the agent already has | `demo-making` (native recording if available, else Agent Browser) | Playwright CLI |
| **Codex** | Codex in-app Browser | `demo-making` (Codex Browser / Computer Use when it can record; else Agent Browser) | Playwright CLI; Chrome when the user's real profile is required |
| **Claude Code / CLI / desktop** | The host's native browser tool if present; else Playwright CLI | `demo-making` → Agent Browser for scriptable headed video | Playwright CLI or Agent Browser |
| **Headless / CI-like shell** | Playwright CLI or Agent Browser | Agent Browser recording when video is requested | Playwright CLI |

Ask the user to choose a surface only when browser identity, isolation, or visibility would materially change the result. Otherwise decide and proceed.

### Hard rules

1. **Native first.** If this runtime ships a browser or Computer Use path, use it. Agent Browser is not a substitute for Cursor Cloud Computer Use or Codex in-app Browser.
2. **Do not treat Agent Browser as the default browser tool.** There is no curated Agent Browser skill in this repo on purpose — its broad upstream description steals work from native surfaces. Load CLI instructions (`agent-browser skills get core`) only after this workflow (or `demo-making`) selects that surface, or the user names Agent Browser.
3. **Explicit beats default.** If the user names Codex Browser, Chrome, Playwright, Computer Use, or Agent Browser, use that.
4. **Video is a separate skill.** Load `demo-making` for demos, walkthroughs, and shareable recordings. Keep assertions and the verdict here.

### Selection examples

- "Verify this page and show me" in Codex → Codex in-app Browser.
- Same request in Cursor Cloud → Computer Use against the running app URL.
- "Test clean login and logout" → Playwright CLI (isolated), or Agent Browser only if Playwright is unavailable.
- "Run this flow repeatedly while fixing it" → Playwright CLI.
- "Use my existing account / passwords in Chrome" → Chrome / connected user browser.
- "Make a polished video demo" → `demo-making` (runtime-specific recorder).
- "Use Agent Browser" / CLI headed recording → Agent Browser after `agent-browser skills get core`.

## Surfaces (capabilities)

- **Codex in-app Browser** — live tab, DOM checks, console, screenshots. No arbitrary CDP/manual Chrome control. Great for ordinary verification the user can watch.
- **Playwright CLI** — isolated storage, personas, traces, network, repeatable loops, CI-friendly automation. Load a curated `playwright` skill when available.
- **Chrome / user browser** — real profile, extensions, saved sessions, OS password managers. Use when identity is part of the test.
- **Computer Use** — full desktop control (dialogs, extensions UI, canvas, OS chrome). Primary path on Cursor Cloud; also used by Codex’s local computer-use agent when present.
- **Agent Browser** — portable CDP CLI: snapshots, refs, vault, headed mode, scriptable video. Use for local/CLI workflows, portable recording, or when no native browser surface exists. Not the default inside Cursor Cloud or Codex when natives are available.

## Environment vs browser state

Treat these as independent:

- **Environment**: checkout/worktree, database, dev server, URL.
- **Scenario state**: cookies, storage, persona, tabs, progress through a flow.

A worktree-specific URL isolates the app instance; it does **not** isolate browser cookies. Separate tabs usually share storage.

### Auth / session shortcuts

- If the chosen browser is **already logged in** for this environment, reuse it. Prefer refresh / navigate to the target route over a full login.
- Do a **full login** when testing auth itself, switching users, or the session is missing/expired.
- Use an **isolated** Playwright or Agent Browser session for clean login/logout, multiple personas, or conflicting storage. Name sessions `<repo>-<worktree>-<scenario>` when persistence helps.
- Do not create named sessions for a one-off in-app Browser or Computer Use glance.

## Verification loop

1. Identify URL, flow, expected behavior, and strongest success signal.
2. Reuse a healthy local/dev server; start one only when necessary.
3. Detect runtime → select surface and state mode (shared, clean, authenticated, personal, scenario-isolated).
4. Open the target directly. Wait for the app to be interactive before acting.
5. Inspect current DOM or visual state; interact with stable semantic locators when available.
6. Re-inspect after navigation or substantial rerenders. Prefer targeted assertions over repeated broad snapshots.
7. Capture evidence proportional to risk.
8. Leave a live tab open only when useful to the user; otherwise clean up temporary tabs/sessions.
9. Return the standard verdict.

## Readiness

Do not equate element presence with hydration. On SSR apps, HTML can appear before handlers attach.

- Reading: wait for the relevant element.
- Interaction: wait for an app-ready signal or framework ownership of the target.
- React without an app-ready flag: a fiber/props check on the target is acceptable.
- Avoid `networkidle` on dev servers with HMR, SSE, or persistent WebSockets.
- Do not wait for load events that already fired before the wait began.

## Interaction discipline

- Prefer `data-testid`, stable `data-*`, exact `href`, semantic role/name, then scoped text/CSS.
- Confirm ambiguous locators resolve to one element before acting.
- Refresh DOM evidence after navigation, major UI changes, or stale-element failures.
- Prefer structured success signals: URL, selected state, exact response, toast, modal, or line item.
- Use visual/coordinate interaction only when semantic control is insufficient.
- Capture failure evidence before retrying with a different strategy or surface.

## Evidence

Use a repository-local ignored directory. Follow a project wrapper’s directory when supplied; otherwise `tmp/browser-evidence/`.

- Always capture the final successful state for visual or interaction work.
- Capture an initial state only when comparison is meaningful.
- On failure, capture the blocked/failing state before changing strategy.
- Prefer viewport screenshots. Full-page only for genuinely scrollable pages; verify the rendered result.
- Stable names: `chat-empty.png`, `chat-response.png`, `login-failure.png`.
- Embed one or two decisive screenshots in the final response; link traces, videos, logs, or extras.
- In Cursor, copy screenshots into the evidence directory, then embed with the **full absolute** path (no relative path, no `file://`).
- For video, load `demo-making`. This skill keeps assertions and the verdict; that skill owns recording and presentation.

Inspect console warnings/errors for ordinary UI checks. Add network or trace evidence for request, timing, or intermittent failures. Skip heavy diagnostics on a simple successful smoke test.

## Repetition and promotion

Do not create automation for a one-time check.

When the same flow must run repeatedly:

1. Use a named Playwright CLI scenario session when possible.
2. Keep temporary artifacts in the evidence directory.
3. Prefer semantic Playwright locators over replaying snapshot refs in a shell script.
4. Promote to a committed Playwright test only when asked or clearly in scope.

## Failure handling

Before switching surface or retry strategy, preserve URL/state, screenshot, relevant DOM, console errors, and failed requests/trace when applicable. Report auth or environment blockers directly — do not silently substitute a personal profile or different app instance.

## Report

Keep it compact:

```markdown
Verdict: PASS / FAIL / BLOCKED

Surface:
- <runtime, browser surface, state mode>
- <environment URL when useful>

Checked:
- <flow and strongest assertions>

Diagnostics:
- <console/network/trace summary, or "No relevant errors">

Evidence:
- <embedded decisive screenshots and linked artifacts>

Findings:
- <issues, risks, repro steps, or "No issues found">
```

Mention commands only when they help reproduction. Do not dump routine browser actions.

### PRs and demos

If the task already produces a PR and the user asked for a demo or the flow is hard to grasp from screenshots, attach or embed the demo video in the PR description when practical. Do not open a PR solely to host a video unless the user asks. When the user requests multiple related browser tasks, ask whether they want one grouped PR or separate PRs before splitting work.
