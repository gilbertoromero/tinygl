import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Outlines } from '@react-three/drei';
import { useSelectable } from '../../inspector/useSelectable';
import type { PropControl } from '../../inspector/types';
import BaseMaterial from '../../materials/BaseMaterial/BaseMaterial';
import { SHAPE_LABELS, type ShapeKind } from '../shapes';

interface Props {
  /** Stable id from the scene store — used as the selection key. */
  id: string;
  kind: ShapeKind;
  position?: [number, number, number];
  color?: THREE.ColorRepresentation;
  name?: string;
}

function ShapeGeometry({ kind }: { kind: ShapeKind }) {
  switch (kind) {
    case 'box':
      return <boxGeometry args={[1, 1, 1]} />;
    case 'sphere':
      return <sphereGeometry args={[0.7, 32, 32]} />;
    case 'pyramid':
      // 4-sided cone = square-base pyramid
      return <coneGeometry args={[0.8, 1.4, 4]} />;
  }
}

/**
 * A selectable primitive. Owns a mesh + material and declares its editable
 * props (per-axis scale, color) as a schema for the Inspector. Geometry is
 * chosen by `kind`; everything else is shared across shapes. Edits write
 * straight to the THREE objects via refs — no per-frame React state.
 */
const Shape: React.FC<Props> = ({ id, kind, position = [0, 0, 0], color = '#00ff00', name }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const schema = useMemo<PropControl[]>(
    () => [
      {
        key: 'position',
        label: 'Position',
        type: 'vector3',
        min: -10,
        max: 10,
        step: 0.1,
        get: () => {
          const p = meshRef.current?.position;
          return p ? [p.x, p.y, p.z] : [0, 0, 0];
        },
        set: ([x, y, z]) => meshRef.current?.position.set(x, y, z),
      },
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

  const { isSelected, onClick } = useSelectable(id, name ?? SHAPE_LABELS[kind], meshRef, schema);

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow onClick={onClick}>
      <ShapeGeometry kind={kind} />
      <BaseMaterial ref={matRef} color={color} />
      {isSelected && <Outlines thickness={2.0} color="#ffffff" />}
    </mesh>
  );
};

export default Shape;
