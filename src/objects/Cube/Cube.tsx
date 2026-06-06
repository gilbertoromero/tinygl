import React from 'react';
import type * as THREE from 'three';
import Shape from '../Shape/Shape';

interface Props {
  /** Stable selection id (see {@link Shape}). */
  id: string;
  position?: [number, number, number];
  color?: THREE.ColorRepresentation;
  name?: string;
}

/** Convenience wrapper — a box-kind {@link Shape}. */
const Cube: React.FC<Props> = (props) => <Shape kind="box" {...props} />;

export default Cube;
