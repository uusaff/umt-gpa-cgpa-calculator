import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
// The ?raw query tells Vite to load the file as a raw text string
import vertexShader from './shaders/vertex.glsl?raw';
import fragmentShader from './shaders/fragment.glsl?raw';

const PARTICLE_COUNT = 3500;
const PALETTE = ['#2f315c', '#5b6190', '#a3a4c4', '#bbbcde', '#d3d6eb'];

export default function ParticleSystem() {
  const pointsRef = useRef();
  const materialRef = useRef();
  const { viewport } = useThree();
  const targetMouse = useRef(new THREE.Vector3(0, 0, 0));

  // Generate Static Buffer Data Once
  const [positions, colors, sizes, offsets] = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const offsets = new Float32Array(PARTICLE_COUNT);

    const colorObj = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Widespread bounds for infinite feeling
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10; // Z Depth (-20 to 0)

      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      colorObj.set(color);
      
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;

      sizes[i] = Math.random() * 2.5 + 0.5;
      offsets[i] = Math.random() * 1000;
    }

    return [positions, colors, sizes, offsets];
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector3(0, 0, 0) },
    uResolution: { value: new THREE.Vector2() }
  }), []);

  // Update uniforms strictly on the GPU per-frame (No React state re-renders)
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = time;
    }

    // Convert normalized mouse (-1 to 1) to 3D world space loosely
    const mouseX = (state.pointer.x * viewport.width) / 2;
    const mouseY = (state.pointer.y * viewport.height) / 2;
    targetMouse.current.set(mouseX, mouseY, 0);

    if (materialRef.current) {
       materialRef.current.uniforms.uMouse.value.lerp(targetMouse.current, 0.05); // Spring interpolation
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aColor" count={PARTICLE_COUNT} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={PARTICLE_COUNT} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aOffset" count={PARTICLE_COUNT} array={offsets} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}