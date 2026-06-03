# Rendering Pipeline

How frames are produced: canvas setup, camera/controls, background, post-processing (bloom),
and the debug HUD. All wired in [`App.tsx`](../../src/App.tsx).

## Canvas & camera

```tsx
<Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
```

The `<Canvas>` owns the WebGL renderer, the default scene/camera, and the R3F render loop.
`OrbitControls` (drei) provides orbit/zoom/pan camera input.

## Scene background

[`GradientBackground`](../../src/objects/GradientBackground/GradientBackground.tsx) draws a
gradient onto a 2D canvas, wraps it in a `CanvasTexture` (sRGB), and assigns it to
`scene.background`. It re-renders on resize and supports radial + linear styles. It's a
sibling of `Scene` inside the canvas and renders no mesh.

## Post-processing — Bloom

```tsx
<EffectComposer>
  <Bloom
    intensity={0.75}
    luminanceThreshold={1.0}   // only fragments brighter than 1.0 bloom
    luminanceSmoothing={0.1}
    radius={0.5}
    mipmapBlur
  />
</EffectComposer>
```

Key point: **the threshold is HDR (1.0)**. Standard LDR colors (≤ 1.0) won't bloom — an effect
must push its output past 1.0 to glow. The engine does this three ways:

1. **Additive glow materials** (`GlowMaterial`, `AuraMaterial`, `GlowShellMaterial`,
   `GlowOrb`'s billboard) accumulate brightness past 1.0.
2. **Emissive standard materials** with `emissiveIntensity > 1` (`EmissiveCube`,
   `GameObject`'s `emissiveBoost`, default 4.0).
3. **HDR uniform colors** in custom shaders (e.g. a dissolve burn color > 1.0).

### Why these exact numbers

The relationship between sRGB color, linear luminance, and the bloom threshold is worked out
in the research notes:

- [research/bloom-math-reference.md](../research/bloom-math-reference.md) — sRGB↔linear,
  luminance, threshold math.
- [research/bloom_explanation.md](../research/bloom_explanation.md) — why a near-white cube
  blooms.
- [research/bloom-uniform-intensity-investigation.md](../research/bloom-uniform-intensity-investigation.md)
  — getting consistent bloom across different hues.

### Selective bloom (alternative)

`App.tsx` keeps a commented-out recipe for `SelectiveBloom` (bloom only specific meshes via
`selection` refs). Switch to it when you want, e.g., the dissolve edge to glow but not the
whole scene. This is also how the Codrops dissolve demo isolates its glow — see the dissolve
research notes.

## Lighting model

The demo leans on emissive/glow rather than heavy scene lighting:

- `Environment preset="apartment"` (drei) provides image-based ambient reflection.
- `GlowOrb`/`GlowSphere` embed a pulsing `pointLight` that actually illuminates nearby
  surfaces (the floor receives its spill).
- Shadows: meshes opt in with `castShadow`/`receiveShadow`.

## Debug HUD

[`DebugOverlay`](../../src/components/DebugOverlay/index.tsx) is a **DOM** element (sibling of
`<Canvas>`, not inside it). Its own `requestAnimationFrame` loop samples FPS, frame time, and
JS heap every 500 ms; when passed a `renderer`, it also shows draw calls / triangles /
geometries / textures from `renderer.info`. FPS is color-coded (green ≥ 55, amber ≥ 30, red
below).

> Currently mounted as `<DebugOverlay />` with no `renderer` prop, so the RENDERER section is
> hidden. To enable it, capture the renderer (`useThree(s => s.gl)` inside a canvas child) and
> pass it down.

## Frame budget tips

- Mutate uniforms in `useFrame`; never trigger React re-renders for animation.
- Allocate geometries/typed-arrays once; update attribute `.needsUpdate` flags in place.
- Clamp `delta` for CPU simulations to avoid spiral-of-death after a stalled tab.
- Keep additive/transparent layers `depthWrite={false}` and ordered after opaque bodies.
