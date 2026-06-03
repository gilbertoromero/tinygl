import { Canvas } from '@react-three/fiber';
import MenuShape from './MenuShape';
import type { ShapeKind } from '../../../objects/shapes';
import './ShapeMenuCanvas.css';

interface Slot {
  kind: ShapeKind;
  color: string;
  end: [number, number];
  ctrl: [number, number];
  delay: number;
}

/** Button center in the canvas's centered pixel space (origin = center, y up). */
const START: [number, number] = [0, 52];

/**
 * Fan layout: shapes drop from behind the button into a horizontal row below
 * it. Outer items curve out (ctrl offset sideways); the middle drops straight
 * (ctrl in line with start/end x). Each a different color.
 */
const SLOTS: Slot[] = [
  { kind: 'box', color: '#2dd4bf', end: [-80, -55], ctrl: [-80, 55], delay: 0.0 },
  { kind: 'sphere', color: '#f59e0b', end: [0, -55], ctrl: [0, 4], delay: 0.06 },
  { kind: 'cone', color: '#a78bfa', end: [80, -55], ctrl: [80, 55], delay: 0.12 },
];

interface Props {
  onPick: (kind: ShapeKind) => void;
  onClose: () => void;
}

/**
 * Transparent overlay Canvas that renders the 3D shape menu. Orthographic,
 * pixel-mapped (1 unit ≈ 1px, origin centered) so slots line up with the DOM.
 * Sits behind the trigger button (z-index) so shapes emerge from under it.
 */
export default function ShapeMenuCanvas({ onPick, onClose }: Props) {
  return (
    <div className="tg-shapemenu__canvas">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 200], zoom: 1, near: 0.1, far: 1000 }}
        gl={{ alpha: true, antialias: true }}
        onPointerMissed={onClose}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[60, 120, 200]} intensity={1.6} />
        {SLOTS.map((s) => (
          <MenuShape
            key={s.kind}
            kind={s.kind}
            color={s.color}
            start={START}
            ctrl={s.ctrl}
            end={s.end}
            delay={s.delay}
            onPick={onPick}
          />
        ))}
      </Canvas>
    </div>
  );
}
