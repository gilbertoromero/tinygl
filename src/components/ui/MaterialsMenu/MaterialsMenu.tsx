import { useEffect, useRef, useState } from 'react';
import HeaderButton from '../HeaderButton/HeaderButton';
import { MaterialsIcon } from '../icons/MaterialsIcon';
import { MATERIALS } from '../../../materials/registry';
import { getObject, setObjectMaterial } from '../../../state/sceneStore';
import { useSelection } from '../../../state/selectionStore';
import './MaterialsMenu.css';

/**
 * Header materials menu. The trigger is a DOM button showing a shaded material
 * ball; opening it reveals the material options stacked below (reusing
 * HeaderButton so they share the floating panel look). Hybrid reveal — opens on
 * hover *or* click (click pins it for touch/keyboard); closes on mouse-leave,
 * Escape, outside click, or after a pick.
 *
 * The panel lists every material from the registry as a card (shared shaded-ball
 * icon + name footer). Picking one assigns it to the selected shape (the panel
 * is inert when nothing assignable is selected); the active material is marked.
 */
export default function MaterialsMenu() {
  const selected = useSelection();
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hovered || pinned;
  const ref = useRef<HTMLDivElement>(null);

  // Only shapes carry a swappable material; models keep their imported ones.
  const selectedShape =
    selected && getObject(selected.id)?.type === 'shape' ? getObject(selected.id) : undefined;
  const activeMaterial = selectedShape?.type === 'shape' ? selectedShape.materialId : undefined;

  const close = () => {
    setHovered(false);
    setPinned(false);
  };

  const choose = (id: string) => {
    if (selectedShape) setObjectMaterial(selectedShape.id, id);
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
          {!selectedShape && (
            <p className="tg-materialsmenu__hint">Select a shape to apply a material.</p>
          )}
          {MATERIALS.map((mat) => (
            <button
              key={mat.id}
              type="button"
              className={`tg-material-card${mat.id === activeMaterial ? ' tg-material-card--active' : ''}`}
              role="menuitemradio"
              aria-checked={mat.id === activeMaterial}
              disabled={!selectedShape}
              title={mat.name}
              onClick={() => choose(mat.id)}
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
