import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type * as THREE from 'three';

import BaseMaterial from './BaseMaterial/BaseMaterial';
import AuraMaterial from './AuraMaterial/AuraMaterial';
import DissolveMaterial from './DissolveMaterial/DissolveMaterial';
import GlowMaterial from './GlowMaterial/GlowMaterial';
import GlowShellMaterial from './GlowShellMaterial/GlowShellMaterial';
import NoiseMaterial from './NoiseMaterial/NoiseMaterial';
import PulseMaterial from './PulseMaterial/PulseMaterial';

/**
 * Common shape of a material when used by a Shape: it forwards a ref to a
 * THREE.Material and optionally takes a `color`. Individual materials are more
 * specific (some forward a MeshBasicMaterial, some a ShaderMaterial; some ignore
 * `color`) — they're cast to this when registered, so Shape can render any of
 * them through one code path without importing them all.
 */
export type ShapeMaterial = ForwardRefExoticComponent<
  { color?: THREE.ColorRepresentation } & RefAttributes<THREE.Material>
>;

/**
 * Catalogue of the materials in this folder. This is the single source of truth:
 * the header Materials menu reads `id`/`name`, and Shape renders `component` by
 * id. Adding a material = one entry here, nothing else to touch.
 */
export interface MaterialDef {
  /** Stable key, also stored on shapes in the scene store. */
  id: string;
  /** Shown under the icon in the menu. */
  name: string;
  /** The material element to render inside a shape's mesh. */
  component: ShapeMaterial;
}

export const MATERIALS: MaterialDef[] = [
  { id: 'base', name: 'Base', component: BaseMaterial as unknown as ShapeMaterial },
  { id: 'aura', name: 'Aura', component: AuraMaterial as unknown as ShapeMaterial },
  { id: 'dissolve', name: 'Dissolve', component: DissolveMaterial as unknown as ShapeMaterial },
  { id: 'glow', name: 'Glow', component: GlowMaterial as unknown as ShapeMaterial },
  {
    id: 'glow-shell',
    name: 'Glow Shell',
    component: GlowShellMaterial as unknown as ShapeMaterial,
  },
  { id: 'noise', name: 'Noise', component: NoiseMaterial as unknown as ShapeMaterial },
  { id: 'pulse', name: 'Pulse', component: PulseMaterial as unknown as ShapeMaterial },
];

const BY_ID = new Map(MATERIALS.map((m) => [m.id, m]));

/** Look up a material by id, falling back to the flat 'base' material. */
export function getMaterialDef(id: string): MaterialDef {
  return BY_ID.get(id) ?? BY_ID.get('base')!;
}
