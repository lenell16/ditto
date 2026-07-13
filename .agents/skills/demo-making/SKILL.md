---
name: demo-making
description: Record polished, repeatable browser demo videos, validate the demonstrated behavior, convert recordings for reliable playback, and present them in Cursor chat. Use when the user asks for a demo, walkthrough, screen recording, video evidence, before/after video, or a shareable browser flow.
---

# Demo Making

Create short, intentional demonstrations rather than recording exploratory browser work. Load the relevant browser-verification skill for the target application and the current `agent-browser` core guide before recording.

## When video is appropriate

Use video when sequence, motion, streaming, timing, or multiple interactions matter. Prefer screenshots for a single stable state.

## Workflow

1. Define the route, starting state, actions, success signal, and final hold.
2. Complete a discovery pass without recording. Resolve authentication, hydration, selectors, waits, and stale refs first.
3. Keep discovery and recording in separate browser sessions. The recording pass should execute a finalized flow without debugging.
4. Use a repository-local ignored evidence directory and stable names:

```text
tmp/browser-evidence/
  <scenario>.webm
  <scenario>.mp4
  <scenario>-poster.png
```

5. Confirm `agent-browser` and `ffmpeg` before starting:

```bash
agent-browser doctor --offline --quick
command -v ffmpeg
```

Agent Browser requires `ffmpeg` to finalize recordings. If it is absent, report the dependency before installing it.

## Recording with Agent Browser

Load the installed guide first:

```bash
agent-browser skills get core
```

Use a worktree-scoped session. Explore once, then record the proven flow:

```bash
SESSION="$(agent-browser session id --scope worktree --prefix demo)"
VIDEO="$PWD/tmp/browser-evidence/scenario.webm"

agent-browser --session "$SESSION" open "$URL"
# Wait for application hydration and verify the starting state.
agent-browser --session "$SESSION" record start "$VIDEO"
# record start creates a fresh context: repeat readiness checks here.
# Execute the already-proven actions and targeted waits.
agent-browser --session "$SESSION" wait 1800 # short final-state hold
agent-browser --session "$SESSION" record stop
agent-browser --session "$SESSION" close
```

Always stop the recorder, including after a failed take. Do not report a take that timed out, captured no frames, or missed the success signal.

### Authentication

- Verify login without recording before the final take.
- Wait for hydration, not merely server-rendered fields.
- Treat a browser command's “logged in” output as provisional; assert an application signal such as the destination URL or authenticated heading.
- If a saved auth profile fails its dry run, use project-documented local development selectors and credentials. Do not expose real credentials in scripts or output.

### Pacing

- Hold the initial state for about 0.8–1.2 seconds.
- Pause 0.4–0.8 seconds between meaningful actions.
- Use targeted application waits for navigation, streaming, and responses.
- Hold the decisive final state for about 1.5–2 seconds.
- Avoid arbitrary waits except for presentation pacing.

## Cursor-compatible output

Agent Browser records WebM. Keep it as the source artifact, then create an H.264 MP4 for Cursor playback:

```bash
ffmpeg -y -i scenario.webm \
  -c:v libx264 -pix_fmt yuv420p -movflags +faststart -an \
  scenario.mp4
```

Validate the deliverable:

```bash
ffprobe -v error \
  -show_entries format=duration,size \
  -show_entries stream=codec_name,width,height \
  -of default=noprint_wrappers=1 scenario.mp4
```

Capture or generate a poster image that shows the final successful state. Verify both the poster and video exist in the repository evidence directory.

## Presenting in Cursor

Use full absolute filesystem paths. Try an inline video with an MP4 and poster:

```html
<video controls width="100%" src="/absolute/path/scenario.mp4" poster="/absolute/path/scenario-poster.png"></video>
```

Always include a fallback absolute-path link:

```markdown
[Open the demo video](/absolute/path/scenario.mp4)
```

Do not use relative paths or `file://`. A persistent shimmer or skeleton means the inline preview did not load; verify the MP4 codec and keep the direct link as the reliable deliverable.

## Report

Include:

- PASS, FAIL, or BLOCKED
- Demonstrated flow and strongest success assertion
- Duration, dimensions, codec, and artifact paths
- Inline preview plus direct video link
- Any omitted or manually approved steps
