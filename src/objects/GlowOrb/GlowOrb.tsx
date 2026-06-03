import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GlowMaterial from '../../materials/GlowMaterial/GlowMaterial';
import GlowShellMaterial from '../../materials/GlowShellMaterial/GlowShellMaterial';

// Billboard halo — simple Gaussian radial glow, kept inline since it's trivial
const billboardVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const billboardFrag = /* glsl */ `
  uniform vec3  uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying vec2  vUv;

  void main() {
    float dist  = length(vUv - 0.5) * 2.0;      // 0 at center, 1 at edge
    float glow  = exp(-dist * dist * 3.5);       // Gaussian falloff
    float pulse = 0.88 + 0.12 * sin(uTime * 1.8);
    float alpha = glow * uIntensity * pulse;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

interface Props {
  position?: [number, number, number];
  color?: THREE.ColorRepresentation;
  radius?: number;
  haloRadiusMultiplier?: number;
  lightIntensity?: number;
  lightDistance?: number;
  solid?: boolean;
  solidColor?: THREE.ColorRepresentation;
  haloType?: 'billboard' | 'sphere';
  shellFalloff?: number;
}

const GlowOrb: React.FC<Props> = ({
  position = [0, 0, 0],
  color = '#00aaff',
  radius = 1.0,
  haloRadiusMultiplier = 2.0,
  lightIntensity = 4,
  lightDistance = 8,
  solid = true,
  solidColor = '#080808',
  haloType = 'billboard',
  shellFalloff = 3.0,
}) => {
  const coreMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const billboardRef = useRef<THREE.Mesh>(null);
  const billboardMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const shellMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const billboardUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 0.9 },
      uTime: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame(({ clock, camera }) => {
    const t = clock.elapsedTime;

    if (coreMaterialRef.current) coreMaterialRef.current.uniforms.uTime.value = t;
    if (billboardMaterialRef.current) billboardMaterialRef.current.uniforms.uTime.value = t;
    if (shellMaterialRef.current) shellMaterialRef.current.uniforms.uTime.value = t;

    // pulse point light in sync with the shaders
    if (lightRef.current)
      lightRef.current.intensity = lightIntensity * (0.88 + 0.12 * Math.sin(t * 1.8));

    // billboard always faces the camera
    if (billboardRef.current) billboardRef.current.quaternion.copy(camera.quaternion);
  });

  return (
    <group position={position}>
      {/* opaque body — renders first, writes depth; glow layers additively blend on top */}
      {solid && (
        <mesh>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial color={solidColor} roughness={0.4} metalness={0.1} />
        </mesh>
      )}

      {/* layer 1 — core glowing sphere */}
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial color={'#ff0000'} />
        {/* <GlowMaterial ref={coreMaterialRef} color={color} intensity={1.5} /> */}
      </mesh>

      {/* layer 2 — halo: billboard plane (default) or sphere shell */}
      {haloType === 'billboard' ? (
        <mesh ref={billboardRef}>
          <planeGeometry args={[radius * haloRadiusMultiplier, radius * haloRadiusMultiplier]} />
          <shaderMaterial
            ref={billboardMaterialRef}
            vertexShader={billboardVert}
            fragmentShader={billboardFrag}
            uniforms={billboardUniforms}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ) : (
        <mesh>
          <sphereGeometry args={[radius * haloRadiusMultiplier, 64, 64]} />
          <GlowShellMaterial
            ref={shellMaterialRef}
            color={color}
            intensity={0.9}
            falloff={shellFalloff}
          />
        </mesh>
      )}

      {/* hidden point light — actual scene illumination */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={lightIntensity}
        distance={lightDistance}
        decay={0.1}
      />
    </group>
  );
};

export default GlowOrb;
