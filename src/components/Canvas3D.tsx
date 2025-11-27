import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { HumanModel, ScanEffect, Lighting, Environment } from './Scene';

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color={0x00ffff} wireframe />
    </mesh>
  );
}

export function Canvas3D() {
  return (
    <Canvas
      shadows
      gl={{ 
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: '#080818' }}
    >
      <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50} />
      
      <color attach="background" args={['#080818']} />
      <fog attach="fog" args={['#080818', 5, 15]} />
      
      <Suspense fallback={<LoadingFallback />}>
        <Lighting />
        <Environment />
        <HumanModel />
        <ScanEffect />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.5}
        target={[0, 1, 0]}
      />
    </Canvas>
  );
}
