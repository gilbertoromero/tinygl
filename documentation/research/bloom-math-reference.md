# Bloom Math Reference

## 1. sRGB ↔ Linear Conversion

Three.js and WebGL work in **linear color space** internally. Colors specified as hex (e.g. `#ff0000`) are in sRGB.

**sRGB → Linear (per channel):**
```
if C_srgb <= 0.04045:
    C_linear = C_srgb / 12.92
else:
    C_linear = ((C_srgb + 0.055) / 1.055) ^ 2.4
```

Approximation (good enough for intuition):
```
C_linear ≈ C_srgb ^ 2.2
```

**Examples:**
| sRGB hex | sRGB value | Linear value |
|----------|-----------|--------------|
| `#ffffff` | 1.000 | 1.000 |
| `#e8e8e8` | 0.910 | 0.817 |
| `#808080` | 0.502 | 0.216 |
| `#5a5a5a` | 0.353 | 0.107 |
| `#1a1a2e` | 0.102 | 0.009 |

---

## 2. Relative Luminance

Luminance (Y) is the perceived brightness of a color, weighted by how sensitive human vision is to each channel.

```
Y = 0.2126 * R_linear + 0.7152 * G_linear + 0.0722 * B_linear
```

**Channel luminance weights:**
| Channel | Weight | Implication |
|---------|--------|-------------|
| Red     | 0.2126 | Low luminance per unit brightness |
| Green   | 0.7152 | Dominates perceived brightness |
| Blue    | 0.0722 | Very low luminance per unit brightness |

**Luminance of common pure colors (linear):**
| Color | Hex | Y |
|-------|-----|---|
| White | `#ffffff` | 1.0000 |
| Yellow | `#ffff00` | 0.9278 |
| Green | `#00ff00` | 0.7152 |
| Cyan | `#00ffff` | 0.7874 |
| Red | `#ff0000` | 0.2126 |
| Magenta | `#ff00ff` | 0.2848 |
| Blue | `#0000ff` | 0.0722 |
| Black | `#000000` | 0.0000 |

---

## 3. Bloom Luminance Threshold & Smoothing

The `postprocessing` `LuminanceMaterial` extracts pixels that contribute to bloom using a **smoothstep** around the threshold.

**Smoothstep range:**
```
lowerBound = luminanceThreshold - luminanceSmoothing * luminanceThreshold
upperBound = luminanceThreshold + luminanceSmoothing * (1 - luminanceThreshold)
```

**Bloom contribution factor** for a given luminance Y:
```
contribution = smoothstep(lowerBound, upperBound, Y)
```

Where `smoothstep(a, b, x) = t^2 * (3 - 2t)`, and `t = clamp((x - a) / (b - a), 0, 1)`.

**Example with threshold=0.2, smoothing=0.9:**
```
lowerBound = 0.2 - 0.9 * 0.2 = 0.02
upperBound = 0.2 + 0.9 * 0.8 = 0.92
```

| Luminance | smoothstep result | Bloom |
|-----------|-----------------|-------|
| 0.02 | 0.000 | none |
| 0.10 | 0.105 | barely visible |
| 0.20 | 0.283 | weak |
| 0.43 | 0.567 | moderate |
| 0.92+ | 1.000 | full |

**Key takeaway:** with `luminanceSmoothing=0.9` the effective bloom range is very wide (0.02–0.92). A surface at 0.43 luminance only gets ~57% bloom contribution, not full bloom.

---

## 4. Minimum emissiveIntensity to Cross Threshold

For a `meshStandardMaterial` with `emissive` set to the same value as `color`, the emissive contribution in linear space is:

```
Y_emissive = emissiveIntensity * (0.2126*R + 0.7152*G + 0.0722*B)
```

To guarantee a surface blooms (Y > threshold), regardless of scene lighting:

```
emissiveIntensity_min = threshold / Y_color
```

**Required emissiveIntensity for `luminanceThreshold=0.2`:**
| Color | Hex | Y_color | emissiveIntensity needed |
|-------|-----|---------|--------------------------|
| White | `#ffffff` | 1.0000 | > 0.20 |
| Yellow | `#ffff00` | 0.9278 | > 0.22 |
| Green | `#00ff00` | 0.7152 | > 0.28 |
| Cyan | `#00ffff` | 0.7874 | > 0.25 |
| Red | `#ff0000` | 0.2126 | > 0.94 |
| Magenta | `#ff00ff` | 0.2848 | > 0.70 |
| Blue | `#0000ff` | 0.0722 | > 2.77 |
| Mid gray | `#808080` | 0.2158 | > 0.93 |
| Dark gray | `#5a5a5a` | 0.1074 | > 1.86 |

**Blue needs almost 14× more emissive intensity than white to bloom at the same threshold.**

---

## 5. HDR Range and Bloom Strength

`emissiveIntensity` has no hard cap. Values > 1 push into HDR space and produce proportionally stronger bloom.

```
bloom_strength ∝ Y - threshold    (for Y above threshold)
```

| emissiveIntensity (red #ff0000) | Y_emissive | Above threshold by |
|---------------------------------|------------|--------------------|
| 0.5 | 0.106 | not blooming |
| 1.0 | 0.213 | +0.013 (barely) |
| 2.0 | 0.425 | +0.225 (weak) |
| 5.0 | 1.063 | +0.863 (strong) |
| 10.0 | 2.126 | +1.926 (very strong) |

---

## 6. Quick Reference Formula

To compute the emissiveIntensity needed for any hex color to bloom at a given threshold:

```js
function minEmissiveIntensity(hexColor, threshold = 0.2) {
  const c = new THREE.Color(hexColor); // auto-converts sRGB → linear
  const Y = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return threshold / Y;
}
```
