# Documentation

This project is a **Three.js-based web game engine** built on React Three Fiber (R3F),
Vite, and TypeScript. These docs are the source of truth for how the engine is structured
and how to extend it.

## Index

| Doc | What's inside |
|---|---|
| [getting-started.md](./getting-started.md) | Prerequisites, install, dev/build scripts, env vars, project layout |
| [architecture.md](./architecture.md) | The engine model: how `main → App → Scene → objects → materials` fit together, the render loop, and the post-processing pipeline |
| [conventions.md](./conventions.md) | Coding patterns for materials, objects, shaders, animation, and assets |
| [engine/materials.md](./engine/materials.md) | Catalog of every reusable `ShaderMaterial` and how to author a new one |
| [engine/objects.md](./engine/objects.md) | Catalog of every scene object/entity and how to author a new one |
| [engine/rendering.md](./engine/rendering.md) | Canvas setup, camera/controls, bloom/HDR, gradient background, DebugOverlay |
| [research/](./research/) | Deep-dive effect notes (bloom math, dissolve VFX) that informed the engine |

## The 30-second mental model

```
index.html
  └─ src/main.tsx          React root (StrictMode)
       └─ App.tsx          <Canvas> + Suspense + OrbitControls + EffectComposer(Bloom)
            ├─ GradientBackground          canvas-texture scene background
            ├─ Scene.tsx                   the scene graph (compose objects here)
            │    ├─ <GameObject/>          glTF loader entity
            │    ├─ <GlowOrb/>             multi-layer emissive light source
            │    ├─ <DissolveObject/>      click-to-dissolve cube
            │    └─ … more objects
            └─ DebugOverlay (DOM HUD)      FPS / frame-time / renderer info
```

- **Materials** (`src/materials/`) are reusable GPU programs wrapped as R3F components.
- **Objects** (`src/objects/`) are scene entities that own geometry + a material and animate
  it each frame.
- **Scene** (`src/components/Scene.tsx`) composes objects into a world.
- **App** wires the canvas, camera, controls, and the bloom post-processing pass.

Start with [architecture.md](./architecture.md) for the full picture, or
[conventions.md](./conventions.md) if you just want to add an effect.
