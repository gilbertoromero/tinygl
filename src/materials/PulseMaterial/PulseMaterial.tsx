import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

import vertexShader from './pulse.vert';
import fragmentShader from './pulse.frag';

const PulseMaterial = forwardRef<THREE.ShaderMaterial>((_, ref) => {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  return (
    <shaderMaterial
      ref={ref}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
      depthWrite={false}
    />
  );
});

PulseMaterial.displayName = 'PulseMaterial';
export default PulseMaterial;
