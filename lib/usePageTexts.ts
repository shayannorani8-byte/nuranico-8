'use client';

import { useEffect, useMemo, useState } from 'react';

export type PageTextRow = {
  id: number;
  page: string;
  text_key: string;
  label: string | null;
  value_en: string;
  value_fa: string;
  sort_order: number;
};

type Language = 'en' | 'fa';

export function usePageTexts(page: string) {
  const [rows, setRows] = useState<PageTextRow[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('nuranico-lang')
        : null;

    if (saved === 'fa' || saved === 'en') {
      setLang(saved);
    }

    const handleStorage = () => {
      const current = window.localStorage.getItem('nuranico-lang');

      if (current === 'fa' || current === 'en') {
        setLang(current);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/public/page-texts?page=${encodeURIComponent(page)}`,
          { cache: 'no-store' }
        );

        const data = await response.json();

        if (!cancelled) {
          setRows(response.ok ? data.items || [] : []);
        }
      } catch (error) {
        console.error(`Could not load page texts for ${page}:`, error);

        if (!cancelled) {
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const map = useMemo(() => {
    const result: Record<string, PageTextRow> = {};

    for (const row of rows) {
      result[row.text_key] = row;
    }

    return result;
  }, [rows]);

  function text(
    key: string,
    fallbackEn = '',
    fallbackFa = fallbackEn
  ) {
    const row = map[key];

    if (!row) {
      return lang === 'fa' ? fallbackFa : fallbackEn;
    }

    const value =
      lang === 'fa'
        ? row.value_fa
        : row.value_en;

    if (value && value.trim()) {
      return value;
    }

    return lang === 'fa' ? fallbackFa : fallbackEn;
  }

  return {
    rows,
    lang,
    loading,
    text,
  };
}
