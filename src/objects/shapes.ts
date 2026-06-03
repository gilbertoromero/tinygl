/** The basic primitives the scene can hold. One source of truth for the menu
 *  and the Scene. Add a kind here, handle its geometry in Shape.tsx, and give
 *  it an icon in the ShapeMenu — that's the whole extension surface. */
export type ShapeKind = 'box' | 'sphere' | 'pyramid';

export const SHAPE_KINDS: ShapeKind[] = ['box', 'sphere', 'pyramid'];

export const SHAPE_LABELS: Record<ShapeKind, string> = {
  box: 'Box',
  sphere: 'Sphere',
  pyramid: 'Pyramid',
};

export const DEFAULT_SHAPE: ShapeKind = 'box';
