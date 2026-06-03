# Objects Catalog

Objects are scene entities — the engine's "game objects." Each is a default-exported
`React.FC<Props>` in `src/objects/<Name>/<Name>.tsx` that owns geometry + a material and
(optionally) animates it in `useFrame`. See [conventions.md](../conventions.md#objects) for
authoring rules.

## Catalog

| Object | Key props | What it is |
|---|---|---|
| **GameObject** | `modelUrl`, `materials[]`, `emissiveBoost`, `...GroupProps` | glTF loader entity. Clones the loaded scene and overrides named materials' color/emissive (boost into HDR for bloom). The generic "load a model" entity. |
| **GlowOrb** | `position`, `color`, `radius`, `haloType` (`billboard`\|`sphere`), `lightIntensity`, `lightDistance`, `shellFalloff`, `solid` | Multi-layer emissive light source: opaque body + glow core + halo (camera-facing billboard *or* `GlowShellMaterial` sphere) + a synced pulsing `pointLight`. |
| **GlowSphere** | `position`, `color`, `radius`, `lightIntensity`, `lightDistance` | Simpler single-sphere glow + point light (subset of `GlowOrb`). |
| **EmissiveCube** | `position`, `size`, `color`, `emissiveColor`, `emissiveIntensity` | `meshStandardMaterial` cube with an emissive map (`gemini_emissive.png`). Standard-material bloom source. |
| **ParticleEmitter** | `count`, `direction`, `spread`, `speed`, `lifetime`, `size`, `color`, `gravity`, `emissive`, `loop`, … | CPU-simulated GPU point-sprite particle system (cone emission, gravity, lifetime fade, staggered init, recycling). Inline shaders + typed-array sim. |
| **DissolveObject** | `position`, `color`, `duration` | Clickable cube using `DissolveMaterial`; click ramps `uProgress` 0→1 over `duration` to dissolve it away. |
| **NoisePlane** | `position` | Plane driven by `NoiseMaterial` (FBM field). |
| **NoisePulse** | `position` | Plane driven by `PulseMaterial`. |
| **NoiseSphere** | `position` | Sphere driven by `PulseMaterial`. |
| **GradientBackground** | `innerColor`, `outerColor`, `style` | Renders a CanvasTexture gradient into `scene.background` (radial/linear variants). Returns `null` (no mesh). |

## Patterns by example

**Time-driven object** (the most common shape — `NoisePlane`, `NoisePulse`, `NoiseSphere`):

```tsx
const materialRef = useRef<THREE.ShaderMaterial>(null);
useFrame((state) => {
  if (materialRef.current) materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
});
return (
  <mesh position={position}>
    <planeGeometry args={[4, 4, 1, 1]} />
    <NoiseMaterial ref={materialRef} />
  </mesh>
);
```

**Event-triggered object** (`DissolveObject`): flip state on `onClick`, ramp a uniform in
`useFrame`.

**Composite object** (`GlowOrb`): a `<group>` of several meshes/lights with multiple refs, all
ticked from one `useFrame` (also makes the billboard face the camera via
`mesh.quaternion.copy(camera.quaternion)`).

**Loader object** (`GameObject`): `useGLTF(modelUrl)`, `scene.clone()` in `useMemo`, then a
`useEffect` traverses meshes to apply a `MatConfig[]` (per-material color/emissive overrides).
Spreads `GroupProps`, so it accepts `position`/`rotation`/`scale` directly.

**Simulation object** (`ParticleEmitter`): one `BufferGeometry` allocated once; per-particle
state in `Float32Array`s mutated each frame; `dt` clamped to `0.05`; dead particles recycled
(or parked at `1e10` when `loop=false`). A good reference for performant CPU-driven effects.

**Side-effect object** (`GradientBackground`): renders `null`, does its work via `useEffect`
against `useThree().scene`, and cleans up (`texture.dispose()`, `scene.background = null`).

## Authoring a new object

1. `src/objects/Foo/Foo.tsx`, default-export `const Foo: React.FC<Props>`.
2. `position?: [number, number, number]` (+ effect props), all defaulted.
3. Own a mesh + material; hold a `materialRef`; animate in `useFrame`.
4. Dispose anything you create imperatively in a `useEffect` cleanup.
5. Drop it into [`Scene.tsx`](../../src/components/Scene.tsx).
6. Add a row to the catalog above.
