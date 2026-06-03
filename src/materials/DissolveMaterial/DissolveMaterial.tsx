import { forwardRef, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

import vertexShader from './dissolve.vert';
import fragmentShader from './dissolve.frag';
import noiseUrl from '../../textures/noise/T_Noise_05.png';

interface Props {
  /** Flat surface colour shown before fragments are clipped away. */
  color?: string;
  /** Tiling of the noise lookup — higher = finer dissolve grain. */
  noiseScale?: number;
  /** Initial dissolve threshold (0 = fully visible, 1 = fully gone). */
  progress?: number;
}

/**
 * Reusable dissolve material — first layer only (noise -> threshold -> discard).
 * Forward the ref to drive `uProgress` from a parent's useFrame loop.
 */
const DissolveMaterial = forwardRef<THREE.ShaderMaterial, Props>(
  ({ color = '#ff6622', noiseScale = 2.0, progress = 0 }, ref) => {
    const noiseTex = useTexture(noiseUrl);

    const uniforms = useMemo(() => {
      noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
      return {
        uNoiseTex: { value: noiseTex },
        uProgress: { value: progress },
        uNoiseScale: { value: noiseScale },
        uColor: { value: new THREE.Color(color) },
      };
      // built once; the parent animates uProgress through the forwarded ref
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <shaderMaterial
        ref={ref}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    );
  },
);

DissolveMaterial.displayName = 'DissolveMaterial';
export default DissolveMaterial;
