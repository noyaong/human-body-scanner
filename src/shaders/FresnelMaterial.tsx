import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Fresnel 홀로그램 머티리얼 - 가장자리 발광 효과 + 선택 영역 하이라이트
const FresnelMaterial = shaderMaterial(
  {
    uColor: new THREE.Color(0x2255cc), // 파란색 기본
    uFresnelColor: new THREE.Color(0x00ffff), // 시안 가장자리
    uFresnelPower: 2.5,
    uOpacity: 0.75,
    uTime: 0,
    uSelectedColor: new THREE.Color(0xff2200), // 밝은 빨간색/오렌지
    uScanY: -10.0,
    uScanActive: false,
    // 선택 영역 하이라이트
    uHighlightCenter: new THREE.Vector3(0, -100, 0),
    uHighlightRadius: 0.3,
    uHoveredCenter: new THREE.Vector3(0, -100, 0),
  },
  // Vertex Shader
  /*glsl*/ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vUv = uv;

      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;

      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;

      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  /*glsl*/ `
    uniform vec3 uColor;
    uniform vec3 uFresnelColor;
    uniform float uFresnelPower;
    uniform float uOpacity;
    uniform float uTime;
    uniform vec3 uSelectedColor;
    uniform float uScanY;
    uniform bool uScanActive;
    uniform vec3 uHighlightCenter;
    uniform float uHighlightRadius;
    uniform vec3 uHoveredCenter;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);

      // 선택 영역 거리 계산
      float distFromSelected = distance(vWorldPosition, uHighlightCenter);
      float selectedIntensity = 1.0 - smoothstep(0.0, uHighlightRadius, distFromSelected);
      bool isSelected = uHighlightCenter.y > -50.0 && selectedIntensity > 0.01;

      // 호버 영역 거리 계산
      float distFromHovered = distance(vWorldPosition, uHoveredCenter);
      float hoveredIntensity = 1.0 - smoothstep(0.0, uHighlightRadius * 0.8, distFromHovered);
      bool isHovered = uHoveredCenter.y > -50.0 && hoveredIntensity > 0.01 && !isSelected;

      // 홀로그램 파란색 기본 색상 (모델 원래 색상 무시)
      vec3 baseColor = vec3(0.15, 0.35, 0.85); // 파란색

      if (isSelected) {
        // 선택된 영역: 밝은 빨간색/오렌지 + 강한 펄스
        float pulse = 0.7 + sin(uTime * 6.0) * 0.3;
        vec3 selectColor = vec3(1.0, 0.2, 0.1); // 밝은 빨강
        baseColor = mix(baseColor, selectColor, selectedIntensity * pulse);
      } else if (isHovered) {
        // 호버 영역: 밝은 시안
        vec3 hoverColor = vec3(0.3, 0.9, 1.0);
        baseColor = mix(baseColor, hoverColor, hoveredIntensity * 0.8);
      }

      // Fresnel 가장자리 발광
      vec3 fresnelGlow = isSelected ? vec3(1.0, 0.4, 0.2) : vec3(0.0, 1.0, 1.0);
      vec3 finalColor = baseColor + fresnel * fresnelGlow * 0.8;

      // 선택 영역 추가 글로우 (더 강하게)
      if (isSelected) {
        float glowPulse = 0.5 + sin(uTime * 4.0) * 0.3;
        finalColor += vec3(1.0, 0.3, 0.1) * selectedIntensity * glowPulse;
      }

      // 호버 영역 글로우
      if (isHovered) {
        float hoverGlow = 0.3 + sin(uTime * 3.0) * 0.1;
        finalColor += vec3(0.0, 0.5, 0.6) * hoveredIntensity * hoverGlow;
      }

      // 스캔 라인 효과
      float scanWidth = 0.15;
      float distFromScan = abs(vWorldPosition.y - uScanY);
      float scanIntensity = uScanActive ?
        smoothstep(scanWidth, 0.0, distFromScan) * 1.5 : 0.0;

      vec3 scanColor = vec3(0.0, 1.0, 1.0);
      finalColor += scanColor * scanIntensity;

      // 최종 불투명도 계산
      float selectedOpacityBoost = isSelected ? selectedIntensity * 0.35 : 0.0;
      float hoveredOpacityBoost = isHovered ? hoveredIntensity * 0.2 : 0.0;
      float finalOpacity = uOpacity + fresnel * 0.25 + selectedOpacityBoost + hoveredOpacityBoost + scanIntensity * 0.3;

      // 홀로그램 라인 효과 (수평선)
      float linePattern = sin(vWorldPosition.y * 100.0 + uTime * 2.0) * 0.5 + 0.5;
      linePattern = smoothstep(0.4, 0.6, linePattern);
      finalColor += vec3(0.0, 0.4, 0.5) * linePattern * 0.08;

      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `
);

// React Three Fiber에 머티리얼 확장 등록
extend({ FresnelMaterial });

// TypeScript 타입 확장
declare global {
  namespace JSX {
    interface IntrinsicElements {
      fresnelMaterial: any;
    }
  }
}

export { FresnelMaterial };
