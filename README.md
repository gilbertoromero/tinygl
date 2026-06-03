# tinygl

A **Three.js-based web game engine**, built as a React + Vite application on top of
[React Three Fiber](https://docs.pmnd.rs/react-three-fiber) (R3F). It's organized as a small
engine — reusable GPU **materials**, self-contained scene **objects**, a composable
**Scene**, and a post-processing render pipeline — meant as a reusable foundation for browser
games and interactive 3D experiences, not a one-off demo.

## Features

- 🎨 **Reusable shader materials** — `ShaderMaterial` wrappers with GLSL imported via
  `vite-plugin-glsl` (noise, dissolve, glow/aura, pulse).
- 🧩 **Self-contained scene objects** — entities that own a mesh + material and animate
  uniforms each frame (glow orbs, particle emitters, dissolve cubes, glTF models).
- ✨ **Post-processing pipeline** — HDR bloom via `@react-three/postprocessing`.
- 🛠️ **Debug HUD** — FPS / frame-time / renderer-info overlay.
- ✅ **Strict TypeScript** + ESLint + Prettier, zod-validated env and API layer.

## Tech stack

| Concern | Choice |
|---|---|
| Build / dev server | Vite 5 (`vite-plugin-glsl` for `.vert`/`.frag`/`.glsl`) |
| UI / runtime | React 18 (StrictMode) + TypeScript 5 (strict) |
| 3D | three `0.160`, `@react-three/fiber` 8, `@react-three/drei` 9 |
| Post-processing | `@react-three/postprocessing` + `postprocessing` 6 |
| Validation | `zod` (env + API schemas) |
| Package manager | **pnpm** (≥ 8), Node ≥ 18 |

## Getting started

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8 (`npm install -g pnpm`)

### Install & run

```bash
pnpm install      # install dependencies
pnpm dev          # start the Vite dev server
```

Then open the URL Vite prints (default `http://localhost:5173`). Use `pnpm start` to run on
port 3000 instead.

## Scripts

```bash
pnpm dev          # vite dev server
pnpm start        # dev server on port 3000
pnpm build        # tsc typecheck + vite production build
pnpm preview      # serve the production build
pnpm lint         # eslint (max-warnings 0)
pnpm format       # prettier over src
```

> Run `pnpm build` (or `npx tsc --noEmit`) after non-trivial changes — TypeScript is `strict`
> with `noUnusedLocals`/`noUnusedParameters`, so unused imports fail the build.

## Project layout

```
src/
  main.tsx            # React root (StrictMode)
  App.tsx             # <Canvas>, Suspense, OrbitControls, EffectComposer/Bloom
  components/
    Scene.tsx         # the scene graph — compose objects here
    DebugOverlay/     # FPS / frame-time / renderer-info HUD (DOM, outside Canvas)
  materials/          # reusable ShaderMaterial wrappers (one folder each)
  objects/            # scene entities (one folder each)
  shaders/            # shared standalone shader snippets
  textures/ models/   # image and .glb assets
  api/                # ApiClient + zod schemas (optional backend layer)
config/
  env.ts              # zod-validated import.meta.env access
documentation/        # full project docs (the source of truth)
```

## Environment variables

Read only through `config/env.ts` (zod-validated). Optional:

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `https://api.example.com/v1` | Backend API base URL |
| `VITE_ENVIRONMENT` | derived from Vite `MODE` | `development` / `production` / `test` |

## Documentation

Full documentation lives in [`documentation/`](./documentation/README.md) — it's the source of
truth for how the engine is structured and how to extend it. Start with
[`architecture.md`](./documentation/architecture.md) for the big picture, or
[`conventions.md`](./documentation/conventions.md) to add an effect.

## Contributing

Issues and pull requests are welcome. Please run `pnpm lint` and `pnpm build` before opening a
PR, and match the conventions documented in
[`documentation/conventions.md`](./documentation/conventions.md).

## License

[MIT](./LICENSE) © Gilberto Romero
