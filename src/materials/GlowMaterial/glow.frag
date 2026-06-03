uniform vec3  uColor;
uniform float uIntensity;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float NdotV   = max(dot(vNormal, vViewDir), 0.0);

  // rim glow: bright at grazing angles, dark at center
  float fresnel = pow(1.0 - NdotV, 2.5);

  // soft core so the sphere isn't hollow
  float core    = smoothstep(1.0, 0.0, NdotV) * 0.25;

  float pulse   = 0.88 + 0.12 * sin(uTime * 1.8);
  float alpha   = (fresnel + core) * uIntensity * pulse;

  gl_FragColor  = vec4(uColor * alpha, alpha);
}
