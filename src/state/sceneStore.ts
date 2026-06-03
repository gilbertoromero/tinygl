import { useSyncExternalStore } from 'react';
import { createStore } from './createStore';
import { clearSelection } from './selectionStore';
import { DEFAULT_SHAPE, type ShapeKind } from '../objects/shapes';

interface SceneState {
  /** The active primitive rendered in the Scene. */
  shape: ShapeKind;
}

const store = createStore<SceneState>({ shape: DEFAULT_SHAPE });

export function setShape(shape: ShapeKind): void {
  if (store.getState().shape === shape) return;
  // The current primitive will unmount on swap — drop any selection pointing at it.
  clearSelection();
  store.setState({ shape });
}

export function getShape(): ShapeKind {
  return store.getState().shape;
}

/** Subscribe a component to the active shape. */
export function useShape(): ShapeKind {
  return useSyncExternalStore(store.subscribe, () => store.getState().shape);
}
