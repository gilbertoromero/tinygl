import { useEffect } from 'react';
import { removeShape, useObjects } from '../../../state/sceneStore';
import { getSelection, selectById, useSelection } from '../../../state/selectionStore';
import UIButton from '../UIButton/UIButton';
import { SvgIcon } from '../icons/SvgIcon';
import trashUrl from '../../../assets/icons/trash.svg';
import './Hierarchy.css';

/**
 * Left-aligned scene outliner. Lists every object the scene holds (from the
 * scene store) and lets you select one — clicking a row makes it the active
 * selection, so the Inspector opens and the viewport outline appears. The
 * selected row is highlighted and gains a trash button (and responds to the
 * Delete key) for removing the object.
 */
export default function Hierarchy() {
  const objects = useObjects();
  const selected = useSelection();

  // Delete the selected object with the Delete / Backspace key — but never while
  // typing in an input (e.g. the Inspector fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) {
        return;
      }
      const sel = getSelection();
      if (!sel) return;
      e.preventDefault();
      removeShape(sel.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="tg-panel hier-panel">
      <p className="tg-title hier-title">Hierarchy</p>

      {objects.length === 0 ? (
        <p className="hier-empty">No objects yet</p>
      ) : (
        <ul className="hier-list">
          {objects.map((o) => {
            const active = selected?.id === o.id;
            return (
              <li key={o.id} className={`hier-item${active ? ' hier-item--active' : ''}`}>
                <button type="button" className="hier-row" onClick={() => selectById(o.id)}>
                  {o.name}
                </button>
                {active && (
                  <UIButton
                    icon={<SvgIcon src={trashUrl} size={14} />}
                    title="Delete"
                    label={`Delete ${o.name}`}
                    onClick={() => removeShape(o.id)}
                    iconColor="#9e5a5a"
                    borderColor="rgba(255, 68, 68, 0.28)"
                    iconHighlightColor="var(--tg-bad)"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
