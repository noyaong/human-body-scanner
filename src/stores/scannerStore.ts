import { create } from 'zustand';
import type { ScannerState, SymptomRecord, Gender } from '@/types';

interface ScannerStore extends ScannerState {
  // Actions
  setSelectedPart: (partId: string | null) => void;
  setHoveredPart: (partId: string | null) => void;
  setGender: (gender: Gender) => void;
  startScan: () => void;
  updateScanProgress: (progress: number) => void;
  endScan: () => void;

  // Symptom records
  symptoms: SymptomRecord[];
  addSymptom: (record: SymptomRecord) => void;
  removeSymptom: (index: number) => void;
  clearSymptoms: () => void;
}

export const useScannerStore = create<ScannerStore>((set) => ({
  // Initial state
  selectedPart: null,
  isScanning: false,
  scanProgress: 0,
  hoveredPart: null,
  gender: 'male',
  symptoms: [],

  // Actions
  setSelectedPart: (partId) => set({ selectedPart: partId }),

  setHoveredPart: (partId) => set({ hoveredPart: partId }),

  setGender: (gender) => set({ gender, selectedPart: null }),

  startScan: () => set({ isScanning: true, scanProgress: 0 }),

  updateScanProgress: (progress) => set({ scanProgress: progress }),

  endScan: () => set({ isScanning: false, scanProgress: 100 }),

  // Symptom management
  addSymptom: (record) =>
    set((state) => ({ symptoms: [...state.symptoms, record] })),

  removeSymptom: (index) =>
    set((state) => ({
      symptoms: state.symptoms.filter((_, i) => i !== index),
    })),

  clearSymptoms: () => set({ symptoms: [] }),
}));
