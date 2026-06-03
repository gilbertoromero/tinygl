# Materials Catalog

Materials are reusable GPU effects wrapped as `forwardRef<THREE.ShaderMaterial, Props>`
components. Each lives in `src/materials/<Name>Material/` alongside its `.vert`/`.frag`. See
[conventions.md](../conventions.md#materials) for the authoring rules.

## Catalog

| Material | Props | Blending / flags | Purpose |
|---|---|---|---|
| **GlowMaterial** | `color`, `intensity` | additive, `depthWrite=false`, `FrontSide` | Animated fresnel/emissive surface glow. Pairs with `GlowSphere`. |
| **GlowShellMaterial** | `color`, `intensity`, `falloff` | additive, `depthWrite=false` | Outer glow shell rendered slightly larger than the body (rim falloff). Used by `GlowOrb` (`haloType="sphere"`). |
| **AuraMaterial** | `color`, `intensity` | additive, `depthWrite=false`, `DoubleSide` | Soft surrounding aura; double-sided so it reads from inside and out. |
| **PulseMaterial** | `uTime` | — | Time-driven pulsing/noise surface. Drives `NoisePulse`, `NoiseSphere`. |
| **NoiseMaterial** | `uTime` | transparent, `depthWrite=false` | FBM value-noise field with radial edge fade (white-on-transparent). Drives `NoisePlane`. |
| **DissolveMaterial** | `color`, `noiseScale`, `progress` | opaque (`discard`-based) | Dissolve/disintegration — samples a noise texture and `discard`s fragments below `uProgress`. First layer only (no edge band). Drives `DissolveObject`. |

> `uTime`-only materials expect the owning object to set
> `uniforms.uTime.value = clock.elapsedTime` each frame.

## Shared uniform conventions

| Uniform | Meaning |
|---|---|
| `uTime` | Seconds since start (`clock.elapsedTime`) |
| `uColor` | `THREE.Color` tint |
| `uIntensity` | Brightness multiplier (push > 1.0 for HDR bloom) |
| `uProgress` | Normalized effect progress `0 → 1` (dissolve) |
| `uNoiseTex` / `uNoiseScale` | Noise sampler + tiling for texture-driven effects |

## Spotlight: DissolveMaterial

The newest material and a clean reference for a texture-driven effect.

```tsx
// src/materials/DissolveMaterial/DissolveMaterial.tsx
const DissolveMaterial = forwardRef<THREE.ShaderMaterial, Props>(
  ({ color = '#ff6622', noiseScale = 2.0, progress = 0 }, ref) => {
    const noiseTex = useTexture(noiseUrl);            // textures/noise/T_Noise_05.png
    const uniforms = useMemo(() => {
      noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
      return {
        uNoiseTex: { value: noiseTex },
        uProgress: { value: progress },
        uNoiseScale: { value: noiseScale },
        uColor: { value: new THREE.Color(color) },
      };
    }, []);
    return <shaderMaterial ref={ref} vertexShader={...} fragmentShader={...} uniforms={uniforms} />;
  },
);
```

```glsl
// dissolve.frag — first layer: noise -> threshold -> discard
float n = texture2D(uNoiseTex, vUv * uNoiseScale).r;
if (n < uProgress) discard;
gl_FragColor = vec4(uColor, 1.0);
```

The owning object (`DissolveObject`) animates `uProgress` 0→1 through the forwarded ref on
click. The full effect design — edge glow band, burn ramp, particle integration — is
documented in [research/dissolve-vfx-investigation.md](../research/dissolve-vfx-investigation.md).
Only the first (discard) layer is implemented today.

## Authoring a new material

1. `src/materials/FooMaterial/` → `FooMaterial.tsx`, `foo.vert`, `foo.frag`.
2. Define a `Props` interface; default every prop.
3. `forwardRef<THREE.ShaderMaterial, Props>`; build `uniforms` once with `useMemo(…, [])`.
4. Set `transparent`/`depthWrite`/`blending`/`side` to match the look (additive for glow).
5. `displayName`; default-export.
6. Add a row to the catalog above.

## Inline shader materials

Two effects keep their GLSL inline as `` /* glsl */ `…` `` template strings rather than as a
material folder, because they're tightly coupled to one object:

- `GlowOrb` — billboard Gaussian halo.
- `ParticleEmitter` — point-sprite vertex/fragment program.

Promote an inline shader to a material folder once a second object needs it.
