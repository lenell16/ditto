---
name: demo-making
description: Record polished, repeatable browser demo videos and present them for review. Selects the recorder for the current agent runtime — Cursor Cloud RecordScreen + Computer Use, Codex Browser/Computer Use when available, or Agent Browser for local/CLI scriptable video. Use when the user asks for a demo, walkthrough, screen recording, video evidence, before/after video, or a shareable browser flow.
---

# Demo Making

Create short, intentional demonstrations. Do not record exploratory debugging. Load the project’s browser-verification skill (for Ditto: `browser-verification`) for app URL, auth, and hydration rules. Choose the recorder from the **current runtime**, not from habit.

## When video is appropriate

Use video when sequence, motion, streaming, timing, or multiple interactions matter. Prefer screenshots for a single stable state.

## Choose the recorder

| Runtime | Recorder | Notes |
| --- | --- | --- |
| **Cursor Cloud** | `RecordScreen` + Computer Use | Native path. Do **not** reach for Agent Browser. |
| **Cursor local** | Computer Use / local screen capture if available; else Agent Browser | Prefer whatever this Cursor session already exposes. |
| **Codex** | Codex Browser or Codex Computer Use when they can capture video; else Agent Browser | Keep a live final tab when useful. |
| **Claude Code / CLI / headless** | Agent Browser headed recording | Load `agent-browser skills get core` before recording. |

If the user explicitly names a recorder, use that.

## Shared workflow

1. Define route, starting state, actions, success signal, and final hold.
2. Complete a **discovery pass without recording**. Resolve auth, hydration, selectors, and waits first.
3. Keep discovery and recording separate when the tool allows (separate session, or stop/start recording cleanly).
4. Store artifacts under a repo-local ignored directory (Ditto: `tmp/ditto-browser-evidence/`; otherwise `tmp/browser-evidence/`):

```text
tmp/browser-evidence/
  <scenario>.webm          # optional source
  <scenario>.mp4           # deliverable
  <scenario>-poster.png    # final success frame
```

5. Always stop the recorder, including after a failed take. Do not ship a take that timed out, captured no frames, or missed the success signal.

### Authentication

- Prefer reusing an already-authenticated browser for the same environment when the demo is not about login.
- When login is part of the story, verify login without recording before the final take.
- Wait for hydration, not merely server-rendered fields.
- Assert an application signal (destination URL or authenticated heading), not a tool’s “logged in” claim alone.
- Use project-documented local credentials only. Do not expose real secrets.

### Pacing

- Hold the initial state ~0.8–1.2s.
- Pause ~0.4–0.8s between meaningful actions.
- Use targeted app waits for navigation, streaming, and responses.
- Hold the decisive final state ~1.5–2s.
- Avoid arbitrary waits except for presentation pacing.

---

## Path A — Cursor Cloud (RecordScreen + Computer Use)

Use this whenever Computer Use and `RecordScreen` are available (typical Cursor Cloud agent).

1. Ensure the app is reachable (project preflight / Portless / seed as needed).
2. Optionally dry-run the flow once with Computer Use **without** recording.
3. Start recording, then drive the finalized flow:

```text
RecordScreen(mode=START_RECORDING)
→ Computer Use: open app, perform the proven steps, wait for success signal, short final hold
→ RecordScreen(mode=SAVE_RECORDING, save_as_filename=<scenario>)
```

4. Confirm the saved MP4 under `/opt/cursor/artifacts/` (or the path returned by `SAVE_RECORDING`). Copy into the repo evidence directory when you also want a worktree-local artifact.
5. Do **not** manually copy half-finished staging files after a failed save. If `SAVE_RECORDING` fails, discard and re-record.
6. Capture a poster from the final successful frame when useful.

Agent Browser is the wrong default here — Cursor Cloud already has a full desktop browser and native video pipeline.

---

## Path B — Agent Browser (local / CLI / portable)

Use when the runtime has no native recorder, or the user wants a scriptable headed CLI recording.

```bash
agent-browser skills get core
agent-browser doctor --offline --quick
command -v ffmpeg
```

Agent Browser needs `ffmpeg` to finalize recordings. Report a missing dependency before installing it.

```bash
SESSION="$(agent-browser session id --scope worktree --prefix demo)"
VIDEO="$PWD/tmp/browser-evidence/scenario.webm"

agent-browser --session "$SESSION" open "$URL"
# Wait for hydration; verify starting state.
agent-browser --session "$SESSION" record start "$VIDEO"
# record start may create a fresh context — repeat readiness checks.
# Execute the already-proven actions and targeted waits.
agent-browser --session "$SESSION" wait 1800
agent-browser --session "$SESSION" record stop
agent-browser --session "$SESSION" close
```

Convert WebM → H.264 MP4 for Cursor and most chat UIs:

```bash
ffmpeg -y -i scenario.webm \
  -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an \
  scenario.mp4
```

---

## Path C — Codex Browser / Computer Use

- Prefer the in-app Browser for ordinary flows the user should see live.
- Use Codex Computer Use when OS chrome, extensions, or non-DOM UI are required.
- If those tools can produce a recording in this session, use them and skip Agent Browser.
- Otherwise fall back to Path B for the video artifact while still leaving a live Browser tab when helpful.

---

## Validate and present

Probe the deliverable:

```bash
ffprobe -v error \
  -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height \
  -of default=noprint_wrappers=1 scenario.mp4
```

Present with absolute filesystem paths. Prefer inline video plus a fallback link:

```html
<video controls width="100%" src="/absolute/path/scenario.mp4" poster="/absolute/path/scenario-poster.png"></video>
```

```markdown
[Open the demo video](/absolute/path/scenario.mp4)
```

Do not use relative paths or `file://`. A persistent shimmer means the inline preview failed — verify H.264/yuv420p and keep the direct link.

### PRs

When a PR already exists for the work, embedding or linking the demo video in the PR body is helpful. Do not open a PR only to attach a video unless asked.

## Report

Include:

- PASS, FAIL, or BLOCKED
- Runtime + recorder path used
- Demonstrated flow and strongest success assertion
- Duration, dimensions, codec, and artifact paths
- Inline preview plus direct video link
- Any omitted or manually approved steps
