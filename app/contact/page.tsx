'use client';

import SiteHeader from '../../components/SiteHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePageTexts } from '../../lib/usePageTexts';

export default function ContactPage() {
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [email, setEmail] = useState('hello@nuranico.com');
  const [instagram, setInstagram] = useState('');
  const [personalInstagram, setPersonalInstagram] = useState('');
  const { text } = usePageTexts('contact');

  useEffect(() => {
    const saved = localStorage.getItem('nuranico-lang');

    if (saved === 'fa' || saved === 'en') {
      setLang(saved);
    }

    import('../../lib/supabase').then(({ supabase }) =>
      supabase
        .from('site_content')
        .select('*')
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.contact_email) {
            setEmail(data.contact_email);
          }

          if (data?.contact_instagram) {
            setInstagram(data.contact_instagram);
          }

          if (data?.personal_instagram) {
            setPersonalInstagram(data.personal_instagram);
          }
        })
    );
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir =
      lang === 'fa' ? 'rtl' : 'ltr';

    localStorage.setItem('nuranico-lang', lang);
  }, [lang]);

  return (
    <main className="content-page contact-page">
      <SiteHeader />

      <section className="contact-inner">
        <p>
          {text('eyebrow', '06 / LET’S TALK', '06 / تماس')}
        </p>

        <h1>
          {text(
            'title',
            'Let’s create something.',
            'بیایید چیزی بسازیم.'
          )}
        </h1>

        <p>
          {text(
            'description',
            'Tell us about the next project.',
            'پروژه بعدی‌تان را برای ما بفرستید.'
          )}
        </p>

        <a
          className="contact-link"
          href={`mailto:${email}`}
        >
          {email} ↗
        </a>

        {instagram ? (
          <a
            className="contact-link"
            href={instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>

            <span lang="en">
              @{instagram
                .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
                .replace(/^@/, '')
                .split(/[/?#]/)[0]
                .replace(/\/$/, '')}
            </span>
          </a>
        ) : null}

        {personalInstagram ? (
          <a
            className="contact-link"
            href={personalInstagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
            </svg>

            <span lang="en">
              @{personalInstagram
                .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
                .replace(/^@/, '')
                .split(/[/?#]/)[0]
                .replace(/\/$/, '')}
            </span>
          </a>
        ) : null}
      </section>

      <footer className="inner-footer">
        <span>NURANICO®</span>

        <Link href="/">
          {text(
            'back_home',
            'Back home ↗',
            'بازگشت به خانه ↗'
          )}
        </Link>
      </footer>
    </main>
  );
}
