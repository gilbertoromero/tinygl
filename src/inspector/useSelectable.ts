import { useCallback, useEffect, type RefObject } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import type * as THREE from 'three';
import { registerSelectable, selectById, useSelection } from '../state/selectionStore';
import type { SelectableEntry } from '../state/selectionStore';
import type { PropControl } from './types';

interface UseSelectableResult {
  /** True when this object is the current selection (drive outlines off this). */
  isSelected: boolean;
  /** Spread onto the object's mesh: `<mesh onClick={onClick}>`. */
  onClick: (e: ThreeEvent<MouseEvent>) => void;
}

/**
 * Opt an object into selection. The object passes a ref to the Object3D it owns
 * and a `schema` describing its editable props; clicking it makes it the active
 * selection so the Inspector can edit those props.
 *
 * `schema` should be memoized by the caller (its getters/setters close over
 * stable refs), so it's intentionally read fresh at click time rather than
 * tracked as a dependency.
 */
export function useSelectable(
  id: string,
  name: string,
  ref: RefObject<THREE.Object3D>,
  schema: PropControl[],
): UseSelectableResult {
  const selected = useSelection();
  const isSelected = selected?.id === id;

  // Register so the object can be selected by id (e.g. from the Hierarchy), not
  // only by clicking it. Runs after mount, when `ref.current` is populated; the
  // returned cleanup unregisters (and deselects) on unmount.
  useEffect(() => {
    if (!ref.current) return;
    const entry: SelectableEntry = { id, name, object: ref.current, schema };
    return registerSelectable(entry);
  }, [id, name, ref, schema]);

  const onClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      selectById(id);
    },
    [id],
  );

  return { isSelected, onClick };
}
