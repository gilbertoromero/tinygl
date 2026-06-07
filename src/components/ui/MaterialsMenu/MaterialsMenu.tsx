import { useEffect, useRef, useState } from 'react';
import HeaderButton from '../HeaderButton/HeaderButton';
import { MaterialsIcon } from '../icons/MaterialsIcon';
import { MATERIALS } from '../../../materials/registry';
import './MaterialsMenu.css';

/**
 * Header materials menu. The trigger is a DOM button showing a shaded material
 * ball; opening it reveals the material options stacked below (reusing
 * HeaderButton so they share the floating panel look). Hybrid reveal — opens on
 * hover *or* click (click pins it for touch/keyboard); closes on mouse-leave,
 * Escape, outside click, or after a pick.
 *
 * The panel lists every material from the registry as a card (shared shaded-ball
 * icon + name footer). Picking one is a no-op for now — apply-to-selection comes
 * next.
 */
export default function MaterialsMenu() {
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;
  const ref = useRef<HTMLDivElement>(null);

  const close = () => {
    setHovered(false);
    setPinned(false);
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
      className="tg-materialsmenu"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <HeaderButton
        icon={<MaterialsIcon size={52} />}
        title="Materials"
        label="Choose material"
        active={open}
        onClick={() => setPinned((p) => !p)}
      />

      {open && (
        <div className="tg-materialsmenu__options" role="menu">
          {MATERIALS.map((mat) => (
            <button
              key={mat.id}
              type="button"
              className="tg-material-card"
              role="menuitem"
              title={mat.name}
            >
              <MaterialsIcon size={40} className="tg-material-card__icon" />
              <span className="tg-material-card__name">{mat.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
