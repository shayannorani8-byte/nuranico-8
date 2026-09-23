'use client';
import SiteHeader from '../../components/SiteHeader';


import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { usePageTexts } from '../../lib/usePageTexts';

type AboutContent = {
  about_title_en?: string | null;
  about_title_fa?: string | null;
  about_text_en?: string | null;
  about_text_fa?: string | null;
  about_image_url?: string | null;
};

export default function AboutPage() {
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [content, setContent] = useState<AboutContent>({});
  const { text: pageText } = usePageTexts('about');

  useEffect(() => {
    const savedLang = localStorage.getItem('nuranico-lang');

    if (savedLang === 'fa' || savedLang === 'en') {
      setLang(savedLang);
    }

    async function loadContent() {
      const { data, error } = await supabase
        .from('site_content')
        .select(
          'about_title_en,about_title_fa,about_text_en,about_text_fa,about_image_url'
        )
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setContent(data);
      }
    }

    void loadContent();
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    localStorage.setItem('nuranico-lang', lang);
  }, [lang]);

  const title =
    lang === 'fa'
      ? content.about_title_fa || 'درباره NURANICO'
      : content.about_title_en || 'About NURANICO';

  const text =
    lang === 'fa'
      ? content.about_text_fa ||
        'NURANICO یک استودیوی خلاق برای ساخت تصویر، ویدیو و محتوای تبلیغاتی است؛ از ایده و کارگردانی تا تولید و فریم نهایی.'
      : content.about_text_en ||
        'NURANICO is a creative studio for image, film and campaign content — from concept and direction to production and the final frame.';

  return (
    <main className="content-page">
      <SiteHeader />

      <section className="inner-hero split">
        <div>
          <p>{pageText('eyebrow', '03 / ABOUT', '03 / درباره')}</p>
          <h1>{title}</h1>
        </div>

        {content.about_image_url ? (
          <img
            src={content.about_image_url}
            alt={pageText(
              'image_alt',
              'NURANICO creative direction',
              'کارگردانی خلاق NURANICO'
            )}
          />
        ) : (
          <div className="about-image-placeholder" />
        )}
      </section>

      <section className="copy-section">
        <p className="eyebrow">
          {pageText('approach_eyebrow', 'OUR APPROACH', 'رویکرد ما')}
        </p>

        <h2>
          {pageText(
            'approach_title',
            'Images become memorable when they carry a story.',
            'تصویر، وقتی ماندگار می‌شود که داستان داشته باشد.'
          )}
        </h2>

        <p>{text}</p>
      </section>

      <footer className="inner-footer">
        <span>NURANICO®</span>
        <Link href="/">
          {pageText('back_home', 'Back home ↗', 'بازگشت به خانه ↗')}
        </Link>
      </footer>
    </main>
  );
}
