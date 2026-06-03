# Architecture

This project is structured as a small **web game engine** on top of React Three Fiber. The
key idea: declarative React components describe a Three.js scene graph, while a handful of
layered abstractions (materials, objects, scene, pipeline) keep effects reusable.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│ index.html → main.tsx (React root, StrictMode)               │
├─────────────────────────────────────────────────────────────┤
│ App.tsx                                                       │
│   <Canvas> (camera, WebGL renderer)                          │
│     GradientBackground   (scene.background canvas texture)   │
│     <Suspense> → Scene   (async asset loading boundary)      │
│     OrbitControls        (camera input)                      │
│     EffectComposer → Bloom  (post-processing)               │
│   DebugOverlay           (DOM HUD, sibling of Canvas)        │
├─────────────────────────────────────────────────────────────┤
│ components/Scene.tsx — the world: composes Objects           │
├─────────────────────────────────────────────────────────────┤
│ objects/* — scene entities (geometry + material + behavior)  │
├─────────────────────────────────────────────────────────────┤
│ materials/* — reusable ShaderMaterial wrappers (GPU effects) │
├─────────────────────────────────────────────────────────────┤
│ shaders/*  textures/*  models/*  — GPU + asset resources     │
└─────────────────────────────────────────────────────────────┘
```

### 1. Entry — `main.tsx` / `App.tsx`

[`main.tsx`](../src/main.tsx) mounts `<App/>` in `React.StrictMode`.
[`App.tsx`](../src/App.tsx) is the engine shell:

- Creates the `<Canvas camera={{ position: [0,0,5], fov: 75 }}>` (the WebGL renderer + render
  loop live here).
- Wraps the scene in `<Suspense fallback={null}>` so objects that load textures/models can
  suspend without crashing.
- Adds `OrbitControls` for camera input.
- Mounts the post-processing chain: `<EffectComposer><Bloom .../></EffectComposer>`.
- Renders `GradientBackground` (sets `scene.background`) and the DOM-side `DebugOverlay`.

### 2. Scene — `components/Scene.tsx`

[`Scene.tsx`](../src/components/Scene.tsx) is **the world definition**. It's where you place
lights, the floor, and object instances. Think of it as the level/scene graph. To build a new
level, compose objects here (or create a new Scene component and swap it in `App.tsx`).

### 3. Objects — `src/objects/`

Each object is a self-contained **scene entity**: a React component that owns a mesh (geometry
+ material) and any per-frame behavior. Objects are the engine's "game entities" — a glowing
orb, a particle emitter, a dissolving cube, a glTF model loader. They:

- Default-export a `React.FC<Props>` from a folder named after the component.
- Accept `position` and effect-specific props with sensible defaults.
- Drive animation in `useFrame` by mutating uniforms through a `materialRef`.

Catalog: [engine/objects.md](./engine/objects.md).

### 4. Materials — `src/materials/`

Each material wraps a GLSL `ShaderMaterial` as a `forwardRef` React component. Materials are
the reusable **GPU effect** layer — glow, aura, pulse, noise, dissolve. They are decoupled
from geometry, so any object can apply any material. The `forwardRef` lets the owning object
reach in and animate uniforms each frame.

Catalog + authoring guide: [engine/materials.md](./engine/materials.md).

### 5. Resources — shaders / textures / models / api

- `src/shaders/` — shared standalone GLSL snippets (`basic.vert/frag`).
- `src/textures/` — image assets; `textures/noise/` holds noise maps for dissolve/FBM effects.
- `src/models/` — `.glb` files, imported with `?url` and loaded via `useGLTF`.
- `src/api/` — an optional backend layer: `ApiClient` + zod-validated response schemas.
- `config/env.ts` — zod-validated environment access.

## The render & update loop

R3F runs a single `requestAnimationFrame` loop. Every object that needs animation registers a
`useFrame` callback. The canonical pattern:

```tsx
const materialRef = useRef<THREE.ShaderMaterial>(null);
useFrame((state, delta) => {
  if (!materialRef.current) return;
  materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
});
```

Uniform objects are created **once** (`useMemo(() => ({...}), [])`) and mutated in place — no
per-frame allocations, no React re-renders driving animation. CPU simulations (e.g. the
particle system) clamp `delta` to avoid large steps after a tab-switch.

## Data flow for a typical effect

```
Object props ──► uniforms (created once) ──► <shaderMaterial> ──► GPU
     │                    ▲
     └── useFrame ────────┘   (mutates uniform .value each frame)
```

## Asset loading & Suspense

`useTexture` (drei) and `useGLTF` (drei) suspend while loading. Because `Scene` is rendered
inside `<Suspense>` in `App.tsx`, any object can load assets safely. New objects that load
assets must stay within that boundary (they will, as long as they're children of `Scene`).

## Post-processing

A single `EffectComposer` runs a `Bloom` pass tuned for **HDR thresholding**
(`luminanceThreshold={1.0}`): only fragments brighter than 1.0 bloom. That's why glow/emissive
materials push colors past 1.0 (additive blending, `emissiveIntensity > 1`). Details and the
selective-bloom alternative are in [engine/rendering.md](./engine/rendering.md). The math
behind HDR bloom thresholds is documented in
[research/bloom-math-reference.md](./research/bloom-math-reference.md).

## Extending the engine

| Goal | Where |
|---|---|
| New GPU look (shared across objects) | Add a material → [engine/materials.md](./engine/materials.md) |
| New scene entity | Add an object → [engine/objects.md](./engine/objects.md) |
| New level / world | New `Scene`-style component composed in `App.tsx` |
| New post-process | Add a pass inside `<EffectComposer>` in `App.tsx` |
| Backend data | Extend `ApiClient` + add a zod schema in `src/api/schemas/` |
