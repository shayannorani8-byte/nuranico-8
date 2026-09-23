'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePageTexts } from '../lib/usePageTexts';

export default function SiteHeader() {
  const { lang, text } = usePageTexts('global');
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    let active = true;

    import('../lib/supabase')
      .then(({ supabase }) =>
        supabase
          .from('site_settings')
          .select('logo_url')
          .eq('id', 1)
          .maybeSingle()
      )
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.error('Could not load site logo:', error);
          return;
        }

        setLogoUrl(data?.logo_url || '');
      })
      .catch(error => {
        console.error('Could not load site logo:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const [startProjectUrl, setStartProjectUrl] = useState('/contact');

  useEffect(() => {
    let active = true;

    import('../lib/supabase')
      .then(({ supabase }) =>
        supabase
          .from('site_content')
          .select('start_project_url')
          .limit(1)
          .maybeSingle()
      )
      .then(({ data }) => {
        if (active && data?.start_project_url) {
          setStartProjectUrl(data.start_project_url);
        }
      })
      .catch(error => {
        console.error('Could not load Start Project URL:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  const t = {
    work: text('nav_work', 'Work', 'پروژه‌ها'),
    services: text('nav_services', 'Services', 'خدمات'),
    about: text('nav_about', 'About', 'درباره ما'),
    brands: text('nav_brands', 'Brands', 'برندها'),
    contact: text('nav_contact', 'Contact', 'تماس'),
    cta: text('start_project', 'Start a project', 'شروع پروژه'),
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-nav ${menuOpen ? 'is-open' : ''}`}>
      <Link
        className="brand"
        href="/"
        aria-label="NURANICO"
        onClick={closeMenu}
      >
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="NURANICO"
            className="site-logo-image"
          />
        ) : (
          <span>
            NURANICO
            <span className="brand-mark">®</span>
          </span>
        )}
      </Link>

      <nav className="desktop-nav" aria-label={text(
        'main_navigation',
        'Main navigation',
        'ناوبری اصلی'
      )}>
        <Link href="/work">{t.work}</Link>
        <Link href="/services">{t.services}</Link>
        <Link href="/about">{t.about}</Link>
        <Link href="/#brands">{t.brands}</Link>
        <Link href="/contact">{t.contact}</Link>
      </nav>

      <div className="nav-actions">
        <button
          className="lang-switch"
          type="button"
          onClick={() => {
            const next = lang === 'en' ? 'fa' : 'en';

            window.localStorage.setItem('nuranico-lang', next);

            window.dispatchEvent(
              new StorageEvent('storage', {
                key: 'nuranico-lang',
                newValue: next,
              })
            );
          }}
          aria-label={text(
            'change_language',
            'Change language',
            'تغییر زبان'
          )}
        >
          {lang === 'en' ? 'FA' : 'EN'}
        </button>

        <a
          className="nav-cta"
          href={startProjectUrl || '/contact'}
        >
          {t.cta}
        </a>

        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={text(
            'open_menu',
            'Open menu',
            'باز کردن منو'
          )}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
        </button>
      </div>

      <div className="mobile-menu">
        <Link href="/work" onClick={closeMenu}>
          {t.work}
        </Link>

        <Link href="/services" onClick={closeMenu}>
          {t.services}
        </Link>

        <Link href="/about" onClick={closeMenu}>
          {t.about}
        </Link>

        <Link href="/#brands" onClick={closeMenu}>
          {t.brands}
        </Link>

        <Link href="/contact" onClick={closeMenu}>
          {t.contact}
        </Link>
      </div>
    </header>
  );
}
