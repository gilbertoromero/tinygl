import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useSelectable } from '../../inspector/useSelectable';
import type { PropControl } from '../../inspector/types';

interface Props {
  /** Stable id from the scene store — used as the selection key. */
  id: string;
  /** Object URL (blob:) for the imported .glb. */
  url: string;
  name: string;
  position?: [number, number, number];
}

/**
 * A selectable imported .glb. Loads the model with `useGLTF` (suspends until
 * ready — keep under a <Suspense> boundary) and clones the scene graph so each
 * instance is independent. Exposes a per-axis scale control to the Inspector and
 * registers for selection like the built-in primitives.
 *
 * Note: the viewport outline used by primitives needs a single mesh geometry, so
 * imported models (a group of meshes) don't draw one yet — selection still works
 * via the Inspector and Hierarchy highlight.
 */
const Model: React.FC<Props> = ({ id, url, name, position = [0, 0, 0] }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);

  // Clone so re-renders / multiple imports never share one object graph.
  const model = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  const schema = useMemo<PropControl[]>(
    () => [
      {
        key: 'scale',
        label: 'Scale',
        type: 'vector3',
        min: 0.01,
        max: 10,
        step: 0.01,
        get: () => {
          const s = groupRef.current?.scale;
          return s ? [s.x, s.y, s.z] : [1, 1, 1];
        },
        set: ([x, y, z]) => groupRef.current?.scale.set(x, y, z),
      },
    ],
    [],
  );

  const { onClick } = useSelectable(id, name, groupRef, schema);

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      <primitive object={model} />
    </group>
  );
};

export default Model;
