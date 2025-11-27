export interface BodyPart {
  id: string;
  meshName: string;
  displayName: string;
  description: string;
  category: 'head' | 'torso' | 'arm' | 'leg' | 'joint';
  relatedSymptoms: string[];
}

export interface ScannerState {
  selectedPart: string | null;
  isScanning: boolean;
  scanProgress: number;
  hoveredPart: string | null;
}

export interface SymptomRecord {
  partId: string;
  severity: 1 | 2 | 3 | 4 | 5;
  description: string;
  timestamp: Date;
}
