uniform vec3  uColor;
uniform float uIntensity;
uniform float uTime;
uniform float uFalloff;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float NdotV = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);

  // pow(NdotV, uFalloff): exactly 1.0 at the camera-facing pole, exactly 0.0 at
  // the silhouette — no hard sphere edge ever visible. Higher falloff = tighter glow.
  float glow  = pow(NdotV, uFalloff);
  float pulse = 0.88 + 0.12 * sin(uTime * 1.8);
  float alpha = glow * uIntensity * pulse;

  gl_FragColor = vec4(uColor * alpha, alpha);
}
