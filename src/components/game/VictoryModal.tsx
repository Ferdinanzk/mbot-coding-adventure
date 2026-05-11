'use client';

import { useEffect, useRef } from 'react';

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

function loadConfetti(): Promise<any> {
  return new Promise((resolve) => {
    if ((window as any).confetti) {
      resolve((window as any).confetti);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js';
    script.onload = () => resolve((window as any).confetti);
    document.head.appendChild(script);
  });
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
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    loadConfetti().then((confetti) => {
      if (!confetti) return;
      const colors = stars === 3
        ? ['#FFD700', '#FFA500', '#FF6B6B', '#2ECC71', '#3498DB']
        : stars === 2
        ? ['#C0C0C0', '#3498DB', '#FFFFFF']
        : ['#CD7F32', '#E67E22', '#FFFFFF'];

      // Main burst
      confetti({
        particleCount: stars === 3 ? 150 : 80,
        spread: 70,
        origin: { y: 0.6 },
        shapes: ['star', 'circle'],
        colors,
        disableForReducedMotion: true,
      });

      // Side bursts for 3 stars
      if (stars === 3) {
        const end = Date.now() + 2000;
        const frame = () => {
          confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
          confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }
    });
  }, [stars]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl animate-pop-in">
        <div className="text-5xl mb-4 animate-bounce">{stars === 3 ? '🏆' : stars === 2 ? '⭐' : '👍'}</div>
        <h2 className="text-2xl font-bold mb-2">{stars === 3 ? '完美！' : stars === 2 ? '做得好！' : '關卡完成'}</h2>

        <div className="flex justify-center gap-1 text-3xl mb-4">
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              className={`transition-transform duration-500 ${i < stars ? 'scale-100' : 'scale-75 opacity-30'}`}
              style={{ transitionDelay: `${i * 200}ms` }}>
              {i < stars ? '⭐' : '☆'}
            </span>
          ))}
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
              className="w-full py-3 rounded-xl bg-[#2ECC71] text-white font-bold hover:scale-105 transition-transform animate-slide-up"
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
