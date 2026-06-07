import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useSelectable } from '../../inspector/useSelectable';
import type { PropControl } from '../../inspector/types';
import { getObject } from '../../state/sceneStore';
import { getMaterialDef } from '../../materials/registry';
import { SHAPE_LABELS, type ShapeKind } from '../shapes';

interface Props {
  /** Stable id from the scene store — used as the selection key. */
  id: string;
  kind: ShapeKind;
  position?: [number, number, number];
  color?: THREE.ColorRepresentation;
  /** Material registry id; selects which material to render. */
  materialId?: string;
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
 * A selectable primitive. Owns a mesh + a swappable material and declares its
 * editable props (position, scale, material, color) as a schema for the
 * Inspector. Geometry is chosen by `kind`; the material by `materialId`. Edits
 * write straight to the THREE objects via refs — no per-frame React state.
 */
const Shape: React.FC<Props> = ({
  id,
  kind,
  position = [0, 0, 0],
  color = '#00ff00',
  materialId = 'base',
  name,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Holds whichever material is active (MeshBasicMaterial or a ShaderMaterial).
  const matRef = useRef<THREE.Material>(null);

  // Drive any shader material's clock; harmless for the flat base material.
  useFrame(({ clock }) => {
    const uniforms = (matRef.current as THREE.ShaderMaterial | null)?.uniforms;
    if (uniforms?.uTime) uniforms.uTime.value = clock.elapsedTime;
  });

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
        key: 'material',
        label: 'Material',
        type: 'material',
        // Read live from the store so the menu's assignment shows up here.
        get: () => {
          const o = getObject(id);
          return o?.type === 'shape' ? o.materialId : 'base';
        },
      },
      {
        key: 'color',
        label: 'Color',
        type: 'color',
        // Works for both the basic material (.color) and shader materials
        // exposing a uColor uniform; a no-op for materials without either.
        get: () => {
          const m = matRef.current;
          const basic = m as THREE.MeshBasicMaterial | null;
          if (basic?.color) return `#${basic.color.getHexString()}`;
          const uc = (m as THREE.ShaderMaterial | null)?.uniforms?.uColor?.value as
            | THREE.Color
            | undefined;
          return uc ? `#${uc.getHexString()}` : '#ffffff';
        },
        set: (hex) => {
          const m = matRef.current;
          const basic = m as THREE.MeshBasicMaterial | null;
          if (basic?.color) {
            basic.color.set(hex);
            return;
          }
          const uc = (m as THREE.ShaderMaterial | null)?.uniforms?.uColor?.value as
            | THREE.Color
            | undefined;
          uc?.set(hex);
        },
      },
    ],
    [id],
  );

  const { onClick } = useSelectable(id, name ?? SHAPE_LABELS[kind], meshRef, schema);

  // Material is chosen by id from the registry — Shape stays decoupled from the
  // individual material implementations.
  const Material = getMaterialDef(materialId).component;

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow onClick={onClick}>
      <ShapeGeometry kind={kind} />
      <Material ref={matRef} color={color} />
    </mesh>
  );
};

export default Shape;
