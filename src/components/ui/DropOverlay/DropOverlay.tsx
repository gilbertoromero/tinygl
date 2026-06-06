import { useEffect, useState, type DragEvent } from 'react';
import { addModel } from '../../../state/sceneStore';
import './DropOverlay.css';

interface Props {
  /** Close the overlay (after a drop, Escape, or backdrop click). */
  onClose: () => void;
}

/** Inline "drop a model" glyph: a cube falling onto a baseline. Monochrome /
 *  currentColor so it inherits the overlay's color (and the hot-state glow).
 *  Placeholder art — easy to swap for a designed asset later. */
function DropModelIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* isometric cube */}
      <path d="M32 6 L46 14 L46 30 L32 38 L18 30 L18 14 Z" />
      <path d="M18 14 L32 22 L46 14" />
      <path d="M32 22 L32 38" />
      {/* downward arrow */}
      <path d="M32 42 L32 52" />
      <path d="M26 47 L32 53 L38 47" />
      {/* baseline / drop target */}
      <path d="M16 58 H48" />
    </svg>
  );
}

/**
 * Full-viewport drag-and-drop target for importing .glb models. Shown over the
 * scene while active; dragging a file in highlights the drop zone, and dropping
 * one (or several) adds each .glb to the scene store. Closes on drop, Escape, or
 * a backdrop click. The inner content is `pointer-events: none` so drag events
 * only target the root — the highlight stays stable instead of flickering as the
 * cursor crosses child elements.
 */
export default function DropOverlay({ onClose }: Props) {
  const [hot, setHot] = useState(false);

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!hot) setHot(true);
  };

  const onDragLeave = () => setHot(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setHot(false);
    const glbs = Array.from(e.dataTransfer.files).filter(
      (f) => /\.glb$/i.test(f.name) || f.type === 'model/gltf-binary',
    );
    glbs.forEach((f) => addModel(URL.createObjectURL(f), f.name));
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={`tg-dropoverlay${hot ? ' tg-dropoverlay--hot' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClose}
      role="button"
      tabIndex={-1}
      aria-label="Drop a .glb file to import it into the scene"
    >
      <div className="tg-dropoverlay__inner">
        <DropModelIcon className="tg-dropoverlay__icon" />
        <p className="tg-dropoverlay__hint">Drop a .glb to import</p>
      </div>
    </div>
  );
}
