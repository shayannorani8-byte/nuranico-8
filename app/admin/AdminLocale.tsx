'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import dictionary from './admin-translations.json';

type Language = 'en' | 'fa';
const translations:Record<string,string> = dictionary;
const Locale = createContext({lang:'en' as Language,t:(text:string | null | undefined) => text || '',toggle:() => {}});

export function AdminLocaleProvider({children}:{children:ReactNode}) {
  const [lang,setLang] = useState<Language>('en');
  useEffect(() => {try {if(localStorage.getItem('nuranico-admin-language') === 'fa') setLang('fa');} catch {}},[]);
  function toggle() {const next = lang === 'en' ? 'fa' : 'en';setLang(next);try {localStorage.setItem('nuranico-admin-language',next);} catch {}}
  function t(text:string | null | undefined) {if(!text) return '';return lang === 'fa' ? translations[text] || text : text;}
  return <Locale.Provider value={{lang,t,toggle}}>{children}</Locale.Provider>;
}

export function useAdminLocale() {return useContext(Locale);}
