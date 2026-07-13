---
name: browser-handoff
description: Produce reviewable browser evidence for UI changes and interactive bug fixes across Cursor, Codex, Claude, local CLI, and cloud agents. Use when implementing or verifying browser-visible work, reproducing UI bugs, capturing before/after screenshots, checking interaction flows, or preparing a PASS/FAIL/BLOCKED handoff. Loads demo-making only when video is warranted.
---

# Browser Handoff

Leave evidence that lets a person understand what changed without rerunning the work.

## Choose the evidence

- Stable visual change or visual bug: capture before and after screenshots.
- Interaction, motion, timing, streaming, or multi-step bug: capture a short video; load `demo-making`.
- Nonvisual browser behavior: capture the strongest visible state plus targeted console, network, or trace evidence when relevant.
- Always capture the decisive final state. Capture before only when it adds a meaningful comparison.

Capture the before state before editing when practical. Do not fabricate it afterward; use a trustworthy baseline checkout or state that it was unavailable.

Store artifacts in the repository's documented ignored evidence directory, or `tmp/browser-evidence/`. Use stable scenario names such as `settings-before.png`, `settings-after.png`, and `chat-streaming.mp4`.

## Choose the browser

Use the lightest browser surface already available in the current runtime:

- Cursor Cloud: Computer Use and its native browser.
- Cursor local: Cursor browser tools or Computer Use.
- Codex: the in-app Browser; Computer Use for OS or extension UI.
- CLI, headless, or another server: Playwright CLI; Agent Browser when no native surface exists or `demo-making` selects it.
- User Chrome: only when the user's real profile, extensions, or saved identity is part of the scenario.

Use Playwright for clean sessions, multiple personas, repeated flows, traces, or isolation. A worktree-specific URL isolates the app instance, not necessarily browser cookies.

If the user names a browser or recorder, use it.

## Workflow

1. Identify the route, starting state, expected behavior, and strongest success signal.
2. Reuse a healthy app server and existing authenticated state unless the scenario requires a clean login.
3. Capture the meaningful before or failing state before implementation when feasible.
4. Implement the change.
5. Open the target directly and wait for actual interactivity; SSR element presence alone does not prove hydration.
6. Exercise the smallest flow that proves the result. Prefer stable semantic locators.
7. Check the browser console for relevant errors. Add network, server-log, or trace diagnostics only when the behavior depends on them.
8. Capture and inspect the final evidence. Keep a useful final tab open when the runtime supports it.

Do not create permanent browser automation for a one-off handoff unless requested. Preserve failure evidence before changing strategy.

## Report

Keep the handoff compact:

```markdown
Verdict: PASS / FAIL / BLOCKED

Checked:
- <flow and strongest assertion>

Evidence:
- <embedded decisive screenshots or linked video/trace>

Diagnostics:
- <relevant console/network/server result, or "No relevant errors">

Findings:
- <issues or "No issues found">
```

Mention the runtime, browser surface, state mode, or URL only when it helps reproduce or interpret the result. Use absolute artifact paths when the chat client requires them.