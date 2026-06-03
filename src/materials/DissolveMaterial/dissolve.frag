varying vec2 vUv;

uniform sampler2D uNoiseTex;
uniform float uProgress;    // dissolve threshold, animate 0 -> 1
uniform float uNoiseScale;  // tiling of the noise lookup
uniform vec3  uColor;       // flat surface colour

// First layer of the dissolve effect only:
//   noise -> threshold -> discard
// (no edge band, no burn ramp, no particles — see dissolve-vfx-investigation.md §3a)
void main() {
  float n = texture2D(uNoiseTex, vUv * uNoiseScale).r;

  if (n < uProgress) discard;

  gl_FragColor = vec4(uColor, 1.0);
}
