# Dissolve VFX — Investigation & Reference

> Research notes for building a dissolve/disintegration effect in this project
> (React Three Fiber + `three@0.160` + `vite-plugin-glsl` + `@react-three/postprocessing`).
> Last updated: 2026-05-31.

---

## 1. TL;DR — the one-paragraph mental model

A dissolve effect is, at its core, a **per-fragment threshold test against a noise field**:

```
noise(position_or_uv)  →  compare to a moving threshold  →  discard below it
                                                         →  colour a thin band just above it (the "burn" edge)
```

Everything else (fire colours, glowing edges, particles flying off, directional/spherical
reveal, multiple stacked textures) is *decoration layered on top of those two operations*:
**clip** and **edge band**. The canonical pipeline every tutorial converges on is:

> **Noise → Step/Threshold → Alpha (discard)**, plus a **second offset Step → edge colour**.

---

## 2. What textures do you actually need?

You can do a *minimum-viable* dissolve with **zero textures** (procedural noise in the shader)
or with **one texture** (a baked noise map). Richer looks stack 2–4 textures.

| Texture | Required? | Purpose | Notes |
|---|---|---|---|
| **Noise / dissolve map** (grayscale) | Core (or procedural equivalent) | Drives *where* fragments disappear. White dissolves first, black last (or inverted). | Perlin/Simplex = smooth organic; Worley/Voronoi = cellular/cracked; FBM = detailed multi-scale. Should be **tileable/seamless** if sampled by UV. |
| **Albedo / base color** | If your object has one | Normal surface look before/under the dissolve. | The dissolve just gates this material's output via `discard`. |
| **Edge ramp / gradient (1D)** | Optional, big visual win | Maps "distance into the edge band" → a fire gradient (white→yellow→orange→red→black). | This is the classic *second texture stacked on the noise* — sampled by the edge factor, not by UV. |
| **Detail / secondary noise** | Optional | A second noise at a different scale/speed multiplied or added to the first, to break up uniformity and avoid an obvious single-octave look. | This is "stacking textures to amplify/modify" — see §6. |
| **Flow map (RG)** | Optional (advanced) | Distorts the noise UVs over time so the burn *flows* directionally (great for fire/lava). | DeepSpaceBanana flow-mapped burn. |
| **Emissive / glow mask** | Optional | If only part of the surface should glow at the edge. | Often unnecessary — the edge band itself is the emissive source. |

**Key insight on "stacking":** the textures are *not* all sampled the same way. The noise map
is sampled by UV (or position) to get a scalar. The **ramp** is sampled by the *computed edge
factor*. The detail noise is *combined arithmetically* with the primary noise. So "stacking
textures over each other in the fragment shader" really means three different combination modes:
**(a) sample-by-coordinate**, **(b) sample-by-derived-scalar**, **(c) arithmetic blend**.

### Procedural vs. baked noise

- **Procedural** (GLSL `cnoise`/`snoise`, FBM): infinitely flexible, animatable in 3D/4D,
  no asset to ship, no UV-seam problems if fed world/object position — but costs ALU.
  Best for this template since you already generate noise in `NoiseMaterial`.
- **Baked texture**: cheaper per-fragment, art-directable in Photoshop ("Clouds" filter),
  better on mobile — but must be tileable and you get UV seams on complex meshes.

---

## 3. Fragment shader — the core logic

### 3a. Minimal discard (procedural noise, the Codrops Three.js approach)

```glsl
// uniforms
uniform float uProgress;   // dissolve threshold, animate 0 -> 1 (or beyond)
uniform float uEdge;       // width of the glowing band
uniform float uFreq;       // noise frequency / scale
uniform float uAmp;        // noise amplitude
uniform vec3  uEdgeColor;  // burn colour (use HDR > 1.0 for bloom)

varying vec3 vPos;         // passed from vertex shader (object or world space)

void main() {
    float noise = cnoise(vPos * uFreq) * uAmp;   // Perlin/Simplex, ~[-1,1]

    if (noise < uProgress) discard;              // (1) clip everything below threshold

    float edgeWidth = uProgress + uEdge;
    if (noise > uProgress && noise < edgeWidth) {
        gl_FragColor = vec4(uEdgeColor, 1.0);    // (2) thin band = glowing edge
        return;
    }

    // ... otherwise normal shaded colour ...
    gl_FragColor = vec4(baseColor, 1.0);
}
```

*(From the Codrops 2025 "Dissolve Effect with Shaders and Particles in Three.js" article — uses
`cnoise(vPos * uFreq)` and the `if (noise < uProgress) discard;` pattern.)*

### 3b. Texture-based clip (Unity/HLSL idiom, directly portable to GLSL)

```glsl
float dissolve = texture2D(uNoiseTex, vUv).r;    // grayscale noise map
if (dissolve - uAmount < 0.0) discard;           // clip(): drop pixel when negative
```

*(Linden Reid / Febucci: `clip(dissolve_value - _Amount)`.)*

### 3c. Branchless edge band (cheaper than `if`, better for the burn ramp)

`step()`/`smoothstep()` avoid divergent branches and give you a soft 0→1 edge factor that you
can feed into a ramp texture:

```glsl
float n = texture2D(uNoiseTex, vUv).r;

// hard cutoff alpha
float alpha = step(uProgress, n);                 // 0 below threshold, 1 above

// edge factor: 1 at the cut line, fading to 0 across uEdge
float edge = 1.0 - smoothstep(uProgress, uProgress + uEdge, n);
edge *= alpha;                                     // only on the visible side

// stack the ramp texture (see §6): sample fire gradient by edge factor
vec3 burn = texture2D(uRampTex, vec2(edge, 0.5)).rgb;

vec3 color = mix(baseColor, burn * uEdgeIntensity, edge);
if (alpha < 0.5) discard;
gl_FragColor = vec4(color, 1.0);
```

The **two-step / offset-step** technique (Cyanilux, Febucci, Daniel Ilett): one step at
`uProgress`, a second at `uProgress + uEdge`, subtract → isolates the band → multiply by colour
→ route to emission.

### 3d. Why HDR colours + bloom

To get the *glowing* edge (not just a coloured line), give `uEdgeColor`/ramp values **> 1.0**
and run a **bloom** pass. The Codrops demo uses **selective UnrealBloom**. You already have
`@react-three/postprocessing` + `postprocessing@6` — use its `<Bloom>` / `SelectiveBloom`. There
are existing bloom investigation notes in this repo (`bloom-math-reference.md`,
`bloom_explanation.md`) worth reusing.

---

## 4. Does the vertex shader need input?

**Depends on the variant:**

| Dissolve variant | Vertex shader work needed |
|---|---|
| **UV-driven** (sample noise by `vUv`) | Just pass `vUv` (standard). No special input. |
| **Procedural noise by position** (recommended here) | Pass `vPos = position` (object space) or world position as a `varying`. That's the one required addition. |
| **Directional / height dissolve** (dissolve bottom→top, etc.) | Pass object/world **position** so the fragment shader can use `vPos.y` to bias the threshold. |
| **Spherical / point-of-impact dissolve** | Pass world position; fragment computes `distance(vWorldPos, uCenter)` as the threshold driver. Vertex shader must output world position. |
| **Particles flying off the edge** | Real vertex work: per-particle attributes (`initPosition`, `velocity`, `aDist`, `angle`), animated `position`, and `gl_PointSize = uBaseSize / -viewPosition.z` for perspective sizing. |

So: a *plain* dissolve needs **no vertex modification** beyond a varying. **Directional,
spherical, and particle** variants need the vertex shader to forward **position** (and, for
particles, custom attributes + point-size logic).

### Directional dissolve snippet

```glsl
// vertex
varying vec3 vPos;
void main() {
    vPos = position;                              // object space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// fragment — bias the noise threshold by height so it sweeps bottom→top
float heightMask = smoothstep(uMinY, uMaxY, vPos.y);   // 0 at bottom, 1 at top
float n = cnoise(vPos * uFreq) * 0.5 + 0.5;            // remap to [0,1]
float field = mix(n, heightMask, uDirBlend);          // blend noise w/ direction
if (field < uProgress) discard;
```

*(Cyanilux: split the Y position, negate/add to noise, remap with Inverse Lerp. Same idea here
with `smoothstep` + `mix`.)*

### Spherical dissolve snippet

```glsl
// vertex: forward world position
varying vec3 vWorldPos;
vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;

// fragment: distance from an impact point drives the cut
float d = distance(vWorldPos, uCenter);
float field = d - cnoise(vWorldPos * uFreq) * uAmp;    // noise roughens the sphere
if (field > uRadius) discard;                          // inside radius survives
float edge = smoothstep(uRadius - uEdge, uRadius, field);
```

---

## 5. Noise choice — what pattern do you get?

| Noise | Look on dissolve | Use when |
|---|---|---|
| **Perlin / Simplex** | Smooth, cloudy, organic edges | Default. Burning, magical fade, ghostly. Simplex (`snoise`) is cheaper/less grid-artifact than classic Perlin in higher dims. |
| **Worley / Voronoi (cellular)** | Sharp cells, cracked-earth, scales | Shattering, crystalline, reptilian, "eaten by cells". |
| **Value noise** | Blockier | Cheap, retro/dithered. |
| **FBM (fractal sum of octaves)** | Rich multi-scale detail | Realistic fire/smoke edges. `fbm(p) = Σ amplitudeᵢ · noise(p · freqᵢ)`. |
| **Domain-warped FBM** `fbm(p + fbm(p))` | Flowing, turbulent, "liquid" | High-end burns/lava. Two layers is enough (~33% cheaper than three). |

Library to lift GLSL noise from: **Ashima/`webgl-noise`** (`stegu/webgl-noise`) — battle-tested
`snoise`/`cnoise`. For tileable variants: **`tuxalin/procedural-tileable-shaders`**.

---

## 6. Stacking multiple textures — the three combination modes

This is the heart of your "are multiple textures stacked to amplify/modify the dissolve?"
question. **Yes**, and they combine in distinct ways:

**(a) Combine two noises arithmetically to shape the *field* itself**
```glsl
float big   = texture2D(uNoiseA, vUv * 1.0).r;   // large-scale structure
float fine  = texture2D(uNoiseB, vUv * 6.0 + uTime * 0.05).r; // fine, moving detail
float field = big * 0.7 + fine * 0.3;            // or big * fine for sparser holes
if (field < uProgress) discard;
```
Multiplying makes holes appear in clusters; adding/averaging keeps it even. Animating the
second UV makes the edge *crawl*.

**(b) Sample a 1D ramp texture by the *edge factor* to colour the burn**
```glsl
float edge = 1.0 - smoothstep(uProgress, uProgress + uEdge, field);
vec3 burn  = texture2D(uRamp, vec2(edge, 0.5)).rgb;  // fire gradient lookup
```
The ramp is **not** sampled by UV — it's sampled by the derived edge scalar. This is the
"second texture stacked on top of the noise" from burning-paper shaders (Kyle Halladay). It
gives the white-hot → ember → char transition for free, art-directed by swapping the ramp.

**(c) Flow-map distortion of the noise lookup (advanced, makes it *move*)**
```glsl
vec2 flow = texture2D(uFlow, vUv).rg * 2.0 - 1.0;
float field = texture2D(uNoise, vUv + flow * uTime * uFlowStrength).r;
```
Drives a *directional flowing* burn (DeepSpaceBanana flow-mapped burn).

**Summary:** noise×noise shapes the dissolve; ramp-by-edge colours the burn; flow-map animates
it. You rarely need all four maps at once — 1 noise + 1 ramp already looks great.

---

## 7. Particles flying off the edge (Codrops technique)

To make debris/embers detach as the surface dissolves:

- Particles reuse the **same geometry** (sample mesh surface points).
- A particle is **only rendered when its noise value sits in the edge band**
  (`uProgress < n < uProgress + uEdge`) — so they naturally appear *at the dissolving front*
  and travel outward.
- Per-particle attributes: `initPosition`, `currentPosition`, `velocity`, `maxOffset`,
  `aDist` (size scaling), `angle` (rotation).
- Vertex: `gl_PointSize = uBaseSize / -viewPosition.z` (perspective-correct size).
- Fragment: rotate `gl_PointCoord`, sample a sprite texture (you already have
  `src/textures/fire-particle.png`, `flame-part.png`, `emissive.png`), **additive blending**,
  feed into bloom.

```glsl
// particle fragment
vec2 coord = gl_PointCoord - 0.5;
coord = mat2(cos(vAngle), sin(vAngle), -sin(vAngle), cos(vAngle)) * coord;
vec4 tex = texture2D(uSprite, coord + 0.5);
gl_FragColor = vec4(uColor * tex.rgb, tex.a);
```

You already have a `ParticleEmitter` object and the sprite assets — these can drive the
edge-spawned debris.

---

## 8. How this maps onto THIS project

- **Reuse `src/materials/NoiseMaterial`** — it already produces noise; extend it with
  `uProgress`/`uEdge` uniforms and a `discard`. The existing `NoiseSphere`/`NoisePlane`
  objects are ready test beds.
- **GLSL files**: you have `vite-plugin-glsl`, so put `dissolve.vert`/`dissolve.frag` next to
  the material (matching the `AuraMaterial`/`GlowMaterial` folder convention) and
  `import` them.
- **Glow**: route the HDR edge colour through the existing bloom setup
  (`@react-three/postprocessing`), per `bloom-math-reference.md`.
- **Debug controls**: there's a `src/components/DebugOverlay/` — wire `uProgress`, `uEdge`,
  `uFreq`, `uEdgeColor`, ramp toggle to it for live tuning.
- **Particles**: `src/objects/ParticleEmitter` + `src/textures/fire-particle.png` cover the
  edge-debris layer.
- **Textures to add** (optional): a tileable grayscale noise map and a 1D fire **ramp** PNG in
  `src/textures/`. Everything else can stay procedural.

### Minimum build order
1. Add `uProgress` + `discard` to `NoiseMaterial`, animate `uProgress` 0→1. (core dissolve)
2. Add the offset-step **edge band** with an HDR colour. (burning edge)
3. Pipe through **bloom**. (glow)
4. *(optional)* Add a **ramp texture** sampled by the edge factor. (fire gradient)
5. *(optional)* Add **directional/spherical** bias via vertex position. (art direction)
6. *(optional)* Spawn **edge particles** from `ParticleEmitter`. (debris)

---

## 9. Resources (verified during this investigation)

**Three.js / WebGL specific (most relevant to this repo)**
- Codrops — *Implementing a Dissolve Effect with Shaders and Particles in Three.js* (2025): https://tympanus.net/codrops/2025/02/17/implementing-a-dissolve-effect-with-shaders-and-particles-in-three-js/
- Wawa Sensei — *Dissolve Effect* (React Three Fiber tutorial): https://wawasensei.dev/tuto/react-three-fiber-tutorial-dissolve-effect
- GitHub — `ScreamingRoot/three.js-dissolve-vfx-example` (simplex noise + fade width + two colour bands, GUI): https://github.com/ScreamingRoot/three.js-dissolve-vfx-example
- GitHub — `magnuswahlstrand/demo-r3f-dissolve-shader` (R3F): https://github.com/magnuswahlstrand/demo-r3f-dissolve-shader
- CodePen — Clément Roche, three.js dissolve (Simplex 4D): https://codepen.io/ClementRoche/pen/zVeKVj
- GitHub — `kseniya7991/Noise-Shaders-Three.js`: https://github.com/kseniya7991/Noise-Shaders-Three.js
- Three.js Roadmap — *10 Noise Functions for Three.js TSL Shaders*: https://threejsroadmap.com/blog/10-noise-functions-for-threejs-tsl-shaders

**Core technique breakdowns (concepts port 1:1 to GLSL)**
- Cyanilux — *Dissolve Shader Breakdown* (noise→step→alpha, edge band, directional, view-UV seams): https://www.cyanilux.com/tutorials/dissolve-shader-breakdown/
- Febucci — *Dissolve Shader with Edge Glow*: https://blog.febucci.com/2018/09/dissolve-shader/
- Linden Reid — *Dissolve Shader in Unity* (`clip()` + `step()` emission): https://lindenreidblog.com/2017/12/16/dissolve-shader-in-unity/
- Daniel Ilett — *Dissolve Effect in Shader Graph and URP* (edge noise + emissive, multi-octave): https://danielilett.com/2020-04-15-tut5-4-urp-dissolve/
- Mirza Beig — *Dissolve Shader (Part 1)*: https://mirzabeig.substack.com/p/unity-tutorial-dissolve-shader-part-1
- Harry Alisavakis — *Dissolve shader* and *Spherical mask dissolve*: https://halisavakis.com/my-take-on-shaders-dissolve-shader/ · https://halisavakis.com/my-take-on-shaders-spherical-mask-dissolve/

**Burn ramp / directional / spherical variants**
- Kyle Halladay — *A Burning Paper Shader* (second ramp texture stacked on noise): https://kylehalladay.com/blog/tutorial/2015/11/10/Dissolve-Shader-Redux.html
- gameidea — *Making a Spherical Dissolve Shader with Burn* (distance-driven): https://gameidea.org/2025/01/19/making-a-spherical-dissolve-shader-with-burn/
- DeepSpaceBanana — *Flow-mapped Burn Shader*: https://deepspacebanana.github.io/blog/shader/art/unreal%20engine/Flowmapped-Burn-Shader
- Poiyomi Shaders — *Dissolve* docs (directional axis travel, world/local): https://www.poiyomi.com/special-fx/dissolve
- Godot Shaders — *2D dissolve with burn edge*: https://godotshaders.com/shader/2d-dissolve-with-burn-edge/

**Noise theory & GLSL noise libraries**
- The Book of Shaders — Noise / More noise / FBM: https://thebookofshaders.com/11/ · https://thebookofshaders.com/12/ · https://thebookofshaders.com/13/
- Inigo Quilez — *Domain Warping*: https://iquilezles.org/articles/warp/
- `stegu/webgl-noise` (Ashima Simplex/Perlin GLSL): https://stegu.github.io/webgl-noise/webdemo/
- `tuxalin/procedural-tileable-shaders` (tileable cellular/fbm/voronoi/perlin): https://github.com/tuxalin/procedural-tileable-shaders
- Ronja — *Tiling Noise* / *Voronoi Noise*: https://www.ronja-tutorials.com/post/029-tiling-noise/
- NVIDIA GPU Gems 2, Ch.26 — *Implementing Improved Perlin Noise*: https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-26-implementing-improved-perlin-noise

**Tools — generate noise/ramp textures**
- Texturize noise generator (Perlin/FBM/Cellular): https://texturize.app/generators/noise
- tinkpro seamless noise generator: https://tinkpro.com/noise-generator/
