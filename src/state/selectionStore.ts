import { useSyncExternalStore } from 'react';
import type * as THREE from 'three';
import type { PropControl } from '../inspector/types';

/** A scene thing that can be selected and edited in the Inspector. */
export interface SelectableEntry {
  id: string;
  name: string;
  object: THREE.Object3D;
  /** Editable properties this object exposes (closures over its own refs). */
  schema: PropControl[];
}

interface SelectionState {
  selected: SelectableEntry | null;
}

type Listener = () => void;

/**
 * Minimal external store (zustand-shaped) that lives *outside* React's tree.
 *
 * R3F's <Canvas> runs its own reconciler, so a normal Context provider placed
 * outside the canvas isn't visible to in-canvas click handlers. An external
 * store sidesteps that entirely: both the in-canvas objects and the DOM
 * Inspector subscribe to the same source of truth. The API mirrors zustand's
 * (`getState` / `setState` / `subscribe`) so this can be swapped for zustand
 * later without touching any consumer.
 */
function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState(partial: Partial<T> | ((s: T) => Partial<T>)) {
      const next = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const store = createStore<SelectionState>({ selected: null });

/** Imperative API — callable from anywhere (in or out of React). */
export function select(entry: SelectableEntry): void {
  store.setState({ selected: entry });
}

export function clearSelection(): void {
  if (store.getState().selected) store.setState({ selected: null });
}

export function getSelection(): SelectableEntry | null {
  return store.getState().selected;
}

/** Subscribe a component to the current selection. */
export function useSelection(): SelectableEntry | null {
  return useSyncExternalStore(store.subscribe, () => store.getState().selected);
}
