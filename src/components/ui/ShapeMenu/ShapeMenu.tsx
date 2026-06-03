import { useEffect, useRef, useState, type FC } from 'react';
import HeaderButton from '../HeaderButton/HeaderButton';
import { CubeIcon } from '../icons/CubeIcon';
import { SphereIcon } from '../icons/SphereIcon';
import { PyramidIcon } from '../icons/PyramidIcon';
import ShapeMenuCanvas from './ShapeMenuCanvas';
import { setShape, useShape } from '../../../state/sceneStore';
import type { ShapeKind } from '../../../objects/shapes';
import './ShapeMenu.css';

type IconComponent = FC<{ size?: number; rotate?: number; className?: string }>;

/** Trigger face shows the active shape. */
const ICONS: Record<ShapeKind, IconComponent> = {
  box: CubeIcon,
  sphere: SphereIcon,
  pyramid: PyramidIcon,
};

/**
 * Header shape picker. The DOM button is the trigger; opening it reveals a 3D
 * overlay where the primitives fly out from behind the button. Hybrid reveal:
 * opens on hover *or* click (click pins it for touch/keyboard); closes on
 * mouse-leave, Escape, outside click, or after a pick.
 */
export default function ShapeMenu() {
  const shape = useShape();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;
  const ref = useRef<HTMLDivElement>(null);

  const TriggerIcon = ICONS[shape];

  const close = () => {
    setHovered(false);
    setPinned(false);
  };

  const choose = (kind: ShapeKind) => {
    setShape(kind);
    close();
  };

  // While open, close on Escape or a click/tap outside (covers pinned + touch).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="tg-shapemenu"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <HeaderButton
        icon={<TriggerIcon rotate={20} size={52} />}
        title="Shapes"
        label="Choose shape"
        active={open}
        onClick={() => setPinned((p) => !p)}
      />

      {open && <ShapeMenuCanvas onPick={choose} onClose={close} />}
    </div>
  );
}
