# Investigation: Uniform Bloom Intensity Across Different Colors

## The Problem

The `postprocessing` `Bloom` effect derives bloom strength from **pixel luminance**. Different colors have wildly different luminance values:

- White `#ffffff` → Y = 1.0
- Red `#ff0000` → Y = 0.2126
- Blue `#0000ff` → Y = 0.0722

Two objects with equally "bright-looking" colors will bloom at very different intensities, because the bloom pipeline doesn't care about perceptual equality — only linear luminance.

---

## Can Bloom Alone Achieve Uniform Intensity?

**No.** `Bloom` has no per-object or per-color normalization. It runs a single luminance pass over the entire framebuffer. There is no way to tell it "bloom red and blue equally" — it will always bloom brighter (higher luminance) pixels more.

The only knobs available on `<Bloom>` are global:

| Prop | Effect |
|------|--------|
| `intensity` | Scales all bloom uniformly |
| `luminanceThreshold` | Sets the minimum luminance to bloom |
| `luminanceSmoothing` | Widens/narrows the threshold falloff |
| `mipmapBlur` | Changes blur quality |
| `radius` | Controls spread of bloom |

None of these target individual objects or colors.

---

## Approach 1: Normalize emissiveIntensity per Color

You can manually compensate by tuning `emissiveIntensity` so every object outputs the **same target luminance** regardless of color.

```
emissiveIntensity = targetLuminance / Y_color
```

**Example: targeting Y = 0.5 for all objects**

| Color | Y_color | emissiveIntensity needed |
|-------|---------|--------------------------|
| White `#ffffff` | 1.000 | 0.50 |
| Red `#ff0000` | 0.213 | 2.35 |
| Blue `#0000ff` | 0.072 | 6.94 |

This works but has two problems:
1. It's tedious to maintain manually, especially for dynamic colors.
2. It changes the apparent lit color of the surface (very high `emissiveIntensity` on blue will wash it out towards white in the rendered frame itself, not just the bloom).

**Verdict:** feasible for a fixed palette of objects, impractical for dynamic or user-defined colors.

---

## Approach 2: Emissive Maps

An emissive map is a texture where each texel stores an RGB emissive multiplier for that point on the surface. Three.js applies it as:

```
finalEmissive = emissiveMap.rgb * emissive * emissiveIntensity
```

**When emissive maps help:**
- You want only *parts* of a surface to glow (e.g., circuit traces, window panes, screen pixels).
- The map is pre-baked and you can bake luminance compensation into the texel values.
- The object is static or its base color doesn't change at runtime.

**When emissive maps don't help:**
- You want uniform bloom across objects with *different materials and colors* — the map is per-surface, not cross-object.
- Colors are dynamic/procedural (e.g., color from a uniform) — a static map can't adapt.
- The goal is "all objects bloom at the same ring brightness" regardless of their base color.

**Verdict:** emissive maps solve *intra-object* glow control well, but they don't solve the cross-object uniformity problem.

---

## Approach 3: SelectiveBloom

`SelectiveBloom` from `@react-three/postprocessing` bypasses the luminance threshold entirely for selected objects. It renders selected objects into a separate pass and blooms them independently of the rest of the scene.

```tsx
import { EffectComposer, SelectiveBloom } from '@react-three/postprocessing';
import { Selection, Select } from '@react-three/postprocessing';

// In scene:
<Selection>
  <Select enabled>
    <mesh ref={redCubeRef}> ... </mesh>
  </Select>
  <Select enabled>
    <mesh ref={blueSphereRef}> ... </mesh>
  </Select>
</Selection>

// In EffectComposer:
<SelectiveBloom
  selection={[redCubeRef, blueSphereRef]}
  intensity={1.5}
  luminanceThreshold={0}   // bloom everything in the selection regardless of luminance
  luminanceSmoothing={0}
/>
```

With `luminanceThreshold={0}`, all selected objects bloom based purely on their rendered brightness — you still need emissive to have something to bloom, but you're no longer fighting the luminance threshold.

**To get truly uniform bloom ring brightness across different colors**, you still need matching emissive output luminance — `SelectiveBloom` doesn't normalize luminance across objects. But it gives you independent control over bloom parameters per selection group.

**Verdict:** the right tool when you want specific objects to bloom without worrying about global luminance competition with the rest of the scene. Combine with tuned `emissiveIntensity` for full control.

---

## Approach 4: Custom Bloom Pass (advanced)

If you need true color-independent uniform bloom, you'd write a custom luminance extraction shader that normalizes per-pixel bloom contribution before the blur pass — essentially replacing luminance-based extraction with a flag-based or intensity-normalized extraction.

This is non-trivial and only worth it if emissive normalization + SelectiveBloom are insufficient.

---

## Summary & Recommendation

| Goal | Best approach |
|------|--------------|
| Simple global bloom | `<Bloom>` with tuned threshold |
| Specific objects bloom at same level | `<SelectiveBloom>` + matching emissiveIntensity |
| Partial surface glow (textures) | Emissive maps + emissiveIntensity |
| Dynamic colors that must bloom uniformly | Compute emissiveIntensity at runtime via `threshold / Y_color` (see bloom-math-reference.md) |
| True color-independent uniform bloom | Custom luminance extraction shader |

**For this scene:** the cleanest path is `SelectiveBloom` with `luminanceThreshold={0}` on selected objects, combined with emissive materials where you calculate `emissiveIntensity` from the formula in `bloom-math-reference.md`. This gives per-object bloom control without fighting the global luminance pipeline.
