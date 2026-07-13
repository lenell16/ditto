---
name: browser-verification-workflow
description: Verify browser UI, reproduce web bugs, exercise user flows, and capture reviewable evidence across Codex in-app Browser, Chrome, Playwright CLI, Computer Use, or Agent Browser. Use for local or remote browser testing, visual checks, authenticated flows, console/network inspection, repeated verification loops, screenshots, video demos, traces, and PASS/FAIL/BLOCKED reports.
---

# Browser Verification Workflow

Verify behavior with the lightest browser surface that preserves the required state and evidence. Keep the verification policy independent of any one browser tool.

## Choose the surface

Use this order unless the user explicitly chooses a surface:

1. **Codex in-app Browser** for ordinary interactive verification in the Codex app. Prefer it when a live final tab, DOM assertions, console logs, or screenshots are enough.
2. **Playwright CLI** for isolated state, multiple personas, repeat loops, console/network diagnostics, traces, or automation that should run independently of the Codex UI. Load the curated `playwright` skill when available.
3. **Chrome** when the flow requires the user's existing Chrome profile, login, tabs, or extensions. Load the Chrome control skill before use.
4. **Computer Use** for native dialogs, desktop apps, inaccessible browser chrome, canvas-heavy interactions, or OS-level flows that browser APIs cannot reach.
5. **Agent Browser** as a portable fallback outside Codex or when explicitly requested. Load `agent-browser skills get core` before using it.

Do not ask the user to choose a surface when the request makes the choice immaterial. Ask only when browser identity, isolation, or visibility would materially change the result.

### Selection examples

- "Verify this page and show me the result" -> in-app Browser.
- "Test clean login and logout" -> Playwright CLI with an isolated session.
- "Run this flow repeatedly while fixing it" -> Playwright CLI.
- "Use my existing account" -> Chrome.
- "Test the native file picker" -> Computer Use or Chrome if its supported browser API covers the picker.
- "Capture a trace or inspect requests" -> Playwright CLI, or in-app Browser with CDP when that capability is enabled and appropriate.
- "Make a polished video demo of this flow" -> load `demo-making`, then use its recording and presentation workflow.

## Separate environment from browser state

Treat these as independent dimensions:

- **Environment**: source checkout/worktree, database, dev server, and URL.
- **Scenario state**: cookies, storage, persona, tabs, and progress through a flow.

A worktree-specific URL isolates the application instance; it does not guarantee isolated browser storage. Separate tabs organize flows but normally share browser state.

Use an isolated Playwright/Agent Browser session when testing different users, clean authentication, conflicting storage, or concurrent scenarios. Name persistent sessions with both environment and scenario when useful, for example `<repo>-<worktree>-<scenario>`. Do not create named sessions for a one-off in-app Browser check.

## Verification loop

1. Identify the URL, flow, expected behavior, and strongest success signal.
2. Reuse a healthy local dev server; start one only when necessary.
3. Select the surface and state mode: shared, clean, authenticated, personal, or scenario-isolated.
4. Open the target directly. Wait for the application to be interactive before acting.
5. Inspect current DOM or visual state, then interact using stable semantic locators when available.
6. Re-inspect after navigation or substantial rerenders. Prefer targeted assertions over repeated broad snapshots.
7. Capture evidence and diagnostics proportional to the risk.
8. Leave a live browser tab open only when it is useful to the user; otherwise clean up temporary tabs/sessions.
9. Return the standard verdict.

## Readiness

Do not equate element presence with hydration. On SSR applications, HTML can appear before handlers are attached.

- For reading: wait for the relevant element.
- For interaction: wait for an application-ready signal or framework ownership of the target.
- For React without an app-ready flag, a fiber/props check on the target is acceptable.
- Avoid `networkidle` on dev servers with HMR, SSE, or persistent WebSockets.
- Do not wait for load events that already fired before the wait began.

Prefer an application-provided readiness signal when one exists.

## Interaction discipline

- Prefer `data-testid`, stable `data-*`, exact `href`, semantic role/name, then scoped text/CSS.
- Confirm ambiguous locators resolve to one element before acting.
- Refresh DOM evidence after navigation, major UI changes, or stale-element failures.
- Prefer structured success signals: URL, selected state, exact response, toast, modal, or line item.
- Use visual/coordinate interaction only when semantic browser control is insufficient.
- Capture failure evidence before retrying with a different strategy or surface.

## Evidence

Use a repository-local ignored directory. Follow a project wrapper's directory when supplied; otherwise use `tmp/browser-evidence/`.

Capture only evidence that helps prove the verdict:

- Always capture the final successful state for visual or interaction work.
- Capture an initial state only when comparison is meaningful.
- On failure, capture the blocked/failing state before changing strategy.
- Prefer viewport screenshots. Use full-page screenshots only for genuinely scrollable pages and verify the rendered result.
- Use stable scenario/state names such as `chat-empty.png`, `chat-response.png`, or `login-failure.png`.
- Embed one or two decisive screenshots in the final response; link traces, videos, logs, or extra screenshots.
- In Cursor, first place screenshots in the repository evidence directory, then embed them with the full absolute filesystem path:
  `![Chat response](/absolute/path/to/tmp/browser-evidence/chat-response.png)`.
  Do not use a relative path or add a `file://` prefix. If a browser tool returns a temporary screenshot path, copy the file into the evidence directory before embedding it.
- When a user requests video or the behavior is best demonstrated as a sequence, load `demo-making`. Keep browser verification responsible for the assertions and verdict; let the demo skill own recording, pacing, conversion, validation, and chat presentation.

Inspect console errors and warnings for ordinary UI verification. Add network inspection or a trace when diagnosing requests, timing, or intermittent behavior. Do not produce heavy diagnostics for a simple successful smoke test.

## Repetition and promotion

Do not create automation for a one-time verification.

When the same flow must run repeatedly during a task:

1. Use a named Playwright CLI scenario session.
2. Keep temporary artifacts in the evidence directory.
3. Prefer semantic Playwright locators over replaying snapshot element references in a shell script.
4. Promote the flow to a committed Playwright test only when the user asks or durable regression coverage is clearly in scope.

A temporary shell wrapper may orchestrate stable CLI commands, but do not treat snapshot refs such as `e12` as durable selectors.

## Failure handling

Before switching surface or retry strategy, preserve:

- Current URL and state description
- Screenshot
- Relevant DOM/snapshot evidence
- Console errors/warnings
- Failed requests or trace when applicable
- Expected versus actual behavior

Report authentication or environment blockers directly. Do not silently substitute a personal profile, shared state, or different application instance.

## Report

Return a compact, self-contained report:

```markdown
Verdict: PASS / FAIL / BLOCKED

Surface:
- <browser surface and state mode>
- <environment URL or scope when useful>

Checked:
- <flow and strongest assertions>

Diagnostics:
- <console/network/trace summary, or "No relevant errors">

Evidence:
- <embedded decisive screenshots and linked artifacts>

Findings:
- <issues, risks, repro steps, or "No issues found">
```

Mention commands only when they help the user reproduce or understand the environment. Do not dump routine browser actions.
