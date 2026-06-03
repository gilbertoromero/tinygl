import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import GlowMaterial from '../../materials/GlowMaterial/GlowMaterial';

interface Props {
  position?: [number, number, number];
  color?: THREE.ColorRepresentation;
  radius?: number;
  lightIntensity?: number;
  lightDistance?: number;
}

const GlowSphere: React.FC<Props> = ({
  position = [0, 0, 0],
  color = '#00aaff',
  radius = 0.5,
  lightIntensity = 4,
  lightDistance = 8,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }

    // pulse the hidden light in sync with the shader
    if (lightRef.current) {
      lightRef.current.intensity = lightIntensity * (0.88 + 0.12 * Math.sin(t * 1.8));
    }
  });

  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <GlowMaterial ref={materialRef} color={color} intensity={1.5} />
      </mesh>

      {/* hidden point light — sits at the sphere's origin and illuminates surroundings */}
      <pointLight
        ref={lightRef}
        color={color}
        intensity={lightIntensity}
        distance={lightDistance}
        decay={2}
      />
    </group>
  );
};

export default GlowSphere;
