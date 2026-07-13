<!-- intent-skills:start -->

# Skill mappings - load `use` with `pnpm dlx @tanstack/intent@latest load <use>`.

skills:

- when: "Install TanStack Devtools, pick framework adapter (React/Vue/Solid/Preact), register plugins via plugins prop, configure shell (position, hotkeys, theme, hideUntilHover, requireUrlFlag, eventBusConfig). TanStackDevtools component, defaultOpen, localStorage persistence."
  use: "@tanstack/devtools#devtools-app-setup"
- when: "Publish plugin to npm and submit to TanStack Devtools Marketplace. PluginMetadata registry format, plugin-registry.ts, pluginImport (importName, type), requires (packageName, minVersion), framework tagging, multi-framework submissions, featured plugins."
  use: "@tanstack/devtools#devtools-marketplace"
- when: "Build devtools panel components that display emitted event data. Listen via EventClient.on(), handle theme (light/dark), use @tanstack/devtools-ui components. Plugin registration (name, render, id, defaultOpen), lifecycle (mount, activate, destroy), max 3 active plugins. Two paths: Solid.js core with devtools-ui for multi-framework support, or framework-specific panels."
  use: "@tanstack/devtools#devtools-plugin-panel"
- when: "Handle devtools in production vs development. removeDevtoolsOnBuild, devDependency vs regular dependency, conditional imports, NoOp plugin variants for tree-shaking, non-Vite production exclusion patterns."
  use: "@tanstack/devtools#devtools-production"
- when: "Two-way event patterns between devtools panel and application. App-to-devtools observation, devtools-to-app commands, time-travel debugging with snapshots and revert. structuredClone for snapshot safety, distinct event suffixes for observation vs commands, serializable payloads only."
  use: "@tanstack/devtools-event-client#devtools-bidirectional"
- when: "Create typed EventClient for a library. Define event maps with typed payloads, pluginId auto-prepend namespacing, emit()/on()/onAll()/onAllPluginEvents() API. Connection lifecycle (5 retries, 300ms), event queuing, enabled/disabled state, SSR fallbacks, singleton pattern. Unique pluginId requirement to avoid event collisions."
  use: "@tanstack/devtools-event-client#devtools-event-client"
- when: "Analyze library codebase for critical architecture and debugging points, add strategic event emissions. Identify middleware boundaries, state transitions, lifecycle hooks. Consolidate events (1 not 15), debounce high-frequency updates, DRY shared payload fields, guard emit() for production. Transparent server/client event bridging."
  use: "@tanstack/devtools-event-client#devtools-instrumentation"
- when: "Configure @tanstack/devtools-vite for source inspection (data-tsd-source, inspectHotkey, ignore patterns), console piping (client-to-server, server-to-client, levels), enhanced logging, server event bus (port, host, HTTPS), production stripping (removeDevtoolsOnBuild), editor integration (launch-editor, custom editor.open). Must be FIRST plugin in Vite config. Vite ^6 || ^7 only."
  use: "@tanstack/devtools-vite#devtools-vite-plugin"
- when: "Step-by-step migration from Next.js App Router to TanStack Start: route definition conversion, API mapping, server function conversion from Server Actions, middleware conversion, data fetching pattern changes."
  use: "@tanstack/react-start#lifecycle/migrate-from-nextjs"
- when: "React bindings for TanStack Start: createStart, StartClient, StartServer, React-specific imports, re-exports from @tanstack/react-router, full project setup with React, useServerFn hook."
  use: "@tanstack/react-start#react-start"
- when: "Implement, review, debug, and refactor TanStack Start React Server Components in React 19 apps. Use when tasks mention @tanstack/react-start/rsc, renderServerComponent, createCompositeComponent, CompositeComponent, renderToReadableStream, createFromReadableStream, createFromFetch, Composite Components, React Flight streams, loader or query owned RSC caching, router.invalidate, structuralSharing: false, selective SSR, stale names like renderRsc or .validator, or migration from Next App Router RSC patterns. Do not use for generic SSR or non-TanStack RSC frameworks except brief comparison."
  use: "@tanstack/react-start#react-start/server-components"
- when: "Framework-agnostic core concepts for TanStack Router: route trees, createRouter, createRoute, createRootRoute, createRootRouteWithContext, addChildren, Register type declaration, route matching, route sorting, file naming conventions. Entry point for all router skills."
  use: "@tanstack/router-core#router-core"
- when: "Route protection with beforeLoad, redirect()/throw redirect(), isRedirect helper, authenticated layout routes (\_authenticated), non-redirect auth (inline login), RBAC with roles and permissions, auth provider integration (Auth0, Clerk, Supabase), router context for auth state."
  use: "@tanstack/router-core#router-core/auth-and-guards"
- when: "Automatic code splitting (autoCodeSplitting), .lazy.tsx convention, createLazyFileRoute, createLazyRoute, lazyRouteComponent, getRouteApi for typed hooks in split files, codeSplitGroupings per-route override, splitBehavior programmatic config, critical vs non-critical properties."
  use: "@tanstack/router-core#router-core/code-splitting"
- when: "Route loader option, loaderDeps for cache keys, staleTime/gcTime/ defaultPreloadStaleTime SWR caching, pendingComponent/pendingMs/ pendingMinMs, errorComponent/onError/onCatch, beforeLoad, router context and createRootRouteWithContext DI pattern, router.invalidate, Await component, deferred data loading with unawaited promises."
  use: "@tanstack/router-core#router-core/data-loading"
- when: "Link component, useNavigate, Navigate component, router.navigate, ToOptions/NavigateOptions/LinkOptions, from/to relative navigation, activeOptions/activeProps, preloading (intent/viewport/render), preloadDelay, navigation blocking (useBlocker, Block), createLink, linkOptions helper, scroll restoration, MatchRoute."
  use: "@tanstack/router-core#router-core/navigation"
- when: "notFound() function, notFoundComponent, defaultNotFoundComponent, notFoundMode (fuzzy/root), errorComponent, CatchBoundary, CatchNotFound, isNotFound, NotFoundRoute (deprecated), route masking (mask option, createRouteMask, unmaskOnReload)."
  use: "@tanstack/router-core#router-core/not-found-and-errors"
- when: "Dynamic path segments ($paramName), splat routes ($ / \_splat), optional params ({-$paramName}), prefix/suffix patterns ({$param}.ext), useParams, params.parse/stringify, pathParamsAllowedCharacters, i18n locale patterns."
  use: "@tanstack/router-core#router-core/path-params"
- when: "validateSearch, search param validation with Zod/Valibot/ArkType adapters, fallback(), search middlewares (retainSearchParams, stripSearchParams), custom serialization (parseSearch, stringifySearch), search param inheritance, loaderDeps for cache keys, reading and writing search params."
  use: "@tanstack/router-core#router-core/search-params"
- when: "Non-streaming and streaming SSR, RouterClient/RouterServer, renderRouterToString/renderRouterToStream, createRequestHandler, defaultRenderHandler/defaultStreamHandler, HeadContent/Scripts components, head route option (meta/links/styles/scripts), ScriptOnce, automatic loader dehydration/hydration, memory history on server, data serialization, document head management."
  use: "@tanstack/router-core#router-core/ssr"
- when: "Full type inference philosophy (never cast, never annotate inferred values), Register module declaration, from narrowing on hooks and Link, strict:false for shared components, getRouteApi for code-split typed access, addChildren with object syntax for TS perf, LinkProps and ValidateLinkOptions type utilities, as const satisfies pattern."
  use: "@tanstack/router-core#router-core/type-safety"
- when: "TanStack Router bundler plugin for route generation and automatic code splitting. Supports Vite, Webpack, Rspack, and esbuild. Configures autoCodeSplitting, routesDirectory, target framework, and code split groupings."
  use: "@tanstack/router-plugin#router-plugin"
- when: "Core overview for TanStack Start: tanstackStart() Vite plugin, getRouter() factory, root route document shell (HeadContent, Scripts, Outlet), client/server entry points, routeTree.gen.ts, tsconfig configuration. Entry point for all Start skills."
  use: "@tanstack/start-client-core#start-core"
- when: "Deploy to Cloudflare Workers, Netlify, Vercel, Node.js/Docker, Bun, Railway. Selective SSR (ssr option per route), SPA mode, static prerendering, ISR with Cache-Control headers, SEO and head management."
  use: "@tanstack/start-client-core#start-core/deployment"
- when: "Isomorphic-by-default principle, environment boundary functions (createServerFn, createServerOnlyFn, createClientOnlyFn, createIsomorphicFn), ClientOnly component, useHydrated hook, import protection, dead code elimination, environment variable safety (VITE\_ prefix, process.env)."
  use: "@tanstack/start-client-core#start-core/execution-model"
- when: "createMiddleware, request middleware (.server only), server function middleware (.client + .server), context passing via next({ context }), sendContext for client-server transfer, global middleware via createStart in src/start.ts, middleware factories, method order enforcement, fetch override precedence."
  use: "@tanstack/start-client-core#start-core/middleware"
- when: "createServerFn (GET/POST), inputValidator (Zod or function), useServerFn hook, server context utilities (getRequest, getRequestHeader, setResponseHeader, setResponseStatus), error handling (throw errors, redirect, notFound), streaming, FormData handling, file organization (.functions.ts, .server.ts)."
  use: "@tanstack/start-client-core#start-core/server-functions"
- when: "Server-side API endpoints using the server property on createFileRoute, HTTP method handlers (GET, POST, PUT, DELETE), createHandlers for per-handler middleware, handler context (request, params, context), request body parsing, response helpers, file naming for API routes."
  use: "@tanstack/start-client-core#start-core/server-routes"
- when: "Server-side runtime for TanStack Start: createStartHandler, request/response utilities (getRequest, setResponseHeader, setCookie, getCookie, useSession), three-phase request handling, AsyncLocalStorage context."
  use: "@tanstack/start-server-core#start-server-core"
- when: "Programmatic route tree building as an alternative to filesystem conventions: rootRoute, index, route, layout, physical, defineVirtualSubtreeConfig. Use with TanStack Router plugin's virtualRouteConfig option."
  use: "@tanstack/virtual-file-routes#virtual-file-routes"
- when: "Load environment variables from a .env file into process.env for Node.js applications. Use when configuring apps with secrets, setting up local development environments, managing API keys and database uRLs, parsing .env file contents, or populating environment variables programmatically. Always use this skill when the user mentions .env, even for simple tasks like \"set up dotenv\" — the skill contains critical gotchas (encrypted keys, variable expansion, command substitution) that prevent common production issues."
  use: "dotenv#dotenv"
- when: "Use dotenvx to run commands with environment variables, manage multiple .env files, expand variables, and encrypt env files for safe commits and CI/CD."
use: "dotenv#dotenvx"
<!-- intent-skills:end -->

<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Prefer Vite+ commands when installing dependencies, running package scripts, or
validating changes: use `vp install`, `vp run <script>`, `vp check`, `vp build`,
and related `vp ...` commands when available. Use Vite+ workspace filtering for
package-scoped work, such as `vp run --filter web check`. For package binaries
you'd normally run with `npx`, `pnpm dlx`, or `pnpm exec`, use `vpx`, `vp dlx`,
or `vp exec` instead — see https://viteplus.dev/guide/vpx.

In this monorepo, run tests through package scripts so each package's own Vite
config is respected: use `vp run -r test` for the full suite and
`vp run --filter <package> test` for package-scoped tests. Package `test`
scripts may call `vp test`, but avoid root `vp test` for the monorepo suite
because it runs one Vitest process from the root config.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## TanStack Router route tree (`apps/web`)

`routeTree.gen.ts` is generated by the TanStack Router Vite plugin. When the dev server is already running (`vp run --filter web dev`), adding or renaming files under `apps/web/src/routes/` updates the route tree automatically — do not run a separate generate step in that case.

If the dev server is not running, start it to regenerate the tree while testing new routes, or run a build. Commit the updated `routeTree.gen.ts` when it changes.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp run --filter web check` (not root `vp check`) to validate web app changes;
- [ ] Run `vp run -r test` to run tests.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

## Browser Verification

For UI or route changes in `apps/web`, use the **`browser-verification`** project
skill — it extends **`browser-verification-workflow`** with Ditto dev setup
(Portless, `memoria.localhost`, `vp check`/`test`). For other browser work in
this repo, use **`browser-verification-workflow`**. Surface choice is
**runtime-native first**: Cursor Cloud Computer Use, Codex in-app Browser,
Playwright CLI for isolated/repeated/trace-heavy work, Chrome for the user's
real browser identity, and Agent Browser only for portable CLI/headed recording
or when no native surface exists. For polished videos, use **`demo-making`**
(RecordScreen on Cursor Cloud; Agent Browser on local/CLI). See those skills for
state reuse vs clean login, evidence capture, and reporting.

<!--VITE PLUS END-->

<!--ERROR HANDLING START-->

## Error handling

For new business-logic functions whose failure is part of the contract
(not-found, validation, conflict, quota, etc.), return `Result<T, E>` from
`better-result` with `TaggedError` types instead of throwing. Let library /
plumbing code (AI SDK, Workflow SDK) and programmer defects throw. Convert at
the seam: unwrap `Result` with `.match()` in route handlers (→ `Response`) and
at workflow step boundaries (→ throw). Never use `Result` as a workflow step's
return type. See the `better-result-adopt` skill for patterns, and
`ARCHITECTURE.md` for the stack, layering, and rationale behind these
conventions (including outbound HTTP via `fetch-extras`).

<!--ERROR HANDLING END-->

<!-- DEPENDENCY LOOKUPS START -->

## Looking up dependency behavior

When you need a dependency's implementation details or the exact API of the
installed version (precise export names/signatures), prefer in order:

1. Available doc/reference skills, then the library's official docs / `llms.txt`.
2. `opensrc path <pkg>` (auto-resolves the version from `pnpm-lock.yaml`), then
   `rg`/read the cached source — readable implementation at the right version.
3. As a last resort, read a published `.d.ts` type entry directly.

Do not grep minified `dist` bundles or sourcemaps under `node_modules` to learn
an API — it is slow and unreliable. (Markdown docs vendored in `node_modules`,
e.g. `node_modules/vite-plus/docs`, are fine to read.)

<!-- DEPENDENCY LOOKUPS END -->

## Cursor Cloud specific instructions

Environment-specific caveats for agents running in Cursor Cloud VMs. The startup
update script runs `pnpm install --ignore-scripts` (deps are already installed
and cached in the snapshot). Standard build/lint/test/run commands live in the
Vite+ section above, `TESTING.md`, and the `browser-verification` skill — use
those; the notes below only cover non-obvious gotchas.

- **Getting `vp` on PATH.** The global `vp` CLI is installed but only added to
  login shells. In a fresh non-interactive shell, run `. "$HOME/.vite-plus/env"`
  first, or invoke the workspace-local binary via `pnpm exec vp …` (same for
  `pnpm exec portless …`).

- **Do not run plain `pnpm install` / `vp install`.** Their `prepare` hook runs
  `vp config`, which rewrites `AGENTS.md` (stripping repo-specific sections) and
  dirties the tree. Use `pnpm install --ignore-scripts`. Skipping scripts loses
  nothing here: the git hooks path is already managed, and the only unapproved
  build scripts (esbuild/swc/msw/etc.) are not needed to build, test, or run.

- **Start the Portless proxy before the web dev server, on an unprivileged
  port** (avoids the `sudo`/`:443` prompt that hangs a non-TTY shell):
  `pnpm exec portless proxy start -p 1355`, then `vp run --filter web dev`. The
  app is served at `https://memoria.localhost:1355` (`portless get memoria`).
  See the `browser-verification` skill for the full flow and more gotchas.

- **HTTPS cert trust (needed for browser testing).** The Portless CA
  (`~/.portless/ca.pem`) has been added to the system trust store and to
  Chrome's NSS store (`~/.pki/nssdb`), so `curl` and the desktop Chrome trust
  `memoria.localhost` without warnings. If Portless regenerates its CA (e.g.
  `~/.portless` is recreated), re-trust it:
  `sudo cp ~/.portless/ca.pem /usr/local/share/ca-certificates/portless-ca.crt && sudo update-ca-certificates`
  and `certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n portless-ca -i ~/.portless/ca.pem`.

- **pglite is single-process — seed before starting the dev server.** Local dev
  uses embedded pglite (`apps/web/.data/pglite`), which only one process may hold
  open. `vp run --filter web seed:dev-user` writes to that dir in a separate
  process; a dev server that is already running will NOT see the new user until
  restarted. So run the seed before `vp dev`, restart the dev server after
  seeding, or just create the account via the login page's "Create one" link
  (dev creds: `agent@memoria.local` / `local-dev-password`).

- **AI chat provider.** The AI chat routes are driven by `AI_GATEWAY_API_KEY`,
  which is provisioned as an environment secret (auto-injected each session), so
  chat works out of the box — nothing to request or configure. Provider is
  selected by `AI_PROVIDER` (default `gateway`); `ANTHROPIC_API_KEY` /
  `OPENAI_API_KEY` are the alternatives. See `apps/web/src/lib/ai.ts`. Auth,
  memories, SSR, and the demo routes (forms, data grid) need no secrets. Leave
  `DATABASE_URL` unset to use local pglite.
