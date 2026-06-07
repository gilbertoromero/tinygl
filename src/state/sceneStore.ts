import { useSyncExternalStore } from 'react';
import { createStore } from './createStore';
import { DEFAULT_SHAPE, SHAPE_LABELS, type ShapeKind } from '../objects/shapes';

/** Fields every scene object shares. The store is the source of truth; the
 *  Scene renders one entity per entry and the Hierarchy lists them. */
interface BaseObject {
  id: string;
  name: string;
  position: [number, number, number];
  /** Layout slot (0,1,2…) → row position. Stored so occupancy *is* the truth:
   *  a freed slot is just one missing from the objects array. */
  slot: number;
}

/** A built-in primitive. */
export interface ShapeObject extends BaseObject {
  type: 'shape';
  kind: ShapeKind;
  color: string;
  /** Material id from the materials registry (defaults to the flat 'base'). */
  materialId: string;
}

/** An imported .glb model, referenced by an in-memory object URL. */
export interface ModelObject extends BaseObject {
  type: 'model';
  url: string;
}

export type SceneObject = ShapeObject | ModelObject;

interface SceneState {
  objects: SceneObject[];
  /** Last picked shape kind — drives the ShapeMenu trigger face. */
  activeKind: ShapeKind;
}

const DEFAULT_COLOR = '#00ff00';

let idSeq = 0;
// Per-kind counter so names read "Box 1", "Box 2", … and stay stable.
const kindCounts: Record<ShapeKind, number> = { box: 0, sphere: 0, pyramid: 0 };

/** Lowest unoccupied slot — the mex of the slots currently in use. Gap-filling:
 *  deleting a middle object frees its slot, and the next spawn reuses it rather
 *  than drifting outward. */
function nextFreeSlot(objects: SceneObject[]): number {
  const used = new Set(objects.map((o) => o.slot));
  let slot = 0;
  while (used.has(slot)) slot++;
  return slot;
}

/** Slot → row position, growing symmetrically out from the origin so adjacent
 *  slots don't overlap: 0 → center, then right, left, right… */
function slotPosition(slot: number): [number, number, number] {
  const dir = slot % 2 === 0 ? 1 : -1;
  return [dir * Math.ceil(slot / 2) * 2, 0, 0];
}

function makeShape(kind: ShapeKind, slot: number): ShapeObject {
  return {
    type: 'shape',
    id: `obj-${++idSeq}`,
    kind,
    name: `${SHAPE_LABELS[kind]} ${++kindCounts[kind]}`,
    position: slotPosition(slot),
    color: DEFAULT_COLOR,
    materialId: 'base',
    slot,
  };
}

const store = createStore<SceneState>({
  objects: [makeShape(DEFAULT_SHAPE, 0)],
  activeKind: DEFAULT_SHAPE,
});

/** Spawn a new primitive into the scene and remember the kind for the menu. */
export function addShape(kind: ShapeKind): ShapeObject {
  const obj = makeShape(kind, nextFreeSlot(store.getState().objects));
  store.setState((s) => ({ objects: [...s.objects, obj], activeKind: kind }));
  return obj;
}

/** Add an imported model. `url` is an object URL (blob:) for the .glb; `fileName`
 *  names the entry (extension stripped). */
export function addModel(url: string, fileName: string): ModelObject {
  const name = fileName.replace(/\.(glb|gltf)$/i, '') || 'Model';
  const slot = nextFreeSlot(store.getState().objects);
  const obj: ModelObject = {
    type: 'model',
    id: `obj-${++idSeq}`,
    name,
    position: slotPosition(slot),
    url,
    slot,
  };
  store.setState((s) => ({ objects: [...s.objects, obj] }));
  return obj;
}

/** Remove an object by id. Its slot frees automatically (occupancy is the
 *  objects array), so the next spawn gap-fills it. If it was selected, its entity
 *  unmounts and the selection registry clears the selection (see useSelectable
 *  cleanup). Imported models also release their object URL. */
export function removeObject(id: string): void {
  const obj = store.getState().objects.find((o) => o.id === id);
  if (obj?.type === 'model') URL.revokeObjectURL(obj.url);
  store.setState((s) => ({ objects: s.objects.filter((o) => o.id !== id) }));
}

export function getObjects(): SceneObject[] {
  return store.getState().objects;
}

/** Look up a single object by id (undefined if not present). */
export function getObject(id: string): SceneObject | undefined {
  return store.getState().objects.find((o) => o.id === id);
}

/** Assign a material (by registry id) to a shape. No-op for non-shape objects. */
export function setObjectMaterial(id: string, materialId: string): void {
  store.setState((s) => ({
    objects: s.objects.map((o) => (o.id === id && o.type === 'shape' ? { ...o, materialId } : o)),
  }));
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
