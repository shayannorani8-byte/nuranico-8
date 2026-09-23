'use client';

import SiteHeader from '../../components/SiteHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePageTexts } from '../../lib/usePageTexts';

type Item = {
  id: number;
  title_en?: string;
  title_fa: string;
  category: string;
  cover_url?: string | null;
  media_url?: string | null;
  media_type?: string | null;
};

export default function WorkPage() {
  const { text } = usePageTexts('work');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch(
          '/api/public/projects?destination=work',
          { cache: 'no-store' }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || 'Could not load work');
        }

        setItems(result.items || []);
      } catch (error) {
        console.error('Could not load work:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

  const getType = (item: Item) => {
    const mediaType = (item.media_type || '').toLowerCase();
    const category = (item.category || '').toLowerCase();

    if (
      mediaType.includes('video') ||
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

      <section className="work-clean-grid">
        {!loading &&
          items.map((item) => {
            const type = getType(item);

            return (
              <Link
                href={`/work/${item.id}`}
                className="work-clean-item"
                key={item.id}
              >
                <div className="work-clean-media">
                  {item.cover_url ? (
                    <img
                      src={item.cover_url}
                      alt={item.title_en || item.title_fa || text('project_alt', 'NURANICO project', 'پروژه NURANICO')}
                      loading="lazy"
                    />
                  ) : (
                    <div className="work-clean-empty" />
                  )}
                </div>

                <div className="work-clean-info">
                  <h2>
                    {item.title_en || item.title_fa}
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
