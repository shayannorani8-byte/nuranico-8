'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '../../components/SiteHeader';

type Item = {
  id: number;
  title_en?: string;
  title_fa: string;
  category: string;
  cover_url?: string | null;
  bts_media_url?: string | null;
  bts_media_type?: string | null;
  bts_gallery_urls?: string[] | null;
};

export default function BehindTheScenesPage() {
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('nuranico-lang');

    if (saved === 'fa' || saved === 'en') {
      setLang(saved);
    }

    import('../../../lib/supabase').then(async ({ supabase }) => {
      const { data, error } = await supabase
        .from('portfolio')
        .select(
          'id,title_en,title_fa,category,cover_url,bts_media_url,bts_media_type,bts_gallery_urls'
        )
        .eq('published', true)
        .order('sort_order', { ascending: true });

      if (!error) {
        setItems(
          (data || []).filter(
            item =>
              !!item.bts_media_url ||
              !!item.bts_gallery_urls?.length
          )
        );
      }

      setLoading(false);
    });
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir =
      lang === 'fa' ? 'rtl' : 'ltr';

    localStorage.setItem('nuranico-lang', lang);
  }, [lang]);

  return (
    <main className="content-page bts-page">
      <SiteHeader />

      <section className="inner-hero">
        <p>05 / BEHIND THE SCENES</p>

        <h1>
          {lang === 'fa'
            ? 'پشت صحنه‌ی پروژه‌ها.'
            : 'Behind the scenes.'}
        </h1>
      </section>

      <section className="bts-list">
        {loading ? (
          <div className="bts-empty">
            <p>Loading…</p>
          </div>
        ) : items.length ? (
          items.map((item, index) => {
            const galleryImage =
              item.bts_gallery_urls?.find(Boolean) || null;

            const isVideo =
              item.bts_media_type === 'video';

            const previewImage =
              isVideo
                ? item.cover_url || galleryImage
                : item.bts_media_url ||
                  galleryImage ||
                  item.cover_url;

            return (
              <Link
                className="bts-card"
                href={`/work/${item.id}`}
                key={item.id}
              >
                <div className="bts-card-media">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt={
                        lang === 'fa'
                          ? item.title_fa
                          : item.title_en || item.title_fa
                      }
                      loading="lazy"
                    />
                  ) : (
                    <div className="bts-media-empty" />
                  )}

                  {isVideo ? (
                    <span className="bts-play">▶</span>
                  ) : null}
                </div>

                <div className="bts-card-meta">
                  <div>
                    <p>
                      BEHIND THE SCENES /{' '}
                      {String(index + 1).padStart(2, '0')}
                    </p>

                    <h2>
                      {lang === 'fa'
                        ? item.title_fa
                        : item.title_en || item.title_fa}
                    </h2>
                  </div>

                  <span>
                    {lang === 'fa'
                      ? 'مشاهده پروژه ↗'
                      : 'VIEW PROJECT ↗'}
                  </span>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="bts-empty">
            <p>
              {lang === 'fa'
                ? 'هنوز پشت صحنه‌ای منتشر نشده است.'
                : 'No behind-the-scenes projects published yet.'}
            </p>
          </div>
        )}
      </section>

      <footer className="inner-footer">
        <span>NURANICO®</span>

        <Link href="/work">
          {lang === 'fa'
            ? 'بازگشت به پروژه‌ها ↗'
            : 'Back to work ↗'}
        </Link>
      </footer>
    </main>
  );
}
