/**
 * Property descriptors. An object declares what's editable as *data* (getters +
 * setters over its own refs); the Inspector renders a control per descriptor.
 * This is what lets one panel edit *any* object — add a new `type` here and a
 * matching row in the Inspector to extend the whole engine at once.
 */

interface BaseControl {
  /** Unique within an object's schema. */
  key: string;
  label: string;
}

export interface NumberControl extends BaseControl {
  type: 'number';
  get: () => number;
  set: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export interface Vector3Control extends BaseControl {
  type: 'vector3';
  get: () => [number, number, number];
  set: (v: [number, number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export interface ColorControl extends BaseControl {
  type: 'color';
  /** Hex string, e.g. "#00ff00". */
  get: () => string;
  set: (v: string) => void;
}

export type PropControl = NumberControl | Vector3Control | ColorControl;
