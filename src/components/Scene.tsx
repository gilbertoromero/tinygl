import React from 'react';
import Shape from '../objects/Shape/Shape';
import { useObjects } from '../state/sceneStore';
import { Environment } from '@react-three/drei/core/Environment';

const Scene: React.FC = () => {
  const objects = useObjects();

  return (
    <>
      {/* <ambientLight intensity={0.5} /> */}
      <Environment preset="apartment" background={false} />
      {/* floor — receives point light spill from GlowOrb */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* One <Shape> per store object; keyed by id so each is stable across adds/removes */}
      {objects.map((o) => (
        <Shape
          key={o.id}
          id={o.id}
          kind={o.kind}
          name={o.name}
          position={o.position}
          color={o.color}
        />
      ))}
    </>
  );
};

export default Scene;
