Why the cube blooms
meshStandardMaterial color="#e8e8e8" is near-white.
In linear space its luminance is ~0.86. Multiplied by
the ambient + nearby point light, it easily exceeds
your luminanceThreshold={0.2}.

Why the plane doesn't bloom
color="#5a5a5a" looks medium-gray in sRGB but
converts to ~0.10 luminance in linear space (gamma
correction makes it much darker than it appears).
Even with the point light's spill, it never crosses
the threshold.

Why the GlowOrb sphere doesn't bloom — the real issue

Looking at GlowOrb.tsx line 100-101:
<meshStandardMaterial color={'#ff0000'} />
{/_ <GlowMaterial ref={coreMaterialRef} color={color}
   intensity={1.5} /> _/}

The actual GlowMaterial (which presumably outputs
bright HDR values) is commented out. The core sphere
is just a plain standard material with no emissive —
it only reflects incoming light. Three things
compound this:

1. Red luminance is only 0.2126 — pure red in linear
   space is right at the threshold. With ambient at 0.5,
   effective luminance ≈ 0.5 × 0.2126 = 0.11, below
   threshold.
2. The solid body sphere (solidColor="#080808") is at
   the same radius — it z-fights with the core sphere,
   and the near-black color darkens the result further.
3. haloRadiusMultiplier={0.0} — the shell/halo is
   zero-size and doesn't render at all.

Quick fix for the GlowOrb: add emissive and
emissiveIntensity to the core sphere material so it
outputs HDR values regardless of scene lighting:

<meshStandardMaterial
color={'#ff0000'}
emissive={'#ff0000'}
emissiveIntensity={2.0} // > 1 pushes into HDR
range → bloom picks it up
/>

Or restore the GlowMaterial if it already handles
that. For the floor, it'll only bloom in spots where
the point light is intense enough — lower
luminanceThreshold toward 0.05 if you want floor
spill to bloom too.

This is physically correct behavior — bloom responds
to luminance, and luminance comes from lighting.

The cube is at [2, -1, 0], the point light is at [0,
-0.25, 0] (inside the GlowOrb). Only the face
pointing toward the light receives the full
intensity={20} diffuse contribution, pushing that
face's luminance well into HDR range.

The other faces only receive ambient
(intensity={0.5}). For color="#e8e8e8" (linear
luminance ≈ 0.86):

- Lit face: ~0.86 × (ambient + point light) →
  luminance several times over 1.0 → strong bloom
- Unlit faces: 0.5 × 0.86 ≈ 0.43 luminance → barely
  above the luminanceThreshold={0.2}, and with
  luminanceSmoothing={0.9} the bloom for 0.43 is
  near-zero

luminanceSmoothing creates a wide softening band — a
surface at 0.43 just above the 0.2 threshold gets
almost no bloom. Only the face hitting several times
over 1.0 blooms visibly.

If you want all faces to bloom, the fix is to add
emissive so faces contribute a base luminance
regardless of lighting direction:

<meshStandardMaterial
color="#e8e8e8"
emissive="#e8e8e8"
emissiveIntensity={0.5} // all faces now output

That way even the unlit faces output enough to bloom,
while the directly-lit face still blooms more
intensely from the point light on top.
