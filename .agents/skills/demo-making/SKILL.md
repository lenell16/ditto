---
name: demo-making
description: Record and present short browser videos for interaction, motion, timing, streaming, or multi-step changes. Use when a browser handoff needs video evidence, or when the user asks for a demo, walkthrough, screen recording, before/after video, or shareable browser flow. Supports native Cursor Cloud and Codex recording plus Agent Browser for portable CLI recording.
---

# Demo Making

Record the proven flow, not exploratory debugging. Follow `browser-handoff` for the scenario, assertions, screenshots, and verdict; this skill owns recording and delivery.

## Recorder

- Cursor Cloud: RecordScreen with Computer Use.
- Codex: Browser or Computer Use recording when available.
- Cursor local: native recording when available.
- CLI, headless, or no native recorder: Agent Browser in headed mode.

Use the recorder named by the user. Do not substitute Agent Browser when the runtime already provides a native recorder.

## Record

1. Define the initial state, actions, success signal, and final frame.
2. Complete a non-recorded discovery pass. Resolve auth, hydration, selectors, waits, and errors first.
3. Start a clean take:
   - hold the initial state for about one second;
   - pause briefly between meaningful actions;
   - use targeted app waits rather than arbitrary delays;
   - hold the successful final state for about two seconds.
4. Stop and save the recording even after a failed take. Discard takes that miss the success signal, time out, or capture no frames.
5. Validate the deliverable and capture a poster image when useful.

Store artifacts in the repository's evidence directory or `tmp/browser-evidence/`:

```text
<scenario>.webm
<scenario>.mp4
<scenario>-poster.png
```

Reuse an authenticated browser unless login is part of the demonstration. Never expose real credentials or secrets.

## Native recording

On Cursor Cloud:

```text
RecordScreen(START_RECORDING)
→ perform the proven flow with Computer Use
→ RecordScreen(SAVE_RECORDING, <scenario>)
```

Use the equivalent native recording path in Codex or Cursor local when available. Copy the saved artifact into the repository evidence directory when a worktree-local copy is useful.

## Agent Browser fallback

Load its current CLI instructions first:

```bash
agent-browser skills get core
agent-browser doctor --offline --quick
command -v ffmpeg
```

Report a missing `ffmpeg` dependency before installing it. Use a worktree-scoped session, record the already-proven flow, then close the session:

```bash
SESSION="$(agent-browser session id --scope worktree --prefix demo)"
agent-browser --session "$SESSION" open "$URL"
agent-browser --session "$SESSION" record start "$VIDEO"
# Perform the proven actions and targeted waits.
agent-browser --session "$SESSION" record stop
agent-browser --session "$SESSION" close
```

Convert WebM when needed:

```bash
ffmpeg -y -i scenario.webm \
  -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an \
  scenario.mp4
```

## Deliver

Probe the final file with `ffprobe`. Report the demonstrated flow, strongest assertion, duration, dimensions, codec, and absolute artifact path. Present an inline video plus a direct link when supported.

Attach the video to an existing PR when useful and practical. Do not open a PR only to host evidence unless requested.
