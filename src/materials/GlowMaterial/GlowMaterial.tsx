import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

import vertexShader from './glow.vert';
import fragmentShader from './glow.frag';

interface GlowMaterialProps {
  color?: THREE.ColorRepresentation;
  intensity?: number;
}

const GlowMaterial = forwardRef<THREE.ShaderMaterial, GlowMaterialProps>(
  ({ color = '#00aaff', intensity = 1.5 }, ref) => {
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
        side={THREE.FrontSide}
      />
    );
  }
);

GlowMaterial.displayName = 'GlowMaterial';
export default GlowMaterial;
