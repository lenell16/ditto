# Architecture

Factual overview of how this repo is put together and the decisions behind it.
`AGENTS.md` holds the terse, always-applied rules; this file holds the
descriptive detail and rationale. Keep it current — when a decision below
changes, update it here.

## Stack

- **Monorepo** — pnpm workspaces (`apps/*`, `packages/*`), Turbo for task
  orchestration, [Vite+](https://viteplus.dev) (`vp`) as the unified toolchain.
  Node `>=22.12`, pnpm `10.33.2`. `vite` is pinned via the workspace catalog to
  `@voidzero-dev/vite-plus-core`; `vitest` is pinned to the Vitest version
  bundled with the active Vite+ release.
- **`apps/web`** — TanStack Start + TanStack Router (file-based routes, React
  19). AI via the Vercel AI SDK (`ai` v6, `@ai-sdk/anthropic`, `@ai-sdk/openai`,
  gateway). Durable, resumable chat via the Vercel Workflow SDK (`workflow`,
  `@workflow/ai`). Tailwind v4, TanStack Form + Table, Zod, streamdown. Local
  dev runs through portless (app name `memoria`).
- **`apps/ext`** — Chrome extension (crxjs Vite plugin) with popup, side panel,
  and content scripts. React 19 + Tailwind, consumes `@workspace/ui`.
- **`packages/db`** — Drizzle ORM. Postgres via pglite locally (with pgvector)
  or Neon serverless in production. See [Database](#database).
- **`packages/ui`** — shadcn/ui components built on `@base-ui/react`, exported
  as `@workspace/ui` (`./components/*`, `./hooks/*`, `./lib/*`, `./globals.css`).

## Layout

```
apps/web        TanStack Start app (routes, workflows, hooks, lib)
apps/ext        Chrome extension
packages/db     Drizzle schema + client (pglite / neon)
packages/ui     Shared shadcn/ui component library
```

## Data flow — durable chat (worked example)

The multi-turn durable chat is the reference example for how the layers compose:

1. **Start** — `POST /api/durable-chat-multi` parses the initial messages and
   calls `start(multiTurnChatWorkflow, [messages])`, returning a UI message
   stream plus an `x-workflow-run-id` header.
2. **Workflow** (`'use workflow'`) — runs a `DurableAgent.stream` loop, emitting
   user-message markers and streaming assistant output. It pauses between turns
   on a hook (`chatMessageHook`) and resumes when the next message arrives.
3. **Steps** (`'use step'`) — small durable units (writing stream markers,
   closing the stream). Steps are where the framework's retry/replay lives.
4. **Follow-ups** — the client `POST`s to `/api/durable-chat-multi/$id`
   (`chatMessageHook.resume`); `/done` ends the session. Reconnecting to an
   in-flight run streams from `/api/durable-chat-multi/$id/stream`.
5. **Client** — `use-multi-turn-chat.ts` drives `useChat` (`@ai-sdk/react`) with
   `WorkflowChatTransport`, tracking the run id and reconciling streamed
   user-message markers.

## Conventions & decisions

### Error handling

New business-logic functions whose failure is part of the contract (not-found,
validation, conflict, quota, etc.) return `Result<T, E>` from `better-result`
with `TaggedError` types instead of throwing. Library / plumbing code (AI SDK,
Workflow SDK, drizzle) and programmer defects throw. Convert at the seam:
unwrap `Result` with `.match()` in route handlers (-> `Response`) and at
workflow step boundaries (-> throw). Never use `Result` as a workflow step's
return type — class instances lose their prototype across the durable
serialization boundary, and throwing is the framework's intended failure signal.

**Status:** convention adopted; `better-result` is _not yet installed_. Add it
(`pnpm --filter web add better-result`) and define shared `TaggedError` types in
`apps/web/src/lib/errors.ts` when the first such function is written. See the
`better-result-adopt` skill for patterns.

### Outbound external HTTP

When we add a real outbound integration (third-party API, enrichment/embedding
service, webhooks), build a [`fetch-extras`](https://github.com/sindresorhus/fetch-extras)
pipeline rather than hand-rolling `fetch`:

```ts
const apiFetch = pipeline(
  fetch,
  withTimeout(5000),
  withBaseUrl('https://api.example.com'),
  withHeaders({ Authorization: `Bearer ${token}` }),
  withHttpError(),
  withJsonResponse(SomeZodSchema)
)
```

It is throw-based (`HttpError`, `SchemaValidationError`), so it slots _under_
the error-handling convention: the business layer wraps it in
`Result.tryPromise` and maps those throws to a `TaggedError` at the boundary.

**Status:** not installed, and not needed yet — current external I/O all goes
through SDKs (AI SDK, Workflow SDK, drizzle). Adopt when the first direct
external client appears.

### Database

Drizzle ORM with a runtime-selected driver in `packages/db/src/client.ts`:

- **Local** — pglite with the pgvector extension; the data dir is created and
  migrations are applied automatically on first `getDb()`.
- **Production** — Neon serverless when `DATABASE_URL` is set.

Memories are stored with a `vector(1536)` embedding (`EMBEDDING_DIMENSIONS`) and
an HNSW cosine index (`memories_embedding_idx`) for similarity search.

## Build & validation

- Toolchain is Vite+ (`vp`); `routeTree.gen.ts` is generated by the TanStack
  Router plugin (auto-updates while the web dev server runs).
- Validate web changes with `pnpm --filter web check` (not root `vp check`).
- Run tests with `vp test`.
- Do not modify `.agents/skills/` files.
