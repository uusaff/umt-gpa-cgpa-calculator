import React from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ParticleSystem from './ParticleSystem';

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#1b1b36']} />
      <ParticleSystem />
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.15} 
          mipmapBlur 
          luminanceSmoothing={0.8} 
          intensity={1.8} 
        />
      </EffectComposer>
    </>
  );
}