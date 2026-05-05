# shadcn/ui monorepo template

This is a TanStack Start monorepo template with shadcn/ui, Vite+, Turborepo, and portless-ready dev URLs.

## Use with `vp create`

After this repository is on GitHub, scaffold a copy with [Vite+ `vp create`](https://viteplus.dev/guide/create) (the command uses [degit](https://github.com/Rich-Harris/degit) under the hood):

```bash
vp create github:YOUR_GITHUB_USER/YOUR_REPO_NAME
```

To pin a branch (for example this template branch):

```bash
vp create github:YOUR_GITHUB_USER/YOUR_REPO_NAME#chore/vp-template
```

`vp create` writes a new directory named after the repository. The `--directory` flag only applies to built-in templates such as `vite:monorepo`, not to GitHub sources.

Then install and develop:

```bash
cd YOUR_REPO_NAME
pnpm install
pnpm dev
```

Customize the root `package.json` `name`, and under `apps/web` the `portless.name` field (used for `https://<name>.localhost` when using portless).

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from '@workspace/ui/components/button'
```
