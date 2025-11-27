import { useState, useEffect } from 'react';
import { X, AlertCircle, Check } from 'lucide-react';
import { useScannerStore } from '@/stores/scannerStore';
import { BODY_PARTS } from '@/constants/bodyParts';
import type { SymptomRecord } from '@/types';

interface SymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
  partId: string | null;
}

const SEVERITY_LABELS = ['경미', '가벼움', '보통', '심함', '매우 심함'];
const SEVERITY_COLORS = [
  'bg-green-500',
  'bg-lime-500',
  'bg-yellow-500',
  'bg-orange-500',
  'bg-red-500',
];

export function SymptomModal({ isOpen, onClose, partId }: SymptomModalProps) {
  const { addSymptom } = useScannerStore();

  const [severity, setSeverity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [description, setDescription] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const partInfo = partId ? BODY_PARTS[partId] : null;

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) {
      setSeverity(3);
      setDescription('');
      setSelectedSymptoms([]);
      setShowSuccess(false);
    }
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = () => {
    if (!partId) return;

    const symptomText = [
      ...selectedSymptoms,
      description.trim() ? description.trim() : null,
    ]
      .filter(Boolean)
      .join(', ');

    const record: SymptomRecord = {
      partId,
      severity,
      description: symptomText || '증상 기록됨',
      timestamp: new Date(),
    };

    addSymptom(record);
    setShowSuccess(true);

    // 1.5초 후 모달 닫기
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen || !partInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative w-full max-w-md mx-4 bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 animate-in fade-in zoom-in-95 duration-200">
        {/* 성공 오버레이 */}
        {showSuccess && (
          <div className="absolute inset-0 bg-gray-900/95 rounded-2xl flex flex-col items-center justify-center z-10 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <p className="text-green-400 text-lg font-medium">
              증상이 기록되었습니다
            </p>
          </div>
        )}

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">증상 기록</h3>
              <p className="text-cyan-400 text-sm">{partInfo.displayName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 증상 심각도 */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              증상 심각도
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setSeverity(level as 1 | 2 | 3 | 4 | 5)}
                  className={`
                    flex-1 py-3 rounded-lg text-sm font-medium transition-all
                    ${
                      severity === level
                        ? `${SEVERITY_COLORS[level - 1]} text-white scale-105 shadow-lg`
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="mt-2 text-center text-sm">
              <span className={`${severity >= 4 ? 'text-red-400' : 'text-gray-400'}`}>
                {SEVERITY_LABELS[severity - 1]}
              </span>
            </p>
          </div>

          {/* 관련 증상 선택 */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              관련 증상 선택
            </label>
            <div className="flex flex-wrap gap-2">
              {partInfo.relatedSymptoms.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-all
                    ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                        : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                    }
                  `}
                >
                  {symptom}
                </button>
              ))}
            </div>
          </div>

          {/* 추가 설명 */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              추가 설명 (선택)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="증상에 대해 자세히 설명해주세요..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 resize-none"
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-gray-800 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium hover:bg-gray-700 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedSymptoms.length === 0 && !description.trim()}
            className={`
              flex-1 py-3 rounded-xl font-medium transition-all
              ${
                selectedSymptoms.length === 0 && !description.trim()
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20'
              }
            `}
          >
            기록하기
          </button>
        </div>
      </div>
    </div>
  );
}
