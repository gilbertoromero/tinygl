import React, { useId, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Outlines } from '@react-three/drei';
import { useSelectable } from '../../inspector/useSelectable';
import type { PropControl } from '../../inspector/types';

interface Props {
  position?: [number, number, number];
  size?: [number, number, number];
  color?: THREE.ColorRepresentation;
  name?: string;
}

/**
 * A selectable cube. It owns a mesh + material and declares its editable props
 * (per-axis scale, color) as a schema; the Inspector renders and mutates them.
 * Edits write straight to the THREE objects via refs — no per-frame React state.
 */
const Cube: React.FC<Props> = ({
  position = [0, 0, 0],
  size = [1, 1, 1],
  color = '#00ff00',
  name = 'Cube',
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const id = useId();

  const schema = useMemo<PropControl[]>(
    () => [
      {
        key: 'scale',
        label: 'Scale',
        type: 'vector3',
        min: 0.1,
        max: 5,
        step: 0.01,
        get: () => {
          const s = meshRef.current?.scale;
          return s ? [s.x, s.y, s.z] : [1, 1, 1];
        },
        set: ([x, y, z]) => meshRef.current?.scale.set(x, y, z),
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        get: () => `#${matRef.current?.color.getHexString() ?? 'ffffff'}`,
        set: (hex) => matRef.current?.color.set(hex),
      },
    ],
    [],
  );

  const { isSelected, onClick } = useSelectable(id, name, meshRef, schema);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow onClick={onClick}>
      <boxGeometry args={size} />
      <meshStandardMaterial ref={matRef} color={color} roughness={0.6} metalness={0.0} />
      {isSelected && <Outlines thickness={2.0} color="#ffffff" />}
    </mesh>
  );
};

export default Cube;
