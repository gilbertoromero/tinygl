import React from 'react';
import Cube from '../objects/Cube/Cube';
import { Environment } from '@react-three/drei/core/Environment';

const Scene: React.FC = () => {
  return (
    <>
      {/* <ambientLight intensity={0.5} /> */}
      <Environment preset="apartment" background={false} />
      {/* floor — receives point light spill from GlowOrb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.8} metalness={0.1} />
      </mesh>

      <Cube position={[0, 0, 0]} color="#00ff00" />
    </>
  );
};

export default Scene;
