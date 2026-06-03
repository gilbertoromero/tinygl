import React, { useRef, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { Color, Group, Mesh, MeshStandardMaterial } from 'three';
import { GroupProps } from '@react-three/fiber';

export interface MatConfig {
  materialName: string;
  color?: string;
  emissiveColor?: string;
  emissiveBoost?: number;
}

interface GameObjectProps extends GroupProps {
  modelUrl: string;
  materials?: MatConfig[];
  /** Fallback emissive boost applied to all emissive mats not covered by a MatConfig */
  emissiveBoost?: number;
}

const GameObject: React.FC<GameObjectProps> = ({
  modelUrl,
  materials,
  emissiveBoost = 4.0,
  ...groupProps
}) => {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF(modelUrl);
  const cloned = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    const configMap = new Map(materials?.map((c) => [c.materialName, c]));

    cloned.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      const mat = obj.material as MeshStandardMaterial;
      if (!mat) return;

      const cfg = configMap.get(mat.name);

      if (cfg) {
        if (cfg.color) mat.color.set(new Color(cfg.color));
        if (mat.emissive) {
          mat.emissive.set(
            new Color(cfg.emissiveColor ?? cfg.color ?? `#${mat.color.getHexString()}`),
          );
          mat.emissiveIntensity = cfg.emissiveBoost ?? emissiveBoost;
        }
      } else if (!materials) {
        // global fallback when no materials array is provided
        if (mat.emissive && mat.emissive.getHexString() !== '000000') {
          mat.emissiveIntensity = emissiveBoost;
        }
      }

      mat.needsUpdate = true;
    });
  }, [cloned, materials, emissiveBoost]);

  return (
    <group ref={groupRef} {...groupProps}>
      <primitive object={cloned} />
    </group>
  );
};

export default GameObject;
