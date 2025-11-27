import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScannerStore } from '@/stores/scannerStore';
import { findBodyPartByMeshName } from '@/constants/bodyParts';

interface HumanModelProps {
  onPartClick?: (partId: string) => void;
}

// Bone 이름과 부위 ID 매핑
const BONE_TO_PART_MAP: Record<string, string> = {
  mixamorigHead: 'head',
  mixamorigNeck: 'neck',
  mixamorigSpine2: 'chest',
  mixamorigSpine1: 'upperBack',
  mixamorigSpine: 'lowerBack',
  mixamorigHips: 'abdomen',
  mixamorigLeftShoulder: 'leftShoulder',
  mixamorigLeftArm: 'leftArm',
  mixamorigLeftForeArm: 'leftForeArm',
  mixamorigLeftHand: 'leftHand',
  mixamorigRightShoulder: 'rightShoulder',
  mixamorigRightArm: 'rightArm',
  mixamorigRightForeArm: 'rightForeArm',
  mixamorigRightHand: 'rightHand',
  mixamorigLeftUpLeg: 'leftThigh',
  mixamorigLeftLeg: 'leftKnee',
  mixamorigLeftFoot: 'leftFoot',
  mixamorigRightUpLeg: 'rightThigh',
  mixamorigRightLeg: 'rightKnee',
  mixamorigRightFoot: 'rightFoot',
};

// 부위별 하이라이트 반경
const PART_RADIUS: Record<string, number> = {
  head: 0.15, neck: 0.1, chest: 0.2, upperBack: 0.18, lowerBack: 0.18,
  abdomen: 0.2, leftShoulder: 0.12, rightShoulder: 0.12, leftArm: 0.15,
  rightArm: 0.15, leftForeArm: 0.12, rightForeArm: 0.12, leftHand: 0.08,
  rightHand: 0.08, leftThigh: 0.18, rightThigh: 0.18, leftKnee: 0.15,
  rightKnee: 0.15, leftFoot: 0.1, rightFoot: 0.1,
};

// 커스텀 홀로그램 셰이더 머티리얼 생성 함수
function createHologramMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.ShaderLib.standard.uniforms),
      uTime: { value: 0 },
      uScanY: { value: -10.0 },
      uScanActive: { value: false },
      uHighlightCenter: { value: new THREE.Vector3(0, -100, 0) },
      uHighlightRadius: { value: 0.3 },
      uHoveredCenter: { value: new THREE.Vector3(0, -100, 0) },
    },
    vertexShader: `
      #include <skinning_pars_vertex>

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        #include <skinbase_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>

        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        vViewPosition = -mvPosition.xyz;
        vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uScanY;
      uniform bool uScanActive;
      uniform vec3 uHighlightCenter;
      uniform float uHighlightRadius;
      uniform vec3 uHoveredCenter;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vWorldPosition;

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5);

        // 선택 영역 계산
        float distFromSelected = distance(vWorldPosition, uHighlightCenter);
        float selectedIntensity = 1.0 - smoothstep(0.0, uHighlightRadius, distFromSelected);
        bool isSelected = uHighlightCenter.y > -50.0 && selectedIntensity > 0.01;

        // 호버 영역 계산
        float distFromHovered = distance(vWorldPosition, uHoveredCenter);
        float hoveredIntensity = 1.0 - smoothstep(0.0, uHighlightRadius * 0.8, distFromHovered);
        bool isHovered = uHoveredCenter.y > -50.0 && hoveredIntensity > 0.01 && !isSelected;

        // 기본 홀로그램 파란색
        vec3 baseColor = vec3(0.1, 0.3, 0.8);

        if (isSelected) {
          // 선택: 밝은 빨강/오렌지 + 펄스
          float pulse = 0.7 + sin(uTime * 6.0) * 0.3;
          vec3 selectColor = vec3(1.0, 0.15, 0.05);
          baseColor = mix(baseColor, selectColor, selectedIntensity * pulse);
        } else if (isHovered) {
          // 호버: 밝은 시안
          vec3 hoverColor = vec3(0.2, 0.9, 1.0);
          baseColor = mix(baseColor, hoverColor, hoveredIntensity * 0.85);
        }

        // Fresnel 가장자리 발광
        vec3 fresnelGlow = isSelected ? vec3(1.0, 0.5, 0.2) : vec3(0.0, 1.0, 1.0);
        vec3 finalColor = baseColor + fresnel * fresnelGlow * 0.7;

        // 선택 글로우
        if (isSelected) {
          float glowPulse = 0.5 + sin(uTime * 4.0) * 0.3;
          finalColor += vec3(1.0, 0.3, 0.1) * selectedIntensity * glowPulse;
        }

        // 호버 글로우
        if (isHovered) {
          float hoverGlow = 0.3 + sin(uTime * 3.0) * 0.15;
          finalColor += vec3(0.0, 0.6, 0.7) * hoveredIntensity * hoverGlow;
        }

        // 스캔 라인
        float scanWidth = 0.15;
        float distFromScan = abs(vWorldPosition.y - uScanY);
        float scanIntensity = uScanActive ? smoothstep(scanWidth, 0.0, distFromScan) * 1.5 : 0.0;
        finalColor += vec3(0.0, 1.0, 1.0) * scanIntensity;

        // 홀로그램 수평선 패턴
        float linePattern = sin(vWorldPosition.y * 100.0 + uTime * 2.0) * 0.5 + 0.5;
        linePattern = smoothstep(0.4, 0.6, linePattern);
        finalColor += vec3(0.0, 0.3, 0.4) * linePattern * 0.08;

        // 불투명도
        float opacity = 0.7 + fresnel * 0.25;
        opacity += isSelected ? selectedIntensity * 0.3 : 0.0;
        opacity += isHovered ? hoveredIntensity * 0.2 : 0.0;
        opacity += scanIntensity * 0.3;

        gl_FragColor = vec4(finalColor, opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
}

export function HumanModel({ onPartClick }: HumanModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const skeletonRef = useRef<THREE.Skeleton | null>(null);

  const { scene } = useGLTF('/models/Xbot.glb');

  const {
    selectedPart,
    hoveredPart,
    setSelectedPart,
    setHoveredPart,
    isScanning,
    scanProgress,
  } = useScannerStore();

  // 위치 추적
  const selectedPositionRef = useRef(new THREE.Vector3(0, -100, 0));
  const hoveredPositionRef = useRef(new THREE.Vector3(0, -100, 0));
  const selectedRadiusRef = useRef(0.3);

  // 모델 복제 및 머티리얼 적용
  const processedScene = useMemo(() => {
    const cloned = scene.clone();
    return cloned;
  }, [scene]);

  // 머티리얼 및 스켈레톤 설정 (useEffect로 분리)
  useEffect(() => {
    materialsRef.current = [];
    skeletonRef.current = null;

    processedScene.traverse((child) => {
      console.log('Child:', child.type, child.name);

      // SkinnedMesh 처리
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const skinnedMesh = child as THREE.SkinnedMesh;
        if (skinnedMesh.skeleton && !skeletonRef.current) {
          skeletonRef.current = skinnedMesh.skeleton;
          console.log('Skeleton found:', skinnedMesh.skeleton.bones.length, 'bones');
          console.log('Bone names:', skinnedMesh.skeleton.bones.map(b => b.name).slice(0, 10));
        }

        const hologramMat = createHologramMaterial();
        skinnedMesh.material = hologramMat;
        materialsRef.current.push(hologramMat);
        skinnedMesh.frustumCulled = false;
      }
      // 일반 Mesh 처리
      else if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const hologramMat = createHologramMaterial();
        mesh.material = hologramMat;
        materialsRef.current.push(hologramMat);
      }
    });

    console.log('Materials applied:', materialsRef.current.length);
  }, [processedScene]);

  // 와이어프레임 오버레이 씬
  const wireframeScene = useMemo(() => {
    const cloned = scene.clone();
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        child.material = wireMat;
      }
    });

    return cloned;
  }, [scene]);

  // 스캔 Y 위치
  const scanY = 2.2 - (scanProgress / 100) * 2.7;


  // 프레임 업데이트
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    materialsRef.current.forEach((mat) => {
      if (!mat.uniforms) return;

      mat.uniforms.uTime.value = time;
      mat.uniforms.uScanY.value = scanY;
      mat.uniforms.uScanActive.value = isScanning;

      // 선택 위치 복사
      if (mat.uniforms.uHighlightCenter) {
        mat.uniforms.uHighlightCenter.value.x = selectedPositionRef.current.x;
        mat.uniforms.uHighlightCenter.value.y = selectedPositionRef.current.y;
        mat.uniforms.uHighlightCenter.value.z = selectedPositionRef.current.z;
      }

      mat.uniforms.uHighlightRadius.value = selectedRadiusRef.current;

      // 호버 위치 복사
      if (mat.uniforms.uHoveredCenter) {
        mat.uniforms.uHoveredCenter.value.x = hoveredPositionRef.current.x;
        mat.uniforms.uHoveredCenter.value.y = hoveredPositionRef.current.y;
        mat.uniforms.uHoveredCenter.value.z = hoveredPositionRef.current.z;
      }

      mat.needsUpdate = true;
    });

    // 디버그: 5초마다 한번씩 로그
    if (Math.floor(time) % 5 === 0 && Math.floor(time * 10) % 10 === 0) {
      console.log('Uniform update - selected:', selectedPositionRef.current.y, 'hovered:', hoveredPositionRef.current.y);
    }
  });

  // 클릭/호버된 부위 찾기
  const findPartAtIntersection = useCallback((intersect: THREE.Intersection): { partId: string; position: THREE.Vector3 } | null => {
    const point = intersect.point;
    const skeleton = skeletonRef.current;
    if (!skeleton) return null;

    let closestBone: THREE.Bone | null = null;
    let minDistance = Infinity;

    skeleton.bones.forEach((bone) => {
      const boneWorldPos = new THREE.Vector3();
      bone.getWorldPosition(boneWorldPos);
      const distance = point.distanceTo(boneWorldPos);
      if (distance < minDistance) {
        minDistance = distance;
        closestBone = bone;
      }
    });

    if (closestBone) {
      const boneName = (closestBone as THREE.Bone).name;
      const partId = BONE_TO_PART_MAP[boneName] || findBodyPartByMeshName(boneName)?.id;
      if (partId) {
        const bonePos = new THREE.Vector3();
        (closestBone as THREE.Bone).getWorldPosition(bonePos);
        return { partId, position: bonePos };
      }
    }
    return null;
  }, []);

  // 클릭 핸들러
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (e.intersections.length === 0) return;

    const result = findPartAtIntersection(e.intersections[0]);
    console.log('Click result:', result, 'skeleton:', skeletonRef.current);

    if (result) {
      if (selectedPart === result.partId) {
        setSelectedPart(null);
        selectedPositionRef.current.set(0, -100, 0);
      } else {
        setSelectedPart(result.partId);
        selectedPositionRef.current.copy(result.position);
        selectedRadiusRef.current = PART_RADIUS[result.partId] || 0.3;
        console.log('Selected position:', result.position, 'radius:', selectedRadiusRef.current);
      }
      onPartClick?.(result.partId);
    }
  }, [selectedPart, setSelectedPart, findPartAtIntersection, onPartClick]);

  // 호버 핸들러
  const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (e.intersections.length === 0) {
      setHoveredPart(null);
      hoveredPositionRef.current.set(0, -100, 0);
      document.body.style.cursor = 'auto';
      return;
    }

    const result = findPartAtIntersection(e.intersections[0]);
    if (result) {
      if (result.partId !== hoveredPart) {
        setHoveredPart(result.partId);
      }
      hoveredPositionRef.current.copy(result.position);
      document.body.style.cursor = 'pointer';
    } else {
      setHoveredPart(null);
      hoveredPositionRef.current.set(0, -100, 0);
      document.body.style.cursor = 'auto';
    }
  }, [hoveredPart, setHoveredPart, findPartAtIntersection]);

  const handlePointerLeave = useCallback(() => {
    setHoveredPart(null);
    hoveredPositionRef.current.set(0, -100, 0);
    document.body.style.cursor = 'auto';
  }, [setHoveredPart]);

  return (
    <group ref={groupRef}>
      {/* 메인 모델 */}
      <primitive
        object={processedScene}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />
      {/* 와이어프레임 */}
      <primitive object={wireframeScene} scale={1.002} />
    </group>
  );
}

useGLTF.preload('/models/Xbot.glb');
