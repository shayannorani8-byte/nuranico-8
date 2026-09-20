'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Props = { dark?: boolean };

export default function SiteHeader({ dark = true }: Props) {
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [logoUrl, setLogoUrl] = useState('');
  const [email, setEmail] = useState('hello@nuranico.com');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('nuranico-lang');
    if (saved === 'fa' || saved === 'en') setLang(saved);
    import('../../lib/supabase').then(({ supabase }) =>
      Promise.all([
        supabase.from('site_settings').select('logo_url').limit(1).maybeSingle(),
        supabase.from('site_content').select('contact_email').limit(1).maybeSingle(),
      ]).then(([settings, content]) => {
        if (settings.data?.logo_url) setLogoUrl(settings.data.logo_url);
        if (content.data?.contact_email) setEmail(content.data.contact_email);
      })
    );
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    window.localStorage.setItem('nuranico-lang', lang);
  }, [lang]);

  const text = {
    work: lang === 'fa' ? 'نمونه‌کارها' : 'Work',
    services: lang === 'fa' ? 'خدمات' : 'Services',
    about: lang === 'fa' ? 'درباره' : 'About',
    clients: lang === 'fa' ? 'مشتریان' : 'Clients',
    contact: lang === 'fa' ? 'تماس' : 'Contact',
    cta: lang === 'fa' ? 'شروع یک پروژه' : 'Start a project',
  };

  return (
    <header className={`global-header ${dark ? 'dark' : 'light'} ${open ? 'open' : ''}`}>
      <Link href="/" className="global-logo" aria-label="NURANICO">
        {logoUrl ? <img src={logoUrl} alt="NURANICO" /> : <>NURANICO<span>®</span></>}
      </Link>

      <nav className="global-nav">
        <Link href="/#work">{text.work}</Link>
        <Link href="/services">{text.services}</Link>
        <Link href="/about">{text.about}</Link>
        <Link href="/#brands">{text.clients}</Link>
        <Link href="/contact">{text.contact}</Link>
      </nav>

      <div className="global-actions">
        <button type="button" className="global-lang" onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}>
          {lang === 'en' ? 'FA' : 'EN'}
        </button>
        <a className="global-cta" href={`mailto:${email}`}>{text.cta}<b>↗</b></a>
        <button type="button" className="global-menu" onClick={() => setOpen(v => !v)} aria-label="Menu" aria-expanded={open}>
          <span /><span />
        </button>
      </div>

      <div className="global-mobile">
        <Link href="/#work" onClick={() => setOpen(false)}>{text.work}</Link>
        <Link href="/services" onClick={() => setOpen(false)}>{text.services}</Link>
        <Link href="/about" onClick={() => setOpen(false)}>{text.about}</Link>
        <Link href="/#brands" onClick={() => setOpen(false)}>{text.clients}</Link>
        <Link href="/contact" onClick={() => setOpen(false)}>{text.contact}</Link>
      </div>
    </header>
  );
}
