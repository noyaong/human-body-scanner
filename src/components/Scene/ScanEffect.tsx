import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useScannerStore } from '@/stores/scannerStore';

// 스캔 라인 셰이더 머티리얼
const ScanLineMaterial = shaderMaterial(
  {
    uTime: 0,
    uScanY: 0,
    uColor: new THREE.Color(0x00ffff),
    uIntensity: 1.0,
  },
  // Vertex Shader
  /*glsl*/ `
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  /*glsl*/ `
    uniform float uTime;
    uniform float uScanY;
    uniform vec3 uColor;
    uniform float uIntensity;

    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
      // 중앙에서 멀어질수록 투명해지는 효과
      float distFromCenter = length(vUv - 0.5) * 2.0;
      float alpha = 1.0 - smoothstep(0.0, 1.0, distFromCenter);

      // 펄스 애니메이션
      float pulse = sin(uTime * 10.0) * 0.3 + 0.7;

      // 그리드 라인 패턴
      float gridX = step(0.98, fract(vUv.x * 20.0));
      float gridY = step(0.98, fract(vUv.y * 20.0));
      float grid = max(gridX, gridY) * 0.5;

      // 글로우 효과
      vec3 glowColor = uColor * (1.0 + grid);
      float finalAlpha = alpha * uIntensity * pulse;

      gl_FragColor = vec4(glowColor, finalAlpha * 0.8);
    }
  `
);

extend({ ScanLineMaterial });

// TypeScript 타입 확장
declare global {
  namespace JSX {
    interface IntrinsicElements {
      scanLineMaterial: any;
    }
  }
}

export function ScanEffect() {
  const planeRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const { isScanning, scanProgress, updateScanProgress, endScan } = useScannerStore();

  // 스캔 링 지오메트리
  const ringGeometry = useMemo(() => {
    return new THREE.RingGeometry(0.3, 1.2, 64);
  }, []);

  useFrame((state, delta) => {
    if (!isScanning) return;

    // 스캔 진행 업데이트
    const newProgress = scanProgress + delta * 25; // 약 4초 소요

    if (newProgress >= 100) {
      endScan();
    } else {
      updateScanProgress(newProgress);
    }

    // Y 위치 업데이트 (위에서 아래로)
    const yPos = 2.2 - (scanProgress / 100) * 2.7;

    if (planeRef.current) {
      planeRef.current.position.y = yPos;
    }

    if (glowRef.current) {
      glowRef.current.position.y = yPos;
      // 회전 애니메이션
      glowRef.current.rotation.z += delta * 2;
    }

    // 셰이더 유니폼 업데이트
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      materialRef.current.uniforms.uScanY.value = yPos;
    }
  });

  if (!isScanning && scanProgress === 0) return null;

  return (
    <group>
      {/* 메인 스캔 평면 */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 2.2, 0]}
      >
        <planeGeometry args={[3, 3]} />
        <scanLineMaterial
          ref={materialRef}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uColor={new THREE.Color(0x00ffff)}
          uIntensity={1.0}
          uTime={0}
          uScanY={0}
        />
      </mesh>

      {/* 회전하는 스캔 링 */}
      <mesh
        ref={glowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 2.2, 0]}
        geometry={ringGeometry}
      >
        <meshBasicMaterial
          color={0x00ffff}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 스캔 라인 글로우 이펙트 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, planeRef.current?.position.y ?? 2.2, 0]}
      >
        <ringGeometry args={[0.01, 1.5, 64]} />
        <meshBasicMaterial
          color={0x00ffff}
          transparent
          opacity={isScanning ? 0.3 : 0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
