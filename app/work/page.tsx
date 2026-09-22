'use client';

import SiteHeader from '../../components/SiteHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Item = {
  id: number;
  title_en?: string;
  title_fa: string;
  description_en?: string;
  description_fa?: string;
  category: string;
  cover_url?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  brand_id?: number | null;
  bts_media_url?: string | null;
  bts_media_type?: string | null;
  bts_gallery_urls?: string[] | null;
};

export default function WorkPage() {
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('nuranico-lang');

    if (saved === 'fa' || saved === 'en') {
      setLang(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('nuranico-lang', lang);
  }, [lang]);

  useEffect(() => {
    async function loadProjects() {
      const { supabase } = await import('../../lib/supabase');

      const { data, error } = await supabase
        .from('portfolio')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Could not load work:', error);
        setItems([]);
      } else {
        setItems(data || []);
      }

      setLoading(false);
    }

    void loadProjects();
  }, []);

  return (
    <main className="content-page">
      <SiteHeader />

      <section className="inner-hero">
        <p>02 / SELECTED WORK</p>

        <h1>
          {lang === 'fa'
            ? 'پروژه‌های منتخب.'
            : 'Selected work.'}
        </h1>

        <Link
          className="inner-bts-link"
          href="/work/behind-the-scenes"
        >
          {lang === 'fa'
            ? 'مشاهده همه پشت صحنه‌ها ↗'
            : 'Explore all Behind the Scenes ↗'}
        </Link>
      </section>

      {!loading && items.length === 0 ? (
        <section className="inner-grid">
          <p>
            {lang === 'fa'
              ? 'هنوز پروژه‌ای منتشر نشده است.'
              : 'No projects published yet.'}
          </p>
        </section>
      ) : (
        <section className="inner-grid">
          {items.map((item, index) => (
            <Link
              href={`/work/${item.id}`}
              className="inner-project"
              key={item.id}
            >
              {item.cover_url ? (
                <div>
                  <img
                    src={item.cover_url}
                    alt={
                      lang === 'fa'
                        ? item.title_fa
                        : item.title_en || item.title_fa
                    }
                    loading="lazy"
                  />
                </div>
              ) : null}

              <p>
                {item.category.toUpperCase()} /{' '}
                {String(index + 1).padStart(2, '0')}
              </p>

              <h2>
                {lang === 'fa'
                  ? item.title_fa
                  : item.title_en || item.title_fa}
              </h2>
            </Link>
          ))}
        </section>
      )}

      <footer className="inner-footer">
        <span>NURANICO®</span>
        <Link href="/">
          {lang === 'fa' ? 'خانه ↗' : 'Home ↗'}
        </Link>
      </footer>
    </main>
  );
}
