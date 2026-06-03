import { forwardRef, useMemo } from 'react';
import * as THREE from 'three';

import vertexShader from './glow-shell.vert';
import fragmentShader from './glow-shell.frag';

interface GlowShellMaterialProps {
  color?: THREE.ColorRepresentation;
  intensity?: number;
  falloff?: number;
}

const GlowShellMaterial = forwardRef<THREE.ShaderMaterial, GlowShellMaterialProps>(
  ({ color = '#00aaff', intensity = 0.9, falloff = 3.0 }, ref) => {
    const uniforms = useMemo(
      () => ({
        uColor:     { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
        uTime:      { value: 0 },
        uFalloff:   { value: falloff },
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

GlowShellMaterial.displayName = 'GlowShellMaterial';
export default GlowShellMaterial;
