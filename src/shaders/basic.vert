varying vec2 vUv;
uniform float uTime;

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Basic time-based animation
  pos.y += sin(pos.x * 2.0 + uTime) * 0.2;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
