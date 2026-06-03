import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PulseMaterial from '../../materials/PulseMaterial/PulseMaterial';

interface Props {
  position?: [number, number, number];
}

const NoiseSphere: React.FC<Props> = ({ position = [0, 0, 0] }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[2, 64, 64]} />
      <PulseMaterial ref={materialRef} />
    </mesh>
  );
};

export default NoiseSphere;
