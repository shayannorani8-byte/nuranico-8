'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { useSiteData } from './SiteData';
import { isBilingualEnabled } from '../lib/site-language-settings';

type Language = 'en' | 'fa';
const LanguageContext = createContext<{ lang: Language; setLang: (lang: Language) => void; bilingual: boolean }>({
  lang: 'en', setLang: () => {}, bilingual: true,
});

export function SiteLanguage({ children }: { children: React.ReactNode }) {
  // Every new page load starts in English. The choice survives client navigation.
  const { pageTexts } = useSiteData();
  const bilingual = isBilingualEnabled(pageTexts);
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const lang = bilingual ? selectedLang : 'en';
  const setLang = (next: Language) => setSelectedLang(bilingual ? next : 'en');
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, bilingual }}>{children}</LanguageContext.Provider>;
}

export function useSiteLanguage() {
  return useContext(LanguageContext);
}
