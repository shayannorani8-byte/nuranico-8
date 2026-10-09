'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSiteLanguage } from '../components/SiteLanguage';
import { useSiteData } from '../components/SiteData';

export type PageTextRow = {
  id: number;
  page: string;
  text_key: string;
  label: string | null;
  value_en: string;
  value_fa: string;
  sort_order: number;
};

export function usePageTexts(page: string) {
  const { pageTexts } = useSiteData();
  const [rows, setRows] = useState<PageTextRow[]>(() => pageTexts.filter(row => row.page === page));
  const { lang, setLang } = useSiteLanguage();
  const [loading, setLoading] = useState(true);

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

        if (!cancelled && response.ok) {
          setRows(data.items || []);
        }
      } catch (error) {
        console.error(`Could not load page texts for ${page}:`, error);

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
    setLang,
    loading,
    text,
  };
}
