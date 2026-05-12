'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { createDefaultState } from '@/hooks/useGameState';

interface LevelProgress {
  id: number;
  unlocked: boolean;
  completed: boolean;
  bestStars: number;
  bestBlocks: number;
}

interface SecretProgress {
  id: number;
  unlocked: boolean;
  played: boolean;
}


export default function LevelSelectPage() {
  const router = useRouter();
  const { t } = useI18n();
  const sounds = useSoundEffects();
  const [levels, setLevels] = useState<LevelProgress[]>([]);
  const [secrets, setSecrets] = useState<SecretProgress[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('mbot_game_state');
    const state = saved ? JSON.parse(saved) : createDefaultState();
    setLevels(state.levels || []);
    setSecrets(state.secretLevels || []);
    setStreak(state.streak || 0);
    if (!saved) {
      localStorage.setItem('mbot_game_state', JSON.stringify(state));
    }
  }, []);

  const handleSelect = (id: number) => {
    router.push(`/code/${id}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="flex items-center justify-between w-full max-w-lg mb-6">
        <button onClick={() => { sounds.click(); router.push('/'); }} className="text-lg text-gray-900">← {t.home.back}</button>
        <div className="flex items-center gap-2">
          <span>🔥 {streak}</span>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">{t.levelSelect.title}</h2>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => { sounds.click(); level.unlocked && handleSelect(level.id); }}
            disabled={!level.unlocked}
            className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              level.completed
                ? 'bg-[#2ECC71] text-white'
                : level.unlocked
                ? 'bg-[#3498DB] text-white hover:scale-110'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {!level.unlocked ? (
              <span className="text-2xl">🔒</span>
            ) : (
              <>
                <span className="text-xl font-bold">{level.id}</span>
                {level.completed && (
                  <div className="text-xs">{'⭐'.repeat(level.bestStars)}{'☆'.repeat(3 - level.bestStars)}</div>
                )}
              </>
            )}
          </button>
        ))}
      </div>

      {secrets.some((s) => s.unlocked) && (
        <>
          <h3 className="text-xl font-bold mb-4">{t.levelSelect.secretLevels}</h3>
          <div className="grid grid-cols-3 gap-3">
            {secrets.map((secret) => (
              secret.unlocked && !secret.played && (
                <button
                  key={secret.id}
                  onClick={() => { sounds.click(); handleSelect(secret.id); }}
                  className="w-20 h-20 rounded-xl bg-[#FF6B6B] text-white hover:scale-110 transition-all flex flex-col items-center justify-center gap-1"
                >
                  <span className="text-xl">🎁</span>
                  <span className="text-xs">{t.levels[secret.id]?.name || '?'}</span>
                </button>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
}
