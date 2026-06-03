import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import NoiseMaterial from '../../materials/NoiseMaterial/NoiseMaterial';

interface Props {
  position?: [number, number, number];
}

const NoisePlane: React.FC<Props> = ({ position = [0, 0, 0] }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh position={position}>
      <planeGeometry args={[4, 4, 1, 1]} />
      <NoiseMaterial ref={materialRef} />
    </mesh>
  );
};

export default NoisePlane;
