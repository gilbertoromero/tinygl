import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom /* SelectiveBloom */ } from '@react-three/postprocessing';
import Scene from './components/Scene';
import DebugOverlay from './components/DebugOverlay';
import Inspector from './components/Inspector';
import GradientBackground from './objects/GradientBackground/GradientBackground';
import { clearSelection } from './state/selectionStore';

const App: React.FC = () => {
  return (
    <>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <h1>tinygl</h1>
      </div>
      {<DebugOverlay />}
      <Inspector />
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} onPointerMissed={() => clearSelection()}>
        <GradientBackground innerColor="#5a5a5a" outerColor="#111111" />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
        <OrbitControls />
        <EffectComposer>
          <Bloom
            intensity={0.75}
            luminanceThreshold={1.0}
            luminanceSmoothing={0.1}
            radius={0.5}
            mipmapBlur
          />
          {/* To experiment with SelectiveBloom instead:
              - Comment out <Bloom> above
              - Add selection refs to the meshes you want to bloom
              - <SelectiveBloom selection={selectionRef} intensity={...} />
          */}
        </EffectComposer>
      </Canvas>
    </>
  );
};

export default App;
