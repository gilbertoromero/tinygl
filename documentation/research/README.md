# Research Notes

Deep-dive investigations that informed the engine's effects. These are reference/background
material — the conclusions are applied in the engine, but the notes keep the full reasoning,
math, and external sources.

| Note | Topic |
|---|---|
| [bloom-math-reference.md](./bloom-math-reference.md) | sRGB↔linear conversion, luminance, and HDR bloom-threshold math |
| [bloom_explanation.md](./bloom_explanation.md) | Why a near-white standard-material cube blooms |
| [bloom-uniform-intensity-investigation.md](./bloom-uniform-intensity-investigation.md) | Achieving consistent bloom intensity across different colors |
| [dissolve-vfx-investigation.md](./dissolve-vfx-investigation.md) | Full dissolve VFX design: noise choice, fragment-shader threshold/edge/burn-ramp, vertex inputs, particle integration, and how it maps onto this codebase |

Applied where:

- Bloom notes → [../engine/rendering.md](../engine/rendering.md)
- Dissolve notes → [../engine/materials.md](../engine/materials.md) (`DissolveMaterial`) and
  [../engine/objects.md](../engine/objects.md) (`DissolveObject`). Only the first dissolve
  layer (discard) is implemented; the edge-glow/ramp/particle layers remain as design.
