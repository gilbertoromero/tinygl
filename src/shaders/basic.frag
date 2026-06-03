varying vec2 vUv;
uniform float uTime;

void main() {
  // Simple animated gradient
  vec3 color1 = vec3(1.0, 0.4, 0.6); // Pinkish red
  vec3 color2 = vec3(0.4, 0.6, 1.0); // Light blue
  
  float mixFactor = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
  vec3 finalColor = mix(color1, color2, mixFactor);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
