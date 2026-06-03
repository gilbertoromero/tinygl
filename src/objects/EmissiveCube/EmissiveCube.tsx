import React, { useRef } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import emissiveUrl from '../../textures/gemini_emissive.png';

interface Props {
  position?: [number, number, number];
  size?: [number, number, number];
  color?: THREE.ColorRepresentation;
  emissiveColor?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
}

const EmissiveCube: React.FC<Props> = ({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = '#ffffff',
  emissiveColor = '#ffffff',
  emissiveIntensity = 1.0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const emissiveMap = useTexture(emissiveUrl);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        emissive={emissiveColor}
        emissiveMap={emissiveMap}
        emissiveIntensity={emissiveIntensity}
        roughness={0.6}
        metalness={0.0}
      />
    </mesh>
  );
};

export default EmissiveCube;
