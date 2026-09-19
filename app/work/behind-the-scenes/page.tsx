'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
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

const demo = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85',
];

export default function BehindTheScenesPage() {
  const [lang, setLang] = useState<'en'|'fa'>('en');
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nuranico-lang');
    if (saved === 'fa' || saved === 'en') setLang(saved);
    supabase.from('portfolio').select('id,title_en,title_fa,category,cover_url,bts_media_url,bts_media_type,bts_gallery_urls')
      .eq('published', true).order('sort_order', {ascending:true})
      .then(({data}) => setItems((data || []).filter(x => x.bts_media_url || x.bts_gallery_urls?.length)));
  }, []);

  const sample = items.length ? items : demo.map((cover, i) => ({
    id: -(i+1), title_en: ['Motion / Identity','Editorial Story','Campaign Film','Visual Direction'][i],
    title_fa: ['Motion / Identity','Editorial Story','Campaign Film','Visual Direction'][i],
    category: i % 2 ? 'photo' : 'video', cover_url: cover,
    bts_media_url: i % 2 ? cover : 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    bts_media_type: i % 2 ? 'image' : 'video',
    bts_gallery_urls: [cover, demo[(i+1)%demo.length]]
  } as Item));

  return (
    <main className="content-page bts-page">
      <SiteHeader />
      <section className="inner-hero">
        <p>05 / BEHIND THE SCENES</p>
        <h1>{lang === 'fa' ? 'پشت صحنه‌ی پروژه‌ها.' : 'Behind the scenes.'}</h1>
      </section>
      <section className="bts-list">
        {sample.map((item, index) => (
          <Link className="bts-card" href={item.id > 0 ? `/work/${item.id}` : `/work/demo-${Math.abs(item.id)}`} key={item.id}>
            <div className="bts-card-media">
              <img src={item.bts_media_type === 'video' ? (item.cover_url || demo[index % demo.length]) : (item.bts_media_url || item.cover_url || demo[index % demo.length])} alt="" />
              {item.bts_media_type === 'video' ? <span className="bts-play">▶</span> : null}
            </div>
            <div className="bts-card-meta">
              <div><p>BEHIND THE SCENES / {String(index+1).padStart(2,'0')}</p><h2>{lang === 'fa' ? item.title_fa : item.title_en || item.title_fa}</h2></div>
              <span>VIEW PROJECT ↗</span>
            </div>
          </Link>
        ))}
      </section>
      <footer className="inner-footer"><span>NURANICO®</span><Link href="/work">Back to work ↗</Link></footer>
    </main>
  );
}
