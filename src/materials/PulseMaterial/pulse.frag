varying vec2 vUv;
uniform float uTime;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),                  hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 6; i++) {
    value     += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv * 12.0;

  // spatial noise is static; brightness follows its own fbm path through time
  float n = fbm(uv);
  float wave = fbm(vec2(n * 4.0, uTime * 0.25));

  float dist = length(vUv - 0.5);
  float edgeFade = smoothstep(0.5, 0.15, dist);

  float alpha = wave * edgeFade;
  gl_FragColor = vec4(vec3(1.0), alpha);
}
