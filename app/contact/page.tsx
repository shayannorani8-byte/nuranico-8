'use client';

import SiteHeader from '../../components/SiteHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePageTexts } from '../../lib/usePageTexts';
import { localizedValue } from '../../lib/media';
import { useSiteData } from '../../components/SiteData';

export default function ContactPage() {
  const initialData = useSiteData();
  const [email, setEmail] = useState(String(initialData.content.contact_email || 'hello@nuranico.com'));
  const [instagram, setInstagram] = useState(String(initialData.content.contact_instagram || ''));
  const [personalInstagram, setPersonalInstagram] = useState(String(initialData.content.personal_instagram || ''));
  const [phone, setPhone] = useState(String(initialData.content.contact_phone || ''));
  const [titles, setTitles] = useState({ en: String(initialData.content.contact_title_en || ''), fa: String(initialData.content.contact_title_fa || '') });
  const { lang, text } = usePageTexts('contact');

  useEffect(() => {
    import('../../lib/supabase').then(({ supabase }) =>
      supabase
        .from('site_content')
        .select('*')
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setTitles({ en: data.contact_title_en || '', fa: data.contact_title_fa || '' });
            setPhone(data.contact_phone || '');
          }
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



  return (
    <main className="content-page contact-page">
      <SiteHeader />

      <section className="contact-inner">

        <h1>
          {localizedValue(lang, titles.en, titles.fa, text('title', 'Let’s create something.', 'بیایید چیزی بسازیم.'))}
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
          lang="en"
          dir="ltr"
          href={`mailto:${email}`}
        >
          {email} ↗
        </a>

        {phone && <a className="contact-link" lang="en" dir="ltr" href={`tel:${phone.replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[^0-9+]/g, '')}`}>{phone}</a>}

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

            <span lang="en" dir="ltr">
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

            <span lang="en" dir="ltr">
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
        <span lang="en" dir="ltr">NURANICO®</span>

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
