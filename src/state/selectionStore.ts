import { useSyncExternalStore } from 'react';
import type * as THREE from 'three';
import type { PropControl } from '../inspector/types';
import { createStore } from './createStore';

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
