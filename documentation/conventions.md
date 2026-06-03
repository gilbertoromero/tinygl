# Conventions

Patterns every contributor (human or AI) should follow. They keep materials reusable and
objects predictable. When in doubt, mirror the closest existing file.

## Materials

A material is a thin React wrapper around a Three.js `ShaderMaterial`.

```tsx
import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';
import vertexShader from './glow.vert';
import fragmentShader from './glow.frag';

interface GlowMaterialProps {
  color?: THREE.ColorRepresentation;
  intensity?: number;
}

const GlowMaterial = forwardRef<THREE.ShaderMaterial, GlowMaterialProps>(
  ({ color = '#00aaff', intensity = 1.5 }, ref) => {
    const uniforms = useMemo(
      () => ({
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uTime: { value: 0 },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );

    return (
      <shaderMaterial
        ref={ref}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    );
  },
);

GlowMaterial.displayName = 'GlowMaterial';
export default GlowMaterial;
```

Rules:

- **`forwardRef<THREE.ShaderMaterial, Props>`** — always forward the ref so the owning object
  can animate uniforms.
- **Build `uniforms` once** with `useMemo(() => ({...}), [])`. The empty dependency array is
  intentional (and the lint disable is expected): uniform *values* are mutated through the
  ref or via `useEffect`, never by recreating the object. Recreating uniforms each render
  would thrash the GPU program.
- **Set `displayName`** for the forwardRef component.
- **Additive glow materials** set `transparent`, `depthWrite={false}`, and
  `blending={THREE.AdditiveBlending}`; pick `side` deliberately (`FrontSide` for a surface
  glow, `DoubleSide`/`BackSide` for shells/auras).
- **Shaders** live next to the material as `<name>.vert` / `<name>.frag`, imported via
  `vite-plugin-glsl`. Uniform names are `uCamelCase` (`uTime`, `uColor`, `uProgress`).

See the full catalog in [engine/materials.md](./engine/materials.md).

## Objects

An object is a scene entity that owns geometry, applies a material, and animates it.

```tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import NoiseMaterial from '../../materials/NoiseMaterial/NoiseMaterial';

interface Props {
  position?: [number, number, number];
}

const NoisePlane: React.FC<Props> = ({ position = [0, 0, 0] }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position}>
      <planeGeometry args={[4, 4, 1, 1]} />
      <NoiseMaterial ref={materialRef} />
    </mesh>
  );
};

export default NoisePlane;
```

Rules:

- **Default-export** a `React.FC<Props>` from a folder named after the component
  (`objects/NoisePlane/NoisePlane.tsx`).
- **Vectors are tuples**: `position?: [number, number, number]`, with a default.
- **Hold a `materialRef`** and drive time/animation uniforms in `useFrame`.
- **Defaults everywhere** — every prop has a sensible default so an object can be dropped into
  a scene with zero config.

See the full catalog in [engine/objects.md](./engine/objects.md).

## Animation

- **Never** animate uniforms via React `useState` in a render loop. Mutate
  `ref.current.uniforms.<name>.value` inside `useFrame`.
- For event-triggered animations (e.g. dissolve on click), flip a boolean state on the event,
  then ramp the uniform toward its target inside `useFrame`:
  ```tsx
  const [active, setActive] = useState(false);
  useFrame((_, delta) => {
    if (!active || !matRef.current) return;
    const u = matRef.current.uniforms.uProgress;
    u.value = Math.min(u.value + delta / duration, 1.0);
  });
  // ...<mesh onClick={() => setActive(true)}>
  ```
- **Clamp `delta`** for CPU-side simulations: `const dt = Math.min(delta, 0.05);` (prevents a
  huge step after the tab regains focus — see `ParticleEmitter`).

## Shaders

- One-off, trivial shaders may be inlined as tagged template literals: `` const vert = /* glsl */ `...`; ``
  (the comment enables GLSL syntax highlighting). Used by `GlowOrb` (billboard halo) and
  `ParticleEmitter`.
- Anything reused or non-trivial gets its own `.vert`/`.frag` files next to the material.
- Module declarations for `*.glsl`/`*.vert`/`*.frag` live in
  [`src/vite-env.d.ts`](../src/vite-env.d.ts).

## Assets

- **Images**: `import url from '.../foo.png'` returns a URL string → load with
  `useTexture(url)` (drei). Set wrapping/colorspace after load if needed
  (`tex.wrapS = tex.wrapT = THREE.RepeatWrapping`).
- **Models**: `import url from '.../foo.glb?url'` → `useGLTF(url)`. Clone the scene before
  mutating (`scene.clone()`), as `GameObject` does.
- **Disposal**: dispose geometries/textures you create imperatively in a `useEffect` cleanup
  (StrictMode runs effects twice in dev — keep cleanup idempotent).

## TypeScript / lint / format

- `strict`, `noUnusedLocals`, `noUnusedParameters` — no dead imports or params.
- Prettier: single quotes, semicolons, trailing commas `all`, width 100, 2-space tabs.
- ESLint `prettier/prettier` is an **error**; `react-hooks/exhaustive-deps` is respected
  except for the intentional empty-deps uniform `useMemo` (disable inline as shown above).

## Env & API

- Read env only via `config/env.ts` (zod-validated, throws on invalid).
- Validate external data with zod schemas in `src/api/schemas/` and parse in `ApiClient`.
