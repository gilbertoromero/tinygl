import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

import vertexShader from './aura.vert';
import fragmentShader from './aura.frag';

interface AuraMaterialProps {
  color?: THREE.ColorRepresentation;
  intensity?: number;
}

const AuraMaterial = forwardRef<THREE.ShaderMaterial, AuraMaterialProps>(
  ({ color = '#00aaff', intensity = 0.5 }, ref) => {
    const uniforms = useMemo(
      () => ({
        uColor:     { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uTime:      { value: 0 },
      }),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    return (
      <shaderMaterial
        ref={ref}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    );
  }
);

AuraMaterial.displayName = 'AuraMaterial';
export default AuraMaterial;
