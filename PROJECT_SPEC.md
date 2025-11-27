# 3D Human Body Scanner - 프로젝트 스펙 문서

## 📋 프로젝트 개요

디지털 헬스케어용 3D 인체 스캐너 인터페이스. 환자가 자신의 증상 부위를 직관적으로 선택하고 기록할 수 있는 인터랙티브 3D 뷰어.

### 레퍼런스
- [Three.js Skinning Animation Example](https://threejs.org/examples/#webgl_animation_skinning_additive_blending)
- Xbot.glb 모델 사용

---

## 🎯 핵심 기능 요구사항

### 1. 3D 인체 모델 렌더링
- **실제 GLTF/GLB 인체 모델** 로드 (기본 도형 조합 X)
- 반투명 홀로그램/X-ray 스타일 렌더링
- Fresnel 효과로 가장자리 발광
- 와이어프레임 오버레이 옵션

### 2. 인터랙션
- 마우스 드래그: 360° 회전 (OrbitControls)
- 마우스 휠: 줌 인/아웃
- 클릭: 신체 부위 선택
- 호버: 부위 하이라이트 프리뷰

### 3. 스캔 이펙트
- 위에서 아래로 내려가는 스캔 라인 애니메이션
- Shader 기반 스캔 효과 (평면이 모델을 통과)
- 스캔 완료 후 부위별 상태 표시

### 4. 부위 선택 및 하이라이트
- Raycasting으로 정확한 부위 감지
- 선택된 부위: 색상 변경 + 펄스(맥동) 이펙트
- Outline/Glow 효과 (선택적)

### 5. UI/UX
- 선택된 부위 정보 사이드 패널
- 증상 기록 버튼
- 부위별 상세 분석 링크
- 반응형 레이아웃

---

## 🛠 기술 스택

### Frontend
```
- React 18+ (Vite)
- TypeScript
- React Three Fiber (@react-three/fiber)
- Drei (@react-three/drei)
- Three.js r160+
- TailwindCSS
```

### 3D Assets
```
- GLTF/GLB 포맷 인체 모델
- 소스: Mixamo, Sketchfab, ReadyPlayerMe
- 권장: 부위별로 분리된 메시 또는 Bone 기반 리깅
```

---

## 📁 프로젝트 구조

```
human-body-scanner/
├── src/
│   ├── components/
│   │   ├── Scene/
│   │   │   ├── HumanModel.tsx      # 3D 인체 모델 컴포넌트
│   │   │   ├── ScanEffect.tsx      # 스캔 이펙트 셰이더
│   │   │   ├── Lighting.tsx        # 조명 설정
│   │   │   └── Environment.tsx     # 환경 (그리드, 배경)
│   │   ├── UI/
│   │   │   ├── ControlPanel.tsx    # 사이드 패널
│   │   │   ├── PartInfo.tsx        # 선택 부위 정보
│   │   │   └── ScanButton.tsx      # 스캔 버튼
│   │   └── Canvas3D.tsx            # R3F Canvas 래퍼
│   ├── hooks/
│   │   ├── useBodyPartSelection.ts # 부위 선택 로직
│   │   └── useScanAnimation.ts     # 스캔 애니메이션
│   ├── stores/
│   │   └── scannerStore.ts         # Zustand 상태관리
│   ├── shaders/
│   │   ├── hologram.glsl           # 홀로그램 머티리얼
│   │   ├── fresnel.glsl            # 프레넬 효과
│   │   └── scanLine.glsl           # 스캔 라인 셰이더
│   ├── constants/
│   │   └── bodyParts.ts            # 부위별 메타데이터
│   ├── types/
│   │   └── index.ts                # TypeScript 타입
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── models/
│       └── human.glb               # 인체 3D 모델
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── PROJECT_SPEC.md
```

---

## 🎨 디자인 스펙

### 색상 팔레트
```css
--bg-primary: #080818;        /* 배경 */
--bg-panel: rgba(20, 25, 40, 0.95);
--accent-cyan: #00ffff;       /* 스캔, 하이라이트 */
--accent-magenta: #ff00ff;    /* 보조 조명 */
--body-default: #3366ff;      /* 인체 기본색 */
--body-selected: #ff3355;     /* 선택된 부위 */
--text-primary: #ffffff;
--text-secondary: #aaaaaa;
```

### 머티리얼 설정
```typescript
// 홀로그램 스타일 머티리얼
const hologramMaterial = {
  color: 0x3366ff,
  emissive: 0x112244,
  emissiveIntensity: 0.3,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide,
  // Fresnel 효과는 커스텀 셰이더로
};

// 와이어프레임 오버레이
const wireframeMaterial = {
  color: 0x00ffff,
  wireframe: true,
  transparent: true,
  opacity: 0.15,
};
```

---

## 📊 부위 데이터 구조

```typescript
// constants/bodyParts.ts
export interface BodyPart {
  id: string;
  meshName: string;        // GLTF 모델의 mesh/bone 이름
  displayName: string;     // 한글 표시명
  description: string;     // 관련 증상 설명
  category: 'head' | 'torso' | 'arm' | 'leg' | 'joint';
  relatedSymptoms: string[];
}

export const BODY_PARTS: Record<string, BodyPart> = {
  head: {
    id: 'head',
    meshName: 'mixamorigHead',
    displayName: '머리',
    description: '두통, 어지러움, 편두통, 뇌 관련 증상',
    category: 'head',
    relatedSymptoms: ['두통', '어지러움', '편두통', '시력저하']
  },
  neck: {
    id: 'neck',
    meshName: 'mixamorigNeck',
    displayName: '목',
    description: '목 통증, 경추 디스크, 거북목',
    category: 'head',
    relatedSymptoms: ['목통증', '경추디스크', '거북목', '어깨결림']
  },
  // ... 추가 부위
};
```

---

## 🔧 핵심 구현 가이드

### 1. GLTF 모델 로드 (React Three Fiber)

```tsx
// components/Scene/HumanModel.tsx
import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function HumanModel({ onPartClick, selectedPart }) {
  const { scene, nodes } = useGLTF('/models/human.glb');
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // 모든 메시에 홀로그램 머티리얼 적용
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshPhongMaterial({
          color: 0x3366ff,
          emissive: 0x112244,
          transparent: true,
          opacity: 0.7,
        });
      }
    });
  }, [scene]);

  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      onClick={(e) => {
        e.stopPropagation();
        onPartClick(e.object.name);
      }}
    />
  );
}

useGLTF.preload('/models/human.glb');
```

### 2. 스캔 셰이더 효과

```glsl
// shaders/scanLine.glsl
uniform float uScanY;
uniform float uTime;

varying vec3 vPosition;

void main() {
  float scanWidth = 0.1;
  float scanIntensity = smoothstep(
    uScanY - scanWidth, 
    uScanY, 
    vPosition.y
  ) - smoothstep(
    uScanY, 
    uScanY + scanWidth, 
    vPosition.y
  );
  
  vec3 scanColor = vec3(0.0, 1.0, 1.0) * scanIntensity * 2.0;
  
  gl_FragColor = vec4(scanColor, scanIntensity);
}
```

### 3. Fresnel 효과 (가장자리 발광)

```typescript
// React Three Fiber에서 커스텀 셰이더 머티리얼
import { shaderMaterial } from '@react-three/drei';

const FresnelMaterial = shaderMaterial(
  {
    uColor: new THREE.Color(0x3366ff),
    uFresnelPower: 2.0,
    uOpacity: 0.7,
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    uniform float uFresnelPower;
    uniform float uOpacity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);
      
      vec3 finalColor = uColor + fresnel * vec3(0.0, 1.0, 1.0);
      float finalOpacity = uOpacity + fresnel * 0.3;
      
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `
);
```

### 4. 부위 선택 (Raycasting)

```tsx
// hooks/useBodyPartSelection.ts
import { useThree } from '@react-three/fiber';
import { useCallback } from 'react';

export function useBodyPartSelection(onSelect: (partId: string) => void) {
  const { raycaster, camera, scene } = useThree();

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      const partId = findBodyPartByMeshName(clickedMesh.name);
      
      if (partId) {
        onSelect(partId);
      }
    }
  }, [raycaster, scene, onSelect]);

  return { handleClick };
}
```

---

## 🚀 개발 단계별 작업

### Phase 1: 기본 구조 (1-2일)
- [ ] Vite + React + TypeScript 프로젝트 세팅
- [ ] React Three Fiber 환경 구성
- [ ] 기본 Scene (카메라, 조명, 그리드)
- [ ] GLTF 모델 로드 테스트

### Phase 2: 인체 모델 렌더링 (2-3일)
- [ ] Xbot.glb 또는 대체 인체 모델 적용
- [ ] 홀로그램 스타일 머티리얼
- [ ] 와이어프레임 오버레이
- [ ] Fresnel 셰이더 (선택적)

### Phase 3: 인터랙션 (2일)
- [ ] OrbitControls 설정
- [ ] Raycasting 부위 선택
- [ ] 선택 부위 하이라이트 효과
- [ ] 펄스 애니메이션

### Phase 4: 스캔 이펙트 (1-2일)
- [ ] 스캔 라인 셰이더
- [ ] 스캔 애니메이션 시퀀스
- [ ] 진행률 표시

### Phase 5: UI 통합 (1-2일)
- [ ] 사이드 패널 UI
- [ ] 부위 정보 표시
- [ ] 증상 기록 폼
- [ ] 반응형 레이아웃

### Phase 6: 최적화 및 마무리 (1일)
- [ ] 성능 최적화 (LOD, Instancing)
- [ ] 모바일 터치 지원
- [ ] 에러 핸들링
- [ ] 문서화

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.88.0",
    "@react-three/postprocessing": "^2.15.0",
    "three": "^0.160.0",
    "zustand": "^4.4.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/three": "^0.160.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0"
  }
}
```

---

## 🎮 CLI 명령어

```bash
# 프로젝트 생성
npm create vite@latest human-body-scanner -- --template react-ts

# 의존성 설치
cd human-body-scanner
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing zustand
npm install -D @types/three tailwindcss postcss autoprefixer

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

---

## 🔗 참고 자료

### 3D 모델 소스
- [Mixamo](https://www.mixamo.com/) - 무료 리깅된 캐릭터
- [Sketchfab](https://sketchfab.com/) - 의료/해부학 모델
- [ReadyPlayerMe](https://readyplayer.me/) - 아바타 생성

### 튜토리얼
- [React Three Fiber 공식 문서](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Journey](https://threejs-journey.com/)
- [Discover Three.js](https://discoverthreejs.com/)

### 셰이더 참고
- [The Book of Shaders](https://thebookofshaders.com/)
- [Shadertoy](https://www.shadertoy.com/)

---

## ✅ Claude Code 작업 요청 예시

```
1. "Phase 1 기본 구조부터 시작해줘. Vite + React + TypeScript로 프로젝트 세팅하고 R3F 환경 구성해줘."

2. "Xbot.glb 모델을 다운받아서 public/models에 넣고, 홀로그램 스타일로 렌더링해줘."

3. "Fresnel 셰이더를 적용해서 인체 모델 가장자리가 발광하는 효과를 만들어줘."

4. "스캔 라인 셰이더를 만들어서 위에서 아래로 스캔하는 효과를 구현해줘."

5. "부위 클릭 시 빨간색으로 하이라이트되고 펄스 애니메이션이 적용되도록 해줘."
```

---

**작성일**: 2025-11-26  
**작성자**: Claude (Anthropic)  
**버전**: 1.0
