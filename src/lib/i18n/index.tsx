'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { zhTW, en, type Translations } from './translations';

type Lang = 'zh-TW' | 'en';

interface I18nContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'zh-TW',
  t: zhTW,
  setLang: () => {},
  toggleLang: () => {},
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mbot-lang') as Lang;
      if (saved === 'zh-TW' || saved === 'en') return saved;
    }
    return 'zh-TW';
  });

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mbot-lang', l);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'zh-TW' ? 'en' : 'zh-TW');
  }, [lang, setLang]);

  const t = lang === 'zh-TW' ? zhTW : en;

  return (
    <I18nContext.Provider value={{ lang, t, setLang, toggleLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
