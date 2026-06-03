import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

import vertexShader from './noise.vert';
import fragmentShader from './noise.frag';

const NoiseMaterial = forwardRef<THREE.ShaderMaterial>((_, ref) => {
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

NoiseMaterial.displayName = 'NoiseMaterial';
export default NoiseMaterial;
