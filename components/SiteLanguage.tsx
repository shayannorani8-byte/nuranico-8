'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'fa';
const LanguageContext = createContext<{ lang: Language; setLang: (lang: Language) => void }>({
  lang: 'en', setLang: () => {},
});

export function SiteLanguage({ children }: { children: React.ReactNode }) {
  // Every new page load starts in English. The choice survives client navigation.
  const [lang, setLang] = useState<Language>('en');
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useSiteLanguage() {
  return useContext(LanguageContext);
}
