import { useState } from 'react';
import { useScannerStore } from '@/stores/scannerStore';
import { BODY_PARTS } from '@/constants/bodyParts';
import { Search, X, Syringe, BarChart3, History, Trash2 } from 'lucide-react';
import { SymptomModal } from './SymptomModal';

export function ControlPanel() {
  const {
    selectedPart,
    isScanning,
    scanProgress,
    startScan,
    setSelectedPart,
    symptoms,
    removeSymptom,
  } = useScannerStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const selectedPartInfo = selectedPart ? BODY_PARTS[selectedPart] : null;

  // 선택된 부위의 기록된 증상
  const partSymptoms = symptoms.filter((s) => s.partId === selectedPart);

  return (
    <>
      <div className="w-80 bg-scanner-panel p-5 flex flex-col gap-4 border-l border-scanner-cyan/20 overflow-y-auto">
        {/* Header */}
        <h2 className="text-scanner-cyan text-xl font-bold text-center flex items-center justify-center gap-2">
          <span className="text-2xl">🔬</span>
          Body Scanner
        </h2>

        {/* Scan Button */}
        <button
          onClick={startScan}
          disabled={isScanning}
          className={`
            flex items-center justify-center gap-2
            py-3 px-4 rounded-xl font-semibold
            transition-all duration-200
            ${
              isScanning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-cyan-400 hover:from-cyan-500 hover:to-cyan-300 hover:scale-[1.02]'
            }
          `}
        >
          <Search size={20} />
          {isScanning ? `스캔 중... ${Math.round(scanProgress)}%` : '전신 스캔 시작'}
        </button>

        {/* Progress bar */}
        {isScanning && (
          <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-100"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        )}

        {/* Selected Part Info */}
        {selectedPartInfo && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-red-400 font-bold text-lg flex items-center gap-2">
                <span>📍</span>
                {selectedPartInfo.displayName}
              </h3>
              <button
                onClick={() => setSelectedPart(null)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/10 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-gray-300 text-sm mb-4">
              {selectedPartInfo.description}
            </p>

            {/* Symptoms tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {selectedPartInfo.relatedSymptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-full"
                >
                  {symptom}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
              >
                <Syringe size={16} />
                증상 기록하기
              </button>
              <button className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]">
                <BarChart3 size={16} />
                상세 분석
              </button>
            </div>

            {/* 기록된 증상 표시 */}
            {partSymptoms.length > 0 && (
              <div className="mt-4 pt-4 border-t border-red-500/20">
                <h4 className="text-gray-400 text-xs font-medium mb-2 flex items-center gap-1">
                  <History size={12} />
                  기록된 증상
                </h4>
                <div className="space-y-2">
                  {partSymptoms.map((symptom, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between bg-gray-800/50 rounded-lg p-2"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              symptom.severity >= 4
                                ? 'bg-red-500'
                                : symptom.severity >= 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                          />
                          <span className="text-xs text-gray-300">
                            심각도 {symptom.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {symptom.description}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const realIndex = symptoms.findIndex(
                            (s) => s === symptom
                          );
                          if (realIndex !== -1) removeSymptom(realIndex);
                        }}
                        className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 전체 기록된 증상 요약 */}
        {symptoms.length > 0 && !selectedPart && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
            <h3 className="text-cyan-400 font-semibold text-sm mb-3 flex items-center gap-2">
              <History size={16} />
              기록된 증상 ({symptoms.length}개)
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {symptoms.map((symptom, index) => {
                const partInfo = BODY_PARTS[symptom.partId];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2 cursor-pointer hover:bg-gray-800/70 transition-colors"
                    onClick={() => setSelectedPart(symptom.partId)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          symptom.severity >= 4
                            ? 'bg-red-500'
                            : symptom.severity >= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                      />
                      <span className="text-sm text-gray-300">
                        {partInfo?.displayName || symptom.partId}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Lv.{symptom.severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help text */}
        <div className="mt-auto text-gray-500 text-xs text-center space-y-1 pt-4 border-t border-gray-800">
          <p>마우스 드래그: 회전</p>
          <p>스크롤: 줌 인/아웃</p>
          <p>클릭: 부위 선택</p>
        </div>
      </div>

      {/* 증상 기록 모달 */}
      <SymptomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        partId={selectedPart}
      />
    </>
  );
}
