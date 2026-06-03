import { useState } from 'react';
import { clearSelection, useSelection } from '../../state/selectionStore';
import type { ColorControl, NumberControl, PropControl, Vector3Control } from '../../inspector/types';
import './index.css';

/**
 * Generic, schema-driven inspector. Reads the current selection from the
 * external store and renders one control per property descriptor — so it works
 * for *any* selectable object, not just cubes. Edits mutate the underlying
 * THREE objects directly through the schema's setters.
 */
export default function Inspector() {
  const selected = useSelection();
  if (!selected) return null;

  return (
    <div className="tg-panel ins-panel">
      <div className="ins-header">
        <p className="tg-title">{selected.name}</p>
        <button
          type="button"
          className="tg-btn ins-close"
          onClick={clearSelection}
          title="Deselect"
          aria-label="Deselect"
        >
          ×
        </button>
      </div>

      {selected.schema.map((control) => (
        // Keyed by selection id so controls remount (and re-read values) when
        // the selected object changes.
        <Control key={`${selected.id}:${control.key}`} control={control} />
      ))}
    </div>
  );
}

function Control({ control }: { control: PropControl }) {
  switch (control.type) {
    case 'number':
      return <NumberRow control={control} />;
    case 'vector3':
      return <Vector3Row control={control} />;
    case 'color':
      return <ColorRow control={control} />;
  }
}

function NumberRow({ control }: { control: NumberControl }) {
  const [v, setV] = useState(control.get());
  const update = (n: number) => {
    if (Number.isNaN(n)) return;
    setV(n);
    control.set(n);
  };
  return (
    <div className="ins-field">
      <span className="tg-label ins-label">{control.label}</span>
      <div className="ins-input-group">
        <input
          type="range"
          className="tg-range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={v}
          onChange={(e) => update(parseFloat(e.target.value))}
        />
        <input
          type="number"
          className="tg-input ins-num"
          min={control.min}
          max={control.max}
          step={control.step}
          value={v}
          onChange={(e) => update(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
}

const AXES = ['X', 'Y', 'Z'] as const;

function Vector3Row({ control }: { control: Vector3Control }) {
  const [v, setV] = useState(control.get());
  const updateAxis = (i: number, n: number) => {
    if (Number.isNaN(n)) return;
    const next = [...v] as [number, number, number];
    next[i] = n;
    setV(next);
    control.set(next);
  };
  return (
    <div className="ins-field">
      <span className="tg-label ins-label">{control.label}</span>
      {AXES.map((ax, i) => (
        <div className="ins-axis" key={ax}>
          <span className={`ins-axis-label ins-axis-${ax.toLowerCase()}`}>{ax}</span>
          <input
            type="range"
            className="tg-range"
            min={control.min}
            max={control.max}
            step={control.step}
            value={v[i]}
            onChange={(e) => updateAxis(i, parseFloat(e.target.value))}
          />
          <input
            type="number"
            className="tg-input ins-num"
            min={control.min}
            max={control.max}
            step={control.step}
            value={v[i]}
            onChange={(e) => updateAxis(i, parseFloat(e.target.value))}
          />
        </div>
      ))}
    </div>
  );
}

function ColorRow({ control }: { control: ColorControl }) {
  const [v, setV] = useState(control.get());
  const update = (hex: string) => {
    setV(hex);
    control.set(hex);
  };
  return (
    <div className="ins-field">
      <span className="tg-label ins-label">{control.label}</span>
      <div className="ins-input-group">
        <input type="color" className="ins-color" value={v} onChange={(e) => update(e.target.value)} />
        <input
          type="text"
          className="tg-input ins-num ins-hex"
          value={v}
          onChange={(e) => update(e.target.value)}
        />
      </div>
    </div>
  );
}
