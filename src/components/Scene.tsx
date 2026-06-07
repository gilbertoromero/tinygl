import React, { Suspense } from 'react';
import Shape from '../objects/Shape/Shape';
import Model from '../objects/Model/Model';
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

      {/* One entity per store object; keyed by id so each is stable across adds/removes.
          Each model gets its own Suspense so loading one doesn't blank the scene. */}
      {objects.map((o) =>
        o.type === 'model' ? (
          <Suspense key={o.id} fallback={null}>
            <Model id={o.id} url={o.url} name={o.name} position={o.position} />
          </Suspense>
        ) : (
          <Shape
            key={o.id}
            id={o.id}
            kind={o.kind}
            name={o.name}
            position={o.position}
            color={o.color}
            materialId={o.materialId}
          />
        ),
      )}
    </>
  );
};

export default Scene;
