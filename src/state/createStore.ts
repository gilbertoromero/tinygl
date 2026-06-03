type Listener = () => void;

export interface Store<T extends object> {
  getState: () => T;
  setState: (partial: Partial<T> | ((s: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
}

/**
 * Minimal external store (zustand-shaped) that lives *outside* React's tree.
 *
 * R3F's <Canvas> runs its own reconciler, so a normal Context provider placed
 * outside the canvas isn't visible to in-canvas code. An external store
 * sidesteps that: both the DOM UI and in-canvas objects subscribe to the same
 * source of truth. The API mirrors zustand's (`getState`/`setState`/`subscribe`)
 * so any of these stores can be swapped for zustand later without touching
 * consumers — read them with React 18's `useSyncExternalStore`.
 */
export function createStore<T extends object>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    setState(partial) {
      const next = typeof partial === 'function' ? partial(state) : partial;
      state = { ...state, ...next };
      listeners.forEach((l) => l());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
