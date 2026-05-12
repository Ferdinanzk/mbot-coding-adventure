'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { SheetsClient } from '@/lib/sheets-client';

export default function HomePage() {
  const router = useRouter();
  const { t, toggleLang, lang } = useI18n();
  const sounds = useSoundEffects();
  const [showLogin, setShowLogin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const sheetsConfigured = !!process.env.NEXT_PUBLIC_SHEETS_URL;

  const handleGuestPlay = () => {
    const saved = localStorage.getItem('mbot_game_state');
    if (saved) {
      router.push('/levels');
    } else {
      router.push('/character');
    }
  };

  const handleLogin = async () => {
    setError('');
    if (!name || !pin) return;
    setLoading(true);
    const res = await SheetsClient.loginStudent(name, pin);
    setLoading(false);
    if (res.success && res.student_id) {
      const saved = localStorage.getItem('mbot_game_state');
      const state = saved ? JSON.parse(saved) : {};
      state.isGuest = false;
      state.studentId = res.student_id;
      state.studentName = name;
      localStorage.setItem('mbot_game_state', JSON.stringify(state));
      router.push('/levels');
    } else {
      setError(t.errors.invalidPin);
    }
  };

  const handleCreate = async () => {
    setError('');
    if (!name) return;
    setLoading(true);
    const res = await SheetsClient.createStudent(name, 'robot-1');
    setLoading(false);
    if (res.success && res.student_id && res.pin) {
      alert(`Account created! Your PIN is: ${res.pin}`);
      const saved = localStorage.getItem('mbot_game_state');
      const state = saved ? JSON.parse(saved) : {};
      state.isGuest = false;
      state.studentId = res.student_id;
      state.studentName = name;
      localStorage.setItem('mbot_game_state', JSON.stringify(state));
      router.push('/character');
    } else {
      setError(res.error || t.errors.nameTaken);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-b from-[#E8F6F3] to-[#D1F2EB]">
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleLang}
          className="px-3 py-1 rounded-full bg-white shadow text-sm font-medium text-gray-900 hover:bg-gray-50"
        >
          {lang === 'zh-TW' ? 'EN' : '中文'}
        </button>
      </div>

      <div className="text-center mb-10">
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#2C3E50] mb-3">{t.appName}</h1>
        <p className="text-lg text-[#5D6D7E]">{t.home.subtitle}</p>
      </div>

      {!showLogin && !showCreate && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => { sounds.click(); handleGuestPlay(); }}
            className="w-full py-4 rounded-2xl bg-[#3498DB] text-white text-xl font-bold shadow-lg hover:scale-105 transition-transform"
          >
            {t.home.playNow}
          </button>
          {sheetsConfigured ? (
            <>
              <button
                onClick={() => { sounds.click(); setShowLogin(true); }}
                className="w-full py-4 rounded-2xl bg-[#2ECC71] text-white text-xl font-bold shadow-lg hover:scale-105 transition-transform"
              >
                {t.home.studentLogin}
              </button>
              <button
                onClick={() => { sounds.click(); setShowCreate(true); }}
                className="w-full py-3 rounded-2xl bg-white text-[#2C3E50] text-lg font-bold shadow hover:scale-105 transition-transform"
              >
                {t.home.createAccount}
              </button>
            </>
          ) : (
            <div className="text-center text-sm text-[#5D6D7E] bg-white/60 rounded-xl px-3 py-2">
              {lang === 'zh-TW'
                ? '訪客模式：無需登入即可遊玩。進度儲存在本機。'
                : 'Guest mode: Play without logging in. Progress saved locally.'}
            </div>
          )}
        </div>
      )}

      {(showLogin || showCreate) && (
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <input
            type="text"
            placeholder={t.home.enterName}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3498DB] outline-none text-lg text-gray-900"
            maxLength={20}
          />
          {showLogin && (
            <input
              type="password"
              placeholder={t.home.enterPin}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3498DB] outline-none text-lg text-gray-900"
              maxLength={4}
            />
          )}
          {error && <div className="text-[#E74C3C] text-sm">{error}</div>}
          <button
            onClick={() => { sounds.click(); showLogin ? handleLogin() : handleCreate(); }}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#3498DB] text-white text-lg font-bold shadow hover:scale-105 transition-transform disabled:opacity-50"
          >
            {loading ? '...' : showLogin ? t.home.login : t.home.createAccount}
          </button>
          <button
            onClick={() => { sounds.click(); setShowLogin(false); setShowCreate(false); setError(''); }}
            className="text-[#5D6D7E] hover:text-[#2C3E50]"
          >
            {t.home.back}
          </button>
        </div>
      )}
    </div>
  );
}
