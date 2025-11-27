# Human Body Scanner

3D 인체 스캐너 - 디지털 헬스케어용 인터랙티브 인체 뷰어

## 🚀 Quick Start

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## 📋 Features

- 3D 인체 모델 (반투명 홀로그램 스타일)
- 마우스 드래그로 360° 회전
- 스크롤로 줌 인/아웃
- 클릭으로 신체 부위 선택
- 스캔 애니메이션 효과
- 부위별 증상 정보 표시

## 🛠 Tech Stack

- React 18 + TypeScript
- React Three Fiber
- Three.js
- Zustand (상태관리)
- TailwindCSS

## 📁 Project Structure

```
src/
├── components/
│   ├── Scene/          # 3D 씬 컴포넌트
│   ├── UI/             # UI 컴포넌트
│   └── Canvas3D.tsx    # R3F Canvas
├── stores/             # Zustand 스토어
├── constants/          # 상수 (부위 데이터)
├── types/              # TypeScript 타입
└── hooks/              # 커스텀 훅
```

## 📝 다음 단계

1. 실제 GLTF 인체 모델 적용 (Mixamo Xbot.glb)
2. Fresnel 셰이더 효과
3. 스캔 라인 셰이더
4. 백엔드 연동

자세한 내용은 [PROJECT_SPEC.md](./PROJECT_SPEC.md) 참조
