import { useSyncExternalStore } from 'react';
import { createStore } from './createStore';
import { DEFAULT_SHAPE, SHAPE_LABELS, type ShapeKind } from '../objects/shapes';

/** One primitive living in the scene. The store is the source of truth; the
 *  Scene renders one <Shape> per entry and the Hierarchy lists them. */
export interface SceneObject {
  id: string;
  kind: ShapeKind;
  name: string;
  position: [number, number, number];
  color: string;
}

interface SceneState {
  objects: SceneObject[];
  /** Last picked kind — drives the ShapeMenu trigger face. */
  activeKind: ShapeKind;
}

const DEFAULT_COLOR = '#00ff00';

let idSeq = 0;
let created = 0; // total spawned, for spacing
// Per-kind counter so names read "Box 1", "Box 2", … and stay stable.
const kindCounts: Record<ShapeKind, number> = { box: 0, sphere: 0, pyramid: 0 };

/** Build a fresh scene object, placed on a row that grows symmetrically out
 *  from the origin so successive shapes don't overlap. */
function makeObject(kind: ShapeKind): SceneObject {
  const slot = created++;
  const dir = slot % 2 === 0 ? 1 : -1; // 0 → center, then right, left, right…
  const x = dir * Math.ceil(slot / 2) * 2;
  return {
    id: `obj-${++idSeq}`,
    kind,
    name: `${SHAPE_LABELS[kind]} ${++kindCounts[kind]}`,
    position: [x, 0, 0],
    color: DEFAULT_COLOR,
  };
}

const store = createStore<SceneState>({
  objects: [makeObject(DEFAULT_SHAPE)],
  activeKind: DEFAULT_SHAPE,
});

/** Spawn a new primitive into the scene and remember the kind for the menu. */
export function addShape(kind: ShapeKind): SceneObject {
  const obj = makeObject(kind);
  store.setState((s) => ({ objects: [...s.objects, obj], activeKind: kind }));
  return obj;
}

/** Remove a primitive by id. If it was selected, its <Shape> unmounts and the
 *  selection registry clears the selection (see useSelectable cleanup). */
export function removeShape(id: string): void {
  store.setState((s) => ({ objects: s.objects.filter((o) => o.id !== id) }));
}

export function getObjects(): SceneObject[] {
  return store.getState().objects;
}

/** Subscribe a component to the list of scene objects. */
export function useObjects(): SceneObject[] {
  return useSyncExternalStore(store.subscribe, () => store.getState().objects);
}

export function getShape(): ShapeKind {
  return store.getState().activeKind;
}

/** Subscribe a component to the last-picked shape kind (the menu trigger face). */
export function useShape(): ShapeKind {
  return useSyncExternalStore(store.subscribe, () => store.getState().activeKind);
}
