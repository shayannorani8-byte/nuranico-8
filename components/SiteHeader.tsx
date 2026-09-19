import { useState } from 'react';
import Link from 'next/link';

export default function SiteHeader() {
  const [lang, setLang] = useState<'en' | 'fa'>('en');
  const [menuOpen, setMenuOpen] = useState(false);

  const t =
    lang === 'en'
      ? {
          work: 'Work',
          services: 'Services',
          about: 'About',
          brands: 'Brands',
          contact: 'Contact',
          cta: 'Start a project',
        }
      : {
          work: 'پروژه‌ها',
          services: 'خدمات',
          about: 'درباره ما',
          brands: 'برندها',
          contact: 'تماس',
          cta: 'شروع پروژه',
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
        <span>
          NURANICO
          <span className="brand-mark">®</span>
        </span>
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/work">{t.work}</Link>
        <Link href="/services">{t.services}</Link>
        <Link href="/about">{t.about}</Link>
        <Link href="/clients">{t.brands}</Link>
        <Link href="/contact">{t.contact}</Link>
      </nav>

      <div className="nav-actions">
        <button
          className="lang-switch"
          type="button"
          onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}
          aria-label="Change language"
        >
          {lang === 'en' ? 'FA' : 'EN'}
        </button>

        <a
          className="nav-cta"
          href="mailto:hello@nuranico.com"
        >
          {t.cta}
        </a>

        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Open menu"
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

        <Link href="/clients" onClick={closeMenu}>
          {t.brands}
        </Link>

        <Link href="/contact" onClick={closeMenu}>
          {t.contact}
        </Link>
      </div>
    </header>
  );
}
