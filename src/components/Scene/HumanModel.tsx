import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useScannerStore } from '@/stores/scannerStore';
import { findBodyPartByMeshName } from '@/constants/bodyParts';

interface HumanModelProps {
  onPartClick?: (partId: string) => void;
}

// Bone 이름과 부위 ID 매핑 (여러 명명 규칙 지원)
const BONE_TO_PART_MAP: Record<string, string> = {
  // Mixamo 명명 규칙 (Xbot 등)
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

  // 일반적인 명명 규칙 (Head, Neck 등)
  Head: 'head',
  Neck: 'neck',
  Spine2: 'chest',
  Spine1: 'upperBack',
  Spine: 'lowerBack',
  Hips: 'abdomen',
  LeftShoulder: 'leftShoulder',
  LeftArm: 'leftArm',
  LeftForeArm: 'leftForeArm',
  LeftHand: 'leftHand',
  RightShoulder: 'rightShoulder',
  RightArm: 'rightArm',
  RightForeArm: 'rightForeArm',
  RightHand: 'rightHand',
  LeftUpLeg: 'leftThigh',
  LeftLeg: 'leftKnee',
  LeftFoot: 'leftFoot',
  RightUpLeg: 'rightThigh',
  RightLeg: 'rightKnee',
  RightFoot: 'rightFoot',

  // 언더스코어 명명 규칙
  head: 'head',
  neck: 'neck',
  spine_02: 'chest',
  spine_01: 'upperBack',
  spine: 'lowerBack',
  pelvis: 'abdomen',
  hips: 'abdomen',
  clavicle_l: 'leftShoulder',
  upperarm_l: 'leftArm',
  lowerarm_l: 'leftForeArm',
  hand_l: 'leftHand',
  clavicle_r: 'rightShoulder',
  upperarm_r: 'rightArm',
  lowerarm_r: 'rightForeArm',
  hand_r: 'rightHand',
  thigh_l: 'leftThigh',
  calf_l: 'leftKnee',
  foot_l: 'leftFoot',
  thigh_r: 'rightThigh',
  calf_r: 'rightKnee',
  foot_r: 'rightFoot',

  // UE/Unity 스타일
  upper_arm_l: 'leftArm',
  lower_arm_l: 'leftForeArm',
  upper_arm_r: 'rightArm',
  lower_arm_r: 'rightForeArm',
  upper_leg_l: 'leftThigh',
  lower_leg_l: 'leftKnee',
  upper_leg_r: 'rightThigh',
  lower_leg_r: 'rightKnee',
};

// Bone 이름에서 부위 ID 찾기 (부분 매칭 지원)
function findPartIdFromBoneName(boneName: string): string | null {
  // 정확한 매칭 먼저
  if (BONE_TO_PART_MAP[boneName]) {
    return BONE_TO_PART_MAP[boneName];
  }

  // 소문자로 변환해서 부분 매칭
  const lowerName = boneName.toLowerCase();

  // 키워드 기반 매칭
  if (lowerName.includes('head')) return 'head';
  if (lowerName.includes('neck')) return 'neck';
  if (lowerName.includes('spine2') || lowerName.includes('spine_02') || lowerName.includes('chest')) return 'chest';
  if (lowerName.includes('spine1') || lowerName.includes('spine_01')) return 'upperBack';
  if (lowerName.includes('spine') && !lowerName.includes('1') && !lowerName.includes('2')) return 'lowerBack';
  if (lowerName.includes('hip') || lowerName.includes('pelvis')) return 'abdomen';

  // 왼쪽 팔
  if ((lowerName.includes('left') || lowerName.includes('_l')) && lowerName.includes('shoulder') || lowerName.includes('clavicle')) {
    if (lowerName.includes('left') || lowerName.includes('_l')) return 'leftShoulder';
  }
  if ((lowerName.includes('left') || lowerName.includes('_l')) && (lowerName.includes('upper') && lowerName.includes('arm'))) return 'leftArm';
  if ((lowerName.includes('left') || lowerName.includes('_l')) && (lowerName.includes('fore') || lowerName.includes('lower')) && lowerName.includes('arm')) return 'leftForeArm';
  if ((lowerName.includes('left') || lowerName.includes('_l')) && lowerName.includes('hand')) return 'leftHand';

  // 오른쪽 팔
  if ((lowerName.includes('right') || lowerName.includes('_r')) && lowerName.includes('shoulder') || lowerName.includes('clavicle')) {
    if (lowerName.includes('right') || lowerName.includes('_r')) return 'rightShoulder';
  }
  if ((lowerName.includes('right') || lowerName.includes('_r')) && (lowerName.includes('upper') && lowerName.includes('arm'))) return 'rightArm';
  if ((lowerName.includes('right') || lowerName.includes('_r')) && (lowerName.includes('fore') || lowerName.includes('lower')) && lowerName.includes('arm')) return 'rightForeArm';
  if ((lowerName.includes('right') || lowerName.includes('_r')) && lowerName.includes('hand')) return 'rightHand';

  // 왼쪽 다리
  if ((lowerName.includes('left') || lowerName.includes('_l')) && (lowerName.includes('thigh') || lowerName.includes('upleg') || lowerName.includes('upper_leg'))) return 'leftThigh';
  if ((lowerName.includes('left') || lowerName.includes('_l')) && (lowerName.includes('calf') || lowerName.includes('leg') || lowerName.includes('shin'))) return 'leftKnee';
  if ((lowerName.includes('left') || lowerName.includes('_l')) && lowerName.includes('foot')) return 'leftFoot';

  // 오른쪽 다리
  if ((lowerName.includes('right') || lowerName.includes('_r')) && (lowerName.includes('thigh') || lowerName.includes('upleg') || lowerName.includes('upper_leg'))) return 'rightThigh';
  if ((lowerName.includes('right') || lowerName.includes('_r')) && (lowerName.includes('calf') || lowerName.includes('leg') || lowerName.includes('shin'))) return 'rightKnee';
  if ((lowerName.includes('right') || lowerName.includes('_r')) && lowerName.includes('foot')) return 'rightFoot';

  return null;
}

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

        // 호버 영역 계산 (더 넓은 범위로)
        float distFromHovered = distance(vWorldPosition, uHoveredCenter);
        float hoveredIntensity = 1.0 - smoothstep(0.0, uHighlightRadius * 1.2, distFromHovered);
        bool isHovered = uHoveredCenter.y > -50.0 && hoveredIntensity > 0.01 && !isSelected;

        // 기본 홀로그램 색상 (Bloom을 위해 더 밝게)
        vec3 baseColor = vec3(0.05, 0.15, 0.4);
        vec3 emissive = vec3(0.0);

        if (isSelected) {
          // 선택: 밝은 빨강/오렌지 + 펄스
          float pulse = 0.7 + sin(uTime * 6.0) * 0.3;
          vec3 selectColor = vec3(1.0, 0.2, 0.1);
          baseColor = mix(baseColor, selectColor, selectedIntensity * pulse);
          // 선택 시 강한 emissive 추가
          emissive += selectColor * selectedIntensity * pulse * 2.0;
        } else if (isHovered) {
          // 호버: 밝은 노란색/주황색 (기본 파란색과 확실히 구분)
          float hoverPulse = 0.7 + sin(uTime * 6.0) * 0.3;
          vec3 hoverColor = vec3(1.0, 0.8, 0.2);
          baseColor = mix(baseColor, hoverColor, hoveredIntensity * hoverPulse);
          // 호버 시 매우 강한 emissive
          emissive += hoverColor * hoveredIntensity * hoverPulse * 3.0;
        }

        // Fresnel 가장자리 발광 (Bloom의 핵심!)
        vec3 fresnelGlow = isSelected ? vec3(1.0, 0.4, 0.1) : vec3(0.0, 0.8, 1.0);
        float fresnelEmissive = pow(fresnel, 1.5) * 2.5;
        emissive += fresnelGlow * fresnelEmissive;

        // 선택 글로우 (더 강하게)
        if (isSelected) {
          float glowPulse = 0.6 + sin(uTime * 4.0) * 0.4;
          emissive += vec3(1.0, 0.3, 0.05) * selectedIntensity * glowPulse * 1.5;
        }

        // 호버 글로우 (매우 강하게)
        if (isHovered) {
          float hoverGlow = 0.7 + sin(uTime * 5.0) * 0.3;
          emissive += vec3(1.0, 0.7, 0.1) * hoveredIntensity * hoverGlow * 2.5;
        }

        // 스캔 라인 (강한 발광)
        float scanWidth = 0.12;
        float distFromScan = abs(vWorldPosition.y - uScanY);
        float scanIntensity = uScanActive ? smoothstep(scanWidth, 0.0, distFromScan) : 0.0;
        emissive += vec3(0.2, 1.0, 1.0) * scanIntensity * 3.0;

        // 홀로그램 수평선 패턴
        float linePattern = sin(vWorldPosition.y * 80.0 + uTime * 2.0) * 0.5 + 0.5;
        linePattern = smoothstep(0.45, 0.55, linePattern);
        emissive += vec3(0.0, 0.4, 0.5) * linePattern * 0.15;

        // 최종 색상 = 베이스 + emissive
        vec3 finalColor = baseColor + emissive;

        // 불투명도
        float opacity = 0.75 + fresnel * 0.2;
        opacity += isSelected ? selectedIntensity * 0.25 : 0.0;
        opacity += isHovered ? hoveredIntensity * 0.15 : 0.0;
        opacity += scanIntensity * 0.25;

        gl_FragColor = vec4(finalColor, opacity);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
    blending: THREE.AdditiveBlending,
  });
}

// 성별별 모델 경로
const MODEL_PATHS = {
  male: '/models/male.glb',
  female: '/models/female.glb',
} as const;

export function HumanModel({ onPartClick }: HumanModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);
  const skeletonRef = useRef<THREE.Skeleton | null>(null);

  const {
    selectedPart,
    hoveredPart,
    setSelectedPart,
    setHoveredPart,
    isScanning,
    scanProgress,
    gender,
  } = useScannerStore();

  // 성별에 따른 모델 로드
  const { scene } = useGLTF(MODEL_PATHS[gender]);

  // 위치 추적
  const selectedPositionRef = useRef(new THREE.Vector3(0, -100, 0));
  const hoveredPositionRef = useRef(new THREE.Vector3(0, -100, 0));
  const selectedRadiusRef = useRef(0.3);

  // 성별 변경 시 위치 초기화
  useEffect(() => {
    selectedPositionRef.current.set(0, -100, 0);
    hoveredPositionRef.current.set(0, -100, 0);
  }, [gender]);

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
      // 새로운 유연한 매칭 함수 사용
      const partId = findPartIdFromBoneName(boneName) || findBodyPartByMeshName(boneName)?.id;
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

// 두 모델 모두 프리로드
useGLTF.preload(MODEL_PATHS.male);
useGLTF.preload(MODEL_PATHS.female);
