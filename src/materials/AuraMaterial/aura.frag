uniform vec3  uColor;
uniform float uIntensity;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float NdotV = max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);

  // Low power (~1.2) keeps glow broad and volumetric rather than a tight rim.
  // DoubleSide rendering stacks front + back contributions at the silhouette,
  // naturally doubling brightness there — simulating scattered volume light.
  float aura  = pow(1.0 - NdotV, 1.2);

  float pulse = 0.88 + 0.12 * sin(uTime * 1.8);
  float alpha = aura * uIntensity * pulse;

  gl_FragColor = vec4(uColor * alpha, alpha);
}
