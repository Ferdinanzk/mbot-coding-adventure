'use client';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export default function PauseOverlay({ onResume, onRestart, onQuit }: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-xs w-full mx-4 text-center shadow-2xl">
        <div className="text-5xl mb-4">⏸️</div>
        <h2 className="text-2xl font-bold mb-6">暫停</h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-xl bg-[#2ECC71] text-white font-bold hover:scale-105 transition-transform"
          >
            繼續遊戲
          </button>
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-xl bg-[#3498DB] text-white font-bold hover:scale-105 transition-transform"
          >
            重新開始
          </button>
          <button
            onClick={onQuit}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            離開
          </button>
        </div>
      </div>
    </div>
  );
}
