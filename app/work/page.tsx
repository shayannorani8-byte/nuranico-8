'use client';

import SiteHeader from '../../components/SiteHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ContentStatus from '../../components/ContentStatus';
import { localizedValue, isVideoAsset } from '../../lib/media';
import { usePageTexts } from '../../lib/usePageTexts';

type Item = {
  id: number;
  href?: string;
  brand_name?: string | null;
  title_en?: string;
  title_fa: string;
  category: string;
  cover_url?: string | null;
  media_url?: string | null;
  media_type?: string | null;
};

export default function WorkPage() {
  const searchParams = useSearchParams();
  const requestedDestination = searchParams.get('destination') || 'work';
  const destination = ['film', 'photography', 'content'].includes(requestedDestination) ? requestedDestination : 'all';
  const { lang, text } = usePageTexts('work');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    async function loadProjects() {
      try {
        const response = await fetch(
          `/api/public/projects?destination=${destination}`,
          { cache: 'no-store', signal: AbortSignal.timeout(12000) }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || 'Could not load work');
        }

        if (!cancelled) setItems(result.items || []);
      } catch (error) {
        console.error('Could not load work:', error);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProjects();
    return () => { cancelled = true; };
  }, [destination, retry]);

  const getType = (item: Item) => {
    const category = (item.category || '').toLowerCase();

    if (
      isVideoAsset(item) ||
      category === 'video' ||
      category === 'film'
    ) {
      return text('video_type', 'VIDEO', 'ویدیو');
    }

    return text('photo_type', 'PHOTO', 'عکس');
  };

  return (
    <main className="content-page work-gallery-page">
      <SiteHeader />

      <header className="work-page-head">
        <h1>{destination === 'film' ? (lang === 'fa' ? 'فیلم و تیزر' : 'Film & Teasers') : destination === 'photography' ? (lang === 'fa' ? 'عکاسی' : 'Photography') : destination === 'content' ? (lang === 'fa' ? 'محتوا' : 'Content') : text('title', 'Our work.', 'پروژه‌های ما.')}</h1>
      </header>
      {loading ? <ContentStatus>{text('loading', 'Loading projects…', 'در حال بارگذاری پروژه‌ها…')}</ContentStatus> : error ? (
        <ContentStatus error onRetry={() => setRetry(value => value + 1)} retryLabel={text('retry', 'Try again', 'تلاش دوباره')}>
          {text('load_error', 'Projects could not be loaded.', 'پروژه‌ها بارگذاری نشدند.')}
        </ContentStatus>
      ) : items.length === 0 ? <ContentStatus>{text('empty_projects', 'No projects have been published here yet.', 'هنوز پروژه‌ای در این بخش منتشر نشده است.')}</ContentStatus> : null}
      <section className="work-clean-grid">
        {!loading && !error &&
          items.map((item) => {
            const type = getType(item);
            const image = item.cover_url || (!isVideoAsset(item) ? item.media_url : '');

            return (
              <Link
                href={item.href || `/work/${item.id}`}
                className="work-clean-item"
                key={item.id}
              >
                <div className="work-clean-media">
                  {image ? (
                    <img
                      src={image}
                      alt={localizedValue(lang, item.title_en, item.title_fa, text('project_alt', 'NURANICO project', 'پروژه NURANICO'))}
                      loading="lazy"
                    />
                  ) : (
                    <video src={item.media_url || undefined} preload="metadata" muted playsInline />
                  )}
                </div>

                <div className="work-clean-info">{item.brand_name && <p className="asset-brand-caption" dir="auto">{item.brand_name}</p>}
                  <h2>
                    {localizedValue(lang, item.title_en, item.title_fa, text('untitled', 'Untitled', 'بدون عنوان'))}
                  </h2>

                  <span className="work-clean-type">
                    {type}
                  </span>
                </div>
              </Link>
            );
          })}
      </section>
    </main>
  );
}
