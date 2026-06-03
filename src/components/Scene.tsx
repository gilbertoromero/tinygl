import React from 'react';
import GlowOrb from '../objects/GlowOrb/GlowOrb';
import EmissiveCube from '../objects/EmissiveCube/EmissiveCube';
import GameObject from '../objects/GameObject/GameObject';
import DissolveObject from '../objects/DissolveObject/DissolveObject';
import { Environment } from '@react-three/drei/core/Environment';
import lightsaberUrl from '../models/anakins_lightsaber.glb?url';

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

      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#00ff00"
          roughness={0.6}
          metalness={0.0}
          emissive={0x00ff00}
          emissiveIntensity={0.0}
        />
      </mesh>
    </>
  );
};

export default Scene;
