import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DissolveMaterial from '../../materials/DissolveMaterial/DissolveMaterial';

interface Props {
  position?: [number, number, number];
  color?: string;
  /** Seconds to fully dissolve once clicked. */
  duration?: number;
}

/**
 * Clickable cube that dissolves away using the reusable DissolveMaterial.
 * Clicking triggers the effect; useFrame ramps uProgress 0 -> 1 over `duration`.
 */
const DissolveObject: React.FC<Props> = ({
  position = [0, 0, 0],
  color = '#ff6622',
  duration = 2.0,
}) => {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const [dissolving, setDissolving] = useState(false);

  useFrame((_, delta) => {
    if (!dissolving || !matRef.current) return;
    const u = matRef.current.uniforms.uProgress;
    u.value = Math.min(u.value + delta / duration, 1.0);
  });

  return (
    <mesh
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setDissolving(true);
      }}
    >
      <boxGeometry args={[2, 2, 2]} />
      <DissolveMaterial ref={matRef} color={color} noiseScale={2.0} />
    </mesh>
  );
};

export default DissolveObject;
