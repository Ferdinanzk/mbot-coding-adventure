'use client';

interface VictoryModalProps {
  stars: number;
  points: number;
  blocksUsed: number;
  timeTaken: number;
  streak: number;
  onRetry: () => void;
  onNext: () => void;
  onMenu: () => void;
  hasNext: boolean;
}

export default function VictoryModal({
  stars,
  points,
  blocksUsed,
  timeTaken,
  streak,
  onRetry,
  onNext,
  onMenu,
  hasNext,
}: VictoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-bounce-in">
        <div className="text-5xl mb-4">{stars === 3 ? '🏆' : stars === 2 ? '⭐' : '👍'}</div>
        <h2 className="text-2xl font-bold mb-2">{stars === 3 ? '完美！' : stars === 2 ? '做得好！' : '關卡完成'}</h2>

        <div className="flex justify-center gap-1 text-3xl mb-4">
          {'⭐'.repeat(stars)}
          {'☆'.repeat(3 - stars)}
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <div className="flex justify-between"><span>使用方塊</span><span className="font-mono">{blocksUsed}</span></div>
          <div className="flex justify-between"><span>花費時間</span><span className="font-mono">{timeTaken.toFixed(1)}s</span></div>
          <div className="flex justify-between"><span>得分</span><span className="font-mono font-bold text-[#3498DB]">{points}</span></div>
          {streak > 0 && (
            <div className="flex justify-between text-[#E67E22]"><span>🔥 連勝</span><span className="font-mono font-bold">{streak}</span></div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {hasNext && (
            <button
              onClick={onNext}
              className="w-full py-3 rounded-xl bg-[#2ECC71] text-white font-bold hover:scale-105 transition-transform"
            >
              下一關 →
            </button>
          )}
          <button
            onClick={onRetry}
            className="w-full py-3 rounded-xl bg-[#3498DB] text-white font-bold hover:scale-105 transition-transform"
          >
            重試
          </button>
          <button
            onClick={onMenu}
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
          >
            選單
          </button>
        </div>
      </div>
    </div>
  );
}
