import { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import type { ShapeKind } from '../../../objects/shapes';

const DURATION = 0.42; // seconds to travel the path
const SIZE = 38; // final px size (geometry is unit-sized, scaled to this)

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface Props {
  kind: ShapeKind;
  color: string;
  /** All points in centered pixel space (origin = canvas center, y up). */
  start: [number, number];
  ctrl: [number, number];
  end: [number, number];
  /** Stagger, in seconds. */
  delay: number;
  onPick: (kind: ShapeKind) => void;
}

/**
 * One menu shape: a unit primitive that flies along a quadratic bézier from
 * behind the button (`start`) to its slot (`end`), curving via `ctrl`. Eased
 * cubic-out, scales up from 0 as it emerges, idles with a slow spin.
 */
export default function MenuShape({ kind, color, start, ctrl, end, delay, onPick }: Props) {
  const ref = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const [hovered, setHovered] = useState(false);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    elapsed.current += dt;

    const local = Math.min(Math.max((elapsed.current - delay) / DURATION, 0), 1);
    const t = easeOutCubic(local);
    const mt = 1 - t;

    // quadratic bézier B(t) = (1-t)²·start + 2(1-t)t·ctrl + t²·end
    mesh.position.set(
      mt * mt * start[0] + 2 * mt * t * ctrl[0] + t * t * end[0],
      mt * mt * start[1] + 2 * mt * t * ctrl[1] + t * t * end[1],
      0,
    );

    mesh.scale.setScalar(t * SIZE * (hovered ? 1.15 : 1));
    mesh.rotation.x = 0.32;
    mesh.rotation.y += dt * (hovered ? 2.6 : 1.0);
  });

  return (
    <mesh
      ref={ref}
      scale={0}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onPick(kind);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {kind === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {kind === 'sphere' && <sphereGeometry args={[0.62, 24, 24]} />}
      {kind === 'cone' && <coneGeometry args={[0.62, 1.3, 24]} />}
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
    </mesh>
  );
}
