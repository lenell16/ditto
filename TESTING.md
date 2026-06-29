# Testing

This document is a living guide for how we verify that the app works. "Testing"
here means more than automated tests: it includes type checks, linting, schema
validation, focused smoke checks, browser checks, and manual verification when
automation would add more cost than confidence.

The goal is not to test everything through every layer. The goal is to choose
the smallest proof that would catch the bug we are worried about.

## Current State

The repo has the test runner, baseline foundation tests, and UI test
dependencies installed.

- Root `vp run -r test` runs the current test suite through package scripts so
  each package's Vite config is respected.
- `apps/web` has `vitest`, `jsdom`, and Testing Library dependencies.
- There is no Playwright config, Storybook setup, or CI workflow yet.
- Use package checks for static verification:

```bash
vp run --filter web check
```

Package-level checks are also available:

```bash
vp run --filter ext check
vp run --filter @workspace/db check
vp run --filter @workspace/ui check
```

Use recursive package tests for the current automated suite:

```bash
vp run -r test
```

## Verification Philosophy

For each feature, decide what the feature needs to prove before building too
much test infrastructure around it.

Use tests when they give durable confidence. Use static analysis and stronger
types when they can remove an entire class of mistakes. Use manual checks when
the behavior is still exploratory or when the cost of automation is higher than
the value of preserving the flow.

Prefer this shape:

- Unit tests for pure logic, parsing, protocol guards, validation, and prompt or
  workflow decision logic.
- Integration tests for database behavior, auth/session behavior, server
  functions, and API routes.
- Component tests for important UI states: loading, empty, error,
  authenticated, and unauthenticated.
- Browser/e2e tests only for cross-surface flows where the browser is the
  behavior: route protection, extension-to-web communication, and durable chat.
- Static verification for things TypeScript, Zod, Drizzle constraints,
  exhaustive switches, and shared types can prevent better than a runtime test.

Do not prove every feature through the browser. A protected user page might need
a data integration test, a component state test, and one route-auth smoke test,
not a full e2e test for every data variation.

## Feature Testing Conversation

Before or while building a meaningful feature, answer these questions briefly:

- What behavior is the user relying on?
- What can break in this change?
- Which part is pure enough for a unit test?
- Which part needs a database, auth session, route handler, or browser?
- What will we not test yet, and why?
- Which command proves the work is good enough for now?

This is intentionally lightweight. The answer can be a few sentences in the
implementation notes or PR description. It should make the chosen verification
explicit so future agents know what confidence exists and what is still manual.

## Agent Verification Loop

When an agent builds or changes behavior, use this loop:

1. Identify the smallest proof that could fail for the change.
2. Run the focused command for that proof.
3. Fix the smallest failing unit of behavior.
4. Re-run the focused command.
5. Broaden only when the behavior crosses a boundary, such as UI to server,
   server to database, web app to extension, or app to workflow runtime.
6. Finish with the relevant static check, usually `vp run --filter web check` for
   web changes.

Avoid starting with the broadest browser test. It is slower, noisier, and often
points at the symptom instead of the broken unit.

Default command order:

1. Focused test command for the file or package being changed.
2. Package check, such as `vp run --filter web check`.
3. Recursive package tests with `vp run -r test`.
4. Browser/e2e smoke only when the changed behavior crosses browser, auth,
   database, extension, or workflow boundaries.

## Auth And Database

Auth and database tests need explicit isolation.

`packages/db/src/client.ts` keeps a singleton database connection. Local
development uses pglite when `DATABASE_URL` is not set, and migrations run on
first `getDb()`. Future integration tests should use an isolated pglite data
directory per test run and call `closeDb()` during teardown.

For auth tests:

- Do not make every protected-page test depend on Google or another OAuth
  provider.
- Keep one boundary test for the real auth mechanism we depend on.
- For most authenticated feature tests, create a test user/session directly or
  sign in with Better Auth email-password through a helper.
- Treat bearer-token auth for the extension as its own path. The extension flow
  and the web cookie flow should both have coverage when those surfaces become
  critical.
- Use `apps/web/src/routes/api/embed/whoami.ts` as a natural boundary check for
  bearer-authenticated embed requests.

The seed script currently seeds memories and resets schema data. Do not rely on
it mid-suite for auth tests unless the test also recreates the users and
sessions it needs.

## Current Surfaces To Protect

These are the setup pieces most likely to matter as the app grows:

- `apps/web/src/routes/__root.tsx`: redirects unauthenticated non-embed users to
  `/login`.
- `apps/web/src/lib/auth.ts`: Better Auth config, Drizzle adapter, bearer plugin,
  and TanStack Start cookies.
- `apps/web/src/server/auth.ts`: server function for reading the current
  session.
- `apps/web/src/server/memories.ts`: server function reading memories from the
  database.
- `packages/db/src/client.ts`: pglite/Neon driver switch, migrations, and
  connection teardown.
- `apps/web/src/routes/api/embed/whoami.ts`: cheap embed auth status endpoint.
- `apps/ext/src/lib/embed-host.ts` and `apps/web/src/lib/embed/*`: extension to
  web message protocol and bearer token bridge.
- `apps/web/src/lib/ai.ts` and `apps/web/src/routes/api/chat.ts`: AI provider
  selection and streaming route.
- `apps/web/src/workflows/*`: durable chat workflows and hook-driven resume
  behavior.

## Baseline Tests Added

The first foundation tests now protect the setup work that is already acting
like a contract:

1. Embed protocol unit tests
   - File: `packages/embed-protocol/src/index.test.ts`.
   - Proves protocol factories create the expected message shapes.
   - Proves host/embed guards accept valid messages and reject malformed or
     wrong-direction messages.

2. Database integration smoke test
   - File: `packages/db/src/client.test.ts`.
   - Proves pglite starts with an isolated data directory.
   - Proves migrations apply, vector-backed memory inserts work, and `closeDb()`
     allows the database to reopen cleanly.

3. Better Auth and embed identity boundary tests
   - File: `apps/web/src/lib/create-auth.test.ts`.
   - Proves Better Auth can create authenticated headers for a saved user
     against the shared Drizzle auth config.
   - Proves bearer authorization headers resolve to the expected session.
   - Proves the embed `whoami` payload returns anonymous and
     bearer-authenticated states correctly.

These are intentionally not broad browser tests. They protect the protocol,
database, and auth boundaries where regressions would otherwise be expensive to
debug later.

## Next Tests To Consider

Add these when the related behavior becomes real product surface:

- Component tests for meaningful UI states once the UI stabilizes. Prefer mocked
  data unless the component's purpose is to prove a route or auth boundary.
- AI provider configuration and request-shaping tests without making live model
  calls.
- Workflow tests once durable chat behavior is stable enough to preserve.
- Browser/e2e smoke tests for critical cross-surface flows, such as sign-in,
  protected navigation, extension-to-web communication, and a durable chat happy
  path.

Do not spend much time testing now:

- Template UI that will be replaced soon.
- Every page through browser automation.
- Google or other OAuth provider flows on every authenticated feature.
- Live AI responses, model quality, or provider availability in regular tests.

## Delayed Decisions

These tools are useful, but they should be added when a feature creates a clear
need:

- Playwright or another browser runner for stable cross-surface flows.
- Storybook for a growing set of reusable UI states.
- CI once there is at least one passing test suite and a settled command list.

## Verification Notes Template

Use this short template for future features:

```md
### Verification

- Behavior:
- Risks:
- Automated proof:
- Static proof:
- Manual proof:
- Not tested yet:
- Command:
```
