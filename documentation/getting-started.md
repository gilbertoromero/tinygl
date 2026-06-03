# Getting Started

## Prerequisites

- **Node** ≥ 18
- **pnpm** ≥ 8 (this repo pins `pnpm@8.15.0` via `packageManager`)

## Install

```bash
pnpm install
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the Vite dev server with HMR |
| `pnpm start` | Same as `dev` but on port `3000` |
| `pnpm build` | `tsc` typecheck **then** `vite build` → `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm lint` | ESLint over `ts,tsx` with `--max-warnings 0` |
| `pnpm format` | Prettier over `src/**/*.{ts,tsx,css,glsl,vert,frag}` |

> TypeScript is `strict` with `noUnusedLocals` and `noUnusedParameters`. A leftover import or
> param will **fail `pnpm build`**. Run `npx tsc --noEmit` for a fast typecheck.

## Environment variables

Env access goes through [`config/env.ts`](../config/env.ts), which validates
`import.meta.env` with zod and supplies defaults:

| Var | Default | Notes |
|---|---|---|
| `VITE_API_URL` | `https://api.example.com/v1` | Base URL for `ApiClient` |
| `VITE_ENVIRONMENT` | from Vite `MODE` | `development` \| `production` \| `test` |

Add a `.env` (Vite convention: vars must be prefixed `VITE_`) to override. Invalid values
throw at startup with a formatted error — fail fast, by design.

## Tooling config

- **Vite** — [`vite.config.ts`](../vite.config.ts): React plugin, `vite-plugin-glsl` (lets you
  `import` `.vert`/`.frag`/`.glsl` as strings), and the `@` → `src/` alias.
- **TypeScript** — [`tsconfig.json`](../tsconfig.json): bundler module resolution,
  `react-jsx`, strict, path alias `@/*`.
- **ESLint** — [`.eslintrc.cjs`](../.eslintrc.cjs): TS + react-hooks + prettier recommended.
- **Prettier** — [`.prettierrc`](../.prettierrc): single quotes, semicolons, trailing commas
  (`all`), `printWidth` 100, 2-space tabs.

## First run

```bash
pnpm install
pnpm dev
```

Open the URL Vite prints. You'll see the demo scene (gradient background, a glTF lightsaber,
a glowing orb, emissive cubes, and a clickable dissolve cube) plus a performance HUD in the
top-left. Edit [`src/components/Scene.tsx`](../src/components/Scene.tsx) to add or remove
objects — HMR updates instantly.

## Project layout

See the layout tree in [`../CLAUDE.md`](../CLAUDE.md#project-layout) or the deeper breakdown
in [architecture.md](./architecture.md).
