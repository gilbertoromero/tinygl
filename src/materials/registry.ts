/**
 * Catalogue of the materials in this folder, used to populate the header
 * Materials menu. For now each entry is just an id + display name; the menu
 * shows a shared icon per material with the name as a footer. Add a `component`
 * / apply hook here later when materials can be assigned to selected objects.
 */
export interface MaterialDef {
  /** Stable key. */
  id: string;
  /** Shown under the icon in the menu. */
  name: string;
}

export const MATERIALS: MaterialDef[] = [
  { id: 'base', name: 'Base' },
  { id: 'aura', name: 'Aura' },
  { id: 'dissolve', name: 'Dissolve' },
  { id: 'glow', name: 'Glow' },
  { id: 'glow-shell', name: 'Glow Shell' },
  { id: 'noise', name: 'Noise' },
  { id: 'pulse', name: 'Pulse' },
];
