import { forwardRef } from 'react';
import * as THREE from 'three';

interface Props {
  color?: THREE.ColorRepresentation;
}

/**
 * The default material for basic shapes: a flat, unlit `MeshBasicMaterial`
 * (green by default). Unlike the shader-based effect materials in this folder,
 * this is a plain built-in — it ignores lights and just shows its color, which
 * makes it the simplest sane default for newly spawned primitives. The ref is
 * forwarded so the Inspector can mutate `.color` directly.
 */
const BaseMaterial = forwardRef<THREE.MeshBasicMaterial, Props>(({ color = '#00ff00' }, ref) => {
  return <meshBasicMaterial ref={ref} color={color} />;
});

BaseMaterial.displayName = 'BaseMaterial';
export default BaseMaterial;
