# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## What this project is

A **Three.js-based web game engine**, built as a React + Vite application on top of
**React Three Fiber (R3F)**. The codebase is organized as a small engine: reusable GPU
**materials**, self-contained scene **objects** (entities), a composable **Scene**, and a
post-processing render pipeline. The goal is a reusable foundation for browser games and
interactive 3D experiences — not a one-off demo.

Full documentation lives in [`documentation/`](./documentation/README.md). Read it before
making structural changes.

## Tech stack

| Concern | Choice |
|---|---|
| Build / dev server | Vite 5 (`vite-plugin-glsl` for `.vert`/`.frag`/`.glsl` imports) |
| UI / runtime | React 18 (StrictMode) + TypeScript 5 (strict) |
| 3D | three `0.160`, `@react-three/fiber` 8, `@react-three/drei` 9 |
| Post-processing | `@react-three/postprocessing` + `postprocessing` 6 |
| Validation | `zod` (env + API schemas) |
| Package manager | **pnpm** (≥ 8), Node ≥ 18 |

## Commands

```bash
pnpm install          # install deps
pnpm dev              # vite dev server
pnpm start            # dev server on port 3000
pnpm build            # tsc typecheck + vite build
pnpm preview          # serve the production build
pnpm lint             # eslint (max-warnings 0)
pnpm format           # prettier over src
```

Always run `pnpm build` (or `npx tsc --noEmit`) after non-trivial changes — TypeScript is
`strict` with `noUnusedLocals`/`noUnusedParameters`, so unused imports fail the build.

## Project layout

```
src/
  main.tsx              # React root (StrictMode)
  App.tsx               # <Canvas>, Suspense, OrbitControls, EffectComposer/Bloom
  components/
    Scene.tsx           # the scene graph — compose objects here
    DebugOverlay/       # FPS / frame-time / renderer-info HUD (DOM, outside Canvas)
  materials/            # reusable ShaderMaterial wrappers (one folder each)
    <Name>Material/
      <Name>Material.tsx
      <name>.vert / <name>.frag
  objects/              # scene entities (one folder each)
    <Name>/<Name>.tsx
  shaders/              # shared standalone shader snippets (basic.vert/frag)
  textures/             # image assets (+ textures/noise/ for dissolve/noise maps)
  models/               # .glb assets (imported with ?url)
  api/                  # ApiClient + zod schemas (optional backend layer)
  vite-env.d.ts         # module decls for *.glsl/*.vert/*.frag
config/
  env.ts                # zod-validated import.meta.env access
documentation/          # all project docs (this is the source of truth)
```

## Core conventions (follow these when adding code)

**Materials** — a material is a `forwardRef<THREE.ShaderMaterial, Props>` component that:
- imports its `.vert`/`.frag` via `vite-plugin-glsl`,
- builds `uniforms` once with `useMemo(() => ({...}), [])` (intentionally empty deps —
  values are mutated through the ref, not recreated),
- forwards the ref to `<shaderMaterial>` so a parent can animate uniforms.
- Additive/transparent glow materials set `transparent`, `depthWrite={false}`,
  `blending={THREE.AdditiveBlending}`.

See [`documentation/engine/materials.md`](./documentation/engine/materials.md).

**Objects** — a scene entity is a `React.FC<Props>` default export in its own folder. It owns
a mesh + material, holds a `materialRef`, and drives time-based uniforms inside `useFrame`
(e.g. `materialRef.current.uniforms.uTime.value = clock.elapsedTime`). Props default to sane
values and use `[number, number, number]` tuples for vectors.

See [`documentation/engine/objects.md`](./documentation/engine/objects.md).

**Animation** — never animate uniforms via React state per frame. Mutate
`ref.current.uniforms.*.value` inside `useFrame`. Clamp `delta` for CPU sims (the
ParticleEmitter caps `dt` at 0.05 to survive tab-switches).

**Shaders** — small one-off shaders may be inlined as `` /* glsl */ `...` `` template
strings (see `GlowOrb`, `ParticleEmitter`); anything reused gets its own `.vert`/`.frag`
files next to the material.

**Assets** — `import url from '.../foo.png'` yields a URL string; load it with drei's
`useTexture`. `.glb` models are imported with `?url` and loaded via `useGLTF`. Texture/model
loading suspends, so keep objects under the `<Suspense>` boundary in `App.tsx`.

**Env / API** — read env vars only through `config/env.ts` (zod-validated). API responses are
parsed with zod schemas in `src/api/schemas/`.

## Formatting / lint

Prettier: single quotes, semicolons, trailing commas (`all`), `printWidth` 100, 2-space tabs.
ESLint extends the TS + react-hooks + prettier recommended sets; `prettier/prettier` is an
error. Match the surrounding file's style.

## Gotchas

- React **StrictMode** double-invokes effects in dev — make `useEffect` cleanup idempotent
  (objects already dispose geometries/textures on unmount).
- `DebugOverlay` lives in the DOM **outside** `<Canvas>`; it currently renders without a
  `renderer` prop, so renderer-info rows are hidden until one is passed.
- The `@` alias (`@/*` → `src/*`) is configured in both `vite.config.ts` and `tsconfig.json`,
  but most existing imports use relative paths — match the file you're editing.
- Commit/push only when asked. Branch off `main` first if you do.

## Where to look first

- New visual effect? → study an existing material+object pair (e.g. `NoiseMaterial` +
  `NoisePlane`, or `DissolveMaterial` + `DissolveObject`) and mirror the pattern.
- Rendering / bloom questions? → [`documentation/engine/rendering.md`](./documentation/engine/rendering.md)
  and the bloom notes in [`documentation/research/`](./documentation/research/).
- Effect deep-dives / research? → [`documentation/research/`](./documentation/research/).
