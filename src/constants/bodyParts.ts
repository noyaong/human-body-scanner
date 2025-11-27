import type { BodyPart } from '@/types';

export const BODY_PARTS: Record<string, BodyPart> = {
  // Head
  head: {
    id: 'head',
    meshName: 'mixamorigHead',
    displayName: '머리',
    description: '두통, 어지러움, 편두통, 뇌 관련 증상',
    category: 'head',
    relatedSymptoms: ['두통', '어지러움', '편두통', '시력저하', '이명'],
  },
  neck: {
    id: 'neck',
    meshName: 'mixamorigNeck',
    displayName: '목',
    description: '목 통증, 경추 디스크, 거북목 증후군',
    category: 'head',
    relatedSymptoms: ['목통증', '경추디스크', '거북목', '어깨결림', '손저림'],
  },

  // Torso
  chest: {
    id: 'chest',
    meshName: 'mixamorigSpine2',
    displayName: '가슴',
    description: '흉통, 호흡 곤란, 심장 관련 증상',
    category: 'torso',
    relatedSymptoms: ['흉통', '호흡곤란', '가슴답답함', '심계항진'],
  },
  upperBack: {
    id: 'upperBack',
    meshName: 'mixamorigSpine1',
    displayName: '등 상부',
    description: '등 통증, 자세 문제, 견갑골 통증',
    category: 'torso',
    relatedSymptoms: ['등통증', '자세불량', '견갑골통증', '어깨결림'],
  },
  lowerBack: {
    id: 'lowerBack',
    meshName: 'mixamorigSpine',
    displayName: '허리',
    description: '요통, 디스크, 척추측만증',
    category: 'torso',
    relatedSymptoms: ['요통', '허리디스크', '척추측만', '좌골신경통'],
  },
  abdomen: {
    id: 'abdomen',
    meshName: 'mixamorigHips',
    displayName: '복부/골반',
    description: '복통, 소화 장애, 골반 통증',
    category: 'torso',
    relatedSymptoms: ['복통', '소화불량', '골반통', '생리통'],
  },

  // Arms
  leftShoulder: {
    id: 'leftShoulder',
    meshName: 'mixamorigLeftShoulder',
    displayName: '왼쪽 어깨',
    description: '어깨 결림, 오십견, 회전근개 손상',
    category: 'arm',
    relatedSymptoms: ['어깨결림', '오십견', '팔저림', '어깨통증'],
  },
  rightShoulder: {
    id: 'rightShoulder',
    meshName: 'mixamorigRightShoulder',
    displayName: '오른쪽 어깨',
    description: '어깨 결림, 오십견, 회전근개 손상',
    category: 'arm',
    relatedSymptoms: ['어깨결림', '오십견', '팔저림', '어깨통증'],
  },
  leftArm: {
    id: 'leftArm',
    meshName: 'mixamorigLeftArm',
    displayName: '왼쪽 팔',
    description: '팔 통증, 근육통, 팔꿈치 통증',
    category: 'arm',
    relatedSymptoms: ['팔통증', '근육통', '테니스엘보', '팔저림'],
  },
  rightArm: {
    id: 'rightArm',
    meshName: 'mixamorigRightArm',
    displayName: '오른쪽 팔',
    description: '팔 통증, 근육통, 팔꿈치 통증',
    category: 'arm',
    relatedSymptoms: ['팔통증', '근육통', '테니스엘보', '팔저림'],
  },
  leftForeArm: {
    id: 'leftForeArm',
    meshName: 'mixamorigLeftForeArm',
    displayName: '왼쪽 전완',
    description: '전완 통증, 손목 터널 증후군',
    category: 'arm',
    relatedSymptoms: ['전완통증', '손목터널증후군', '손저림'],
  },
  rightForeArm: {
    id: 'rightForeArm',
    meshName: 'mixamorigRightForeArm',
    displayName: '오른쪽 전완',
    description: '전완 통증, 손목 터널 증후군',
    category: 'arm',
    relatedSymptoms: ['전완통증', '손목터널증후군', '손저림'],
  },
  leftHand: {
    id: 'leftHand',
    meshName: 'mixamorigLeftHand',
    displayName: '왼손',
    description: '손 저림, 관절염, 손가락 통증',
    category: 'arm',
    relatedSymptoms: ['손저림', '관절염', '손가락통증', '손목통증'],
  },
  rightHand: {
    id: 'rightHand',
    meshName: 'mixamorigRightHand',
    displayName: '오른손',
    description: '손 저림, 관절염, 손가락 통증',
    category: 'arm',
    relatedSymptoms: ['손저림', '관절염', '손가락통증', '손목통증'],
  },

  // Legs
  leftThigh: {
    id: 'leftThigh',
    meshName: 'mixamorigLeftUpLeg',
    displayName: '왼쪽 허벅지',
    description: '대퇴부 통증, 좌골신경통, 근육통',
    category: 'leg',
    relatedSymptoms: ['대퇴부통증', '좌골신경통', '근육통', '고관절통증'],
  },
  rightThigh: {
    id: 'rightThigh',
    meshName: 'mixamorigRightUpLeg',
    displayName: '오른쪽 허벅지',
    description: '대퇴부 통증, 좌골신경통, 근육통',
    category: 'leg',
    relatedSymptoms: ['대퇴부통증', '좌골신경통', '근육통', '고관절통증'],
  },
  leftKnee: {
    id: 'leftKnee',
    meshName: 'mixamorigLeftLeg',
    displayName: '왼쪽 무릎/종아리',
    description: '무릎 통증, 관절염, 종아리 경련',
    category: 'joint',
    relatedSymptoms: ['무릎통증', '관절염', '종아리경련', '정맥류'],
  },
  rightKnee: {
    id: 'rightKnee',
    meshName: 'mixamorigRightLeg',
    displayName: '오른쪽 무릎/종아리',
    description: '무릎 통증, 관절염, 종아리 경련',
    category: 'joint',
    relatedSymptoms: ['무릎통증', '관절염', '종아리경련', '정맥류'],
  },
  leftFoot: {
    id: 'leftFoot',
    meshName: 'mixamorigLeftFoot',
    displayName: '왼발',
    description: '족저근막염, 발목 염좌, 아킬레스건 통증',
    category: 'leg',
    relatedSymptoms: ['족저근막염', '발목염좌', '아킬레스건통증', '발저림'],
  },
  rightFoot: {
    id: 'rightFoot',
    meshName: 'mixamorigRightFoot',
    displayName: '오른발',
    description: '족저근막염, 발목 염좌, 아킬레스건 통증',
    category: 'leg',
    relatedSymptoms: ['족저근막염', '발목염좌', '아킬레스건통증', '발저림'],
  },
};

// meshName으로 BodyPart 찾기
export function findBodyPartByMeshName(meshName: string): BodyPart | null {
  // meshName이 정확히 일치하거나 포함되어 있는지 확인
  for (const part of Object.values(BODY_PARTS)) {
    if (meshName.toLowerCase().includes(part.meshName.toLowerCase().replace('mixamorig', ''))) {
      return part;
    }
  }
  return null;
}

// 카테고리별 부위 그룹화
export function getPartsByCategory(category: BodyPart['category']): BodyPart[] {
  return Object.values(BODY_PARTS).filter((part) => part.category === category);
}
