'use client';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import { useSiteLanguage } from '../components/SiteLanguage';

export default function NotFound() {
  const { lang } = useSiteLanguage();
  return <main className="project-page">
    <SiteHeader />
    <section className="project-not-found">
      <p>404 / NURANICO</p>
      <h1>{lang === 'fa' ? 'صفحه پیدا نشد.' : 'Page not found.'}</h1>
      <Link href="/">{lang === 'fa' ? 'بازگشت به خانه ↗' : 'Back home ↗'}</Link>
    </section>
  </main>;
}
