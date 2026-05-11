'use client';

import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const AVATARS = [
  { id: 'robot-1', emoji: '⚡', color: '#3498DB', name: '閃電' },
  { id: 'robot-2', emoji: '🔧', color: '#F1C40F', name: '齒輪' },
  { id: 'robot-3', emoji: '🚀', color: '#E67E22', name: '火箭' },
  { id: 'robot-4', emoji: '💻', color: '#9B59B6', name: '像素' },
  { id: 'robot-5', emoji: '🤖', color: '#1ABC9C', name: '機器人' },
  { id: 'robot-6', emoji: '🔊', color: '#E74C3C', name: '迴聲' },
];

export default function CharacterSelectPage() {
  const router = useRouter();
  const { t } = useI18n();
  const sounds = useSoundEffects();

  const handleSelect = (id: string) => {
    const saved = localStorage.getItem('mbot_game_state');
    if (saved) {
      const state = JSON.parse(saved);
      state.character = id;
      localStorage.setItem('mbot_game_state', JSON.stringify(state));
    }
    router.push('/levels');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">{t.characterSelect.title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            onClick={() => { sounds.click(); handleSelect(avatar.id); }}
            className="w-32 h-36 rounded-2xl border-4 border-transparent bg-gray-100 hover:scale-105 hover:border-current transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
            style={{ color: avatar.color }}
          >
            <span className="text-5xl">{avatar.emoji}</span>
            <span className="font-bold">{avatar.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
