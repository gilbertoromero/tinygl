import React, { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import fireParticleUrl from '../../textures/flame-part.png';

// ─── Shaders ─────────────────────────────────────────────────────────────────

const vert = /* glsl */ `
  attribute float aAge;
  attribute float aLifetime;
  attribute float aSize;

  uniform float uSize;

  varying float vAlpha;

  void main() {
    float t = clamp(aAge / aLifetime, 0.0, 1.0);

    // shrink to 30 % of initial size over lifetime
    float sizeScale = mix(1.0, 0.3, t);

    // fade out sharply in the last 40 % of lifetime
    vAlpha = 1.0 - smoothstep(0.6, 1.0, t);

    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * aSize * sizeScale * (300.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const frag = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec3      uColor;
  uniform float     uOpacity;
  uniform vec3      uEmissive;
  uniform float     uEmissiveIntensity;

  varying float vAlpha;

  void main() {
    vec2 uv  = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
    vec4 tex = texture2D(uTexture, uv);
    if (tex.a < 0.01) discard;
    vec3 finalColor = uColor * tex.rgb + uEmissive * uEmissiveIntensity * tex.rgb;
    gl_FragColor = vec4(finalColor, tex.a * vAlpha * uOpacity);
  }
`;

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParticleArrays {
  pos: Float32Array; // xyz per particle
  vel: Float32Array; // xyz velocity (CPU only, not sent to GPU)
  age: Float32Array; // seconds alive
  lt: Float32Array; // max lifetime
  sz: Float32Array; // size multiplier per particle
}

interface Basis {
  dir: THREE.Vector3;
  u: THREE.Vector3; // perpendicular to dir
  v: THREE.Vector3; // perpendicular to dir and u
}

export interface ParticleEmitterProps {
  position?: [number, number, number];
  count?: number;
  /** Normalized emit direction. Default: up [0,1,0] */
  direction?: [number, number, number];
  /** Cone half-angle in degrees around direction. Default: 15 */
  spread?: number;
  /** Radius of the spawn disc perpendicular to direction. Default: 0.2 */
  emitRadius?: number;
  /** [min, max] particle speed in units/sec. Default: [1.0, 2.5] */
  speed?: [number, number];
  /** [min, max] particle lifetime in seconds. Default: [0.8, 2.0] */
  lifetime?: [number, number];
  /** Base gl_PointSize (screen-space, perspective-divided). Default: 80 */
  size?: number;
  /** Color tint applied to the texture. Default: '#ff6600' */
  color?: THREE.ColorRepresentation;
  /** Override the default fire-particle.png texture with any imported URL */
  textureUrl?: string;
  /** Gravity acceleration vector. Default: [0, -0.5, 0] */
  gravity?: [number, number, number];
  /** Overall opacity multiplier. Default: 1.0 */
  opacity?: number;
  /** Additive emissive color added on top of the texture tint. Default: '#000000' (none) */
  emissive?: THREE.ColorRepresentation;
  /** Scales the emissive contribution. Values > 1 push into HDR for bloom. Default: 0 */
  emissiveIntensity?: number;
  /** Recycle dead particles. Set to false for one-shot bursts. Default: true */
  loop?: boolean;
}

// ─── Pure helpers (outside component to avoid closure churn) ─────────────────

function computeBasis(direction: [number, number, number]): Basis {
  const dir = new THREE.Vector3(...direction).normalize();
  const arb = Math.abs(dir.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(dir, arb).normalize();
  const v = new THREE.Vector3().crossVectors(dir, u);
  return { dir, u, v };
}

function spawnParticle(
  a: ParticleArrays,
  i: number,
  t0: number, // pre-advance seconds (for staggered init)
  basis: Basis,
  cosHalfSpread: number,
  grav: THREE.Vector3,
  emitRadius: number,
  speed: [number, number],
  lifetime: [number, number],
) {
  const { dir, u, v } = basis;

  const lt = lifetime[0] + Math.random() * (lifetime[1] - lifetime[0]);
  a.lt[i] = lt;
  a.sz[i] = 0.5 + Math.random() * 1.0;

  // Random point on spawn disc (perpendicular to dir)
  const r = emitRadius * Math.sqrt(Math.random());
  const phi = Math.random() * Math.PI * 2;
  const sx = r * (Math.cos(phi) * u.x + Math.sin(phi) * v.x);
  const sy = r * (Math.cos(phi) * u.y + Math.sin(phi) * v.y);
  const sz = r * (Math.cos(phi) * u.z + Math.sin(phi) * v.z);

  // Random direction inside cone (uniform solid-angle sampling)
  const cosT = 1 - Math.random() * (1 - cosHalfSpread);
  const sinT = Math.sqrt(1 - cosT * cosT);
  const psi = Math.random() * Math.PI * 2;
  const sp = speed[0] + Math.random() * (speed[1] - speed[0]);
  const vx0 = (dir.x * cosT + u.x * Math.cos(psi) * sinT + v.x * Math.sin(psi) * sinT) * sp;
  const vy0 = (dir.y * cosT + u.y * Math.cos(psi) * sinT + v.y * Math.sin(psi) * sinT) * sp;
  const vz0 = (dir.z * cosT + u.z * Math.cos(psi) * sinT + v.z * Math.sin(psi) * sinT) * sp;

  // Kinematic pre-advance: pos = spawn + v0*t + 0.5*g*t²  |  vel = v0 + g*t
  a.pos[i * 3] = sx + vx0 * t0 + 0.5 * grav.x * t0 * t0;
  a.pos[i * 3 + 1] = sy + vy0 * t0 + 0.5 * grav.y * t0 * t0;
  a.pos[i * 3 + 2] = sz + vz0 * t0 + 0.5 * grav.z * t0 * t0;

  a.vel[i * 3] = vx0 + grav.x * t0;
  a.vel[i * 3 + 1] = vy0 + grav.y * t0;
  a.vel[i * 3 + 2] = vz0 + grav.z * t0;

  a.age[i] = t0;
}

// ─── Component ───────────────────────────────────────────────────────────────

const ParticleEmitter: React.FC<ParticleEmitterProps> = ({
  position = [0, 0, 0],
  count = 200,
  direction = [0, 1, 0],
  spread = 15,
  emitRadius = 0.2,
  speed = [1.0, 2.5],
  lifetime = [0.8, 2.0],
  size = 80,
  color = '#ff6600',
  textureUrl,
  gravity = [0, -0.5, 0],
  opacity = 1.0,
  emissive = '#000000',
  emissiveIntensity = 0,
  loop = true,
}) => {
  const texture = useTexture(textureUrl ?? fireParticleUrl);

  // Derived values from props
  const basis = useMemo(
    () => computeBasis(direction),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [direction[0], direction[1], direction[2]],
  );

  const cosHalfSpread = useMemo(() => Math.cos((spread * Math.PI) / 180), [spread]);

  const grav = useMemo(
    () => new THREE.Vector3(gravity[0], gravity[1], gravity[2]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gravity[0], gravity[1], gravity[2]],
  );

  // Typed arrays — single allocation, mutated every frame
  const arrays = useMemo<ParticleArrays>(
    () => ({
      pos: new Float32Array(count * 3),
      vel: new Float32Array(count * 3),
      age: new Float32Array(count),
      lt: new Float32Array(count),
      sz: new Float32Array(count),
    }),
    [count],
  );

  // BufferGeometry — created once, attributes updated in useFrame
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();

    // Staggered init: pre-advance each particle by a random fraction of its
    // lifetime so the effect appears fully populated from frame 1
    for (let i = 0; i < count; i++) {
      const t0 = Math.random() * lifetime[1];
      spawnParticle(arrays, i, t0, basis, cosHalfSpread, grav, emitRadius, speed, lifetime);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(arrays.pos, 3));
    geo.setAttribute('aAge', new THREE.BufferAttribute(arrays.age, 1));
    geo.setAttribute('aLifetime', new THREE.BufferAttribute(arrays.lt, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(arrays.sz, 1));

    return geo;
    // Intentionally only depends on count — direction/speed/etc transition
    // naturally as live particles die and new ones are spawned with updated props
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Uniforms — created once, values mutated when props change
  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uColor: { value: new THREE.Color(color) },
      uSize: { value: size },
      uOpacity: { value: opacity },
      uEmissive: { value: new THREE.Color(emissive) },
      uEmissiveIntensity: { value: emissiveIntensity },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uTexture.value = texture;
  }, [texture]);
  useEffect(() => {
    uniforms.uColor.value.set(color as string);
  }, [color]);
  useEffect(() => {
    uniforms.uSize.value = size;
  }, [size]);
  useEffect(() => {
    uniforms.uOpacity.value = opacity;
  }, [opacity]);
  useEffect(() => {
    uniforms.uEmissive.value.set(emissive as string);
  }, [emissive]);
  useEffect(() => {
    uniforms.uEmissiveIntensity.value = emissiveIntensity;
  }, [emissiveIntensity]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05); // cap to avoid tunnelling on tab-switch
    const gx = grav.x,
      gy = grav.y,
      gz = grav.z;
    const { pos, vel, age, lt } = arrays;

    for (let i = 0; i < count; i++) {
      age[i] += dt;

      if (age[i] >= lt[i]) {
        if (loop) {
          spawnParticle(arrays, i, 0, basis, cosHalfSpread, grav, emitRadius, speed, lifetime);
        } else {
          // Park dead particles far away (cheaper than a draw-call cull)
          pos[i * 3] = pos[i * 3 + 1] = pos[i * 3 + 2] = 1e10;
        }
        continue;
      }

      // Euler integration: gravity then move
      vel[i * 3] += gx * dt;
      vel[i * 3 + 1] += gy * dt;
      vel[i * 3 + 2] += gz * dt;
      pos[i * 3] += vel[i * 3] * dt;
      pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
      pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
    }

    (geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute('aAge') as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute('aLifetime') as THREE.BufferAttribute).needsUpdate = true;
    (geometry.getAttribute('aSize') as THREE.BufferAttribute).needsUpdate = true;
  });

  return (
    <points position={position}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleEmitter;
