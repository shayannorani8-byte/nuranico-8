"use client";

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import SiteHeader from "../../components/SiteHeader";
import { usePageTexts } from "../../lib/usePageTexts";

function typeCopy(value: string) {
  let wordIndex = 0;
  return value.split(/(\s+)/).map((part,index) => /\s+/.test(part)
    ? part
    : <span className="service-type-word" key={index} style={{['--service-word-delay' as string]:`${wordIndex++ * 75}ms`}}>{part}</span>);
}

export default function ServicesPage() {
  const { text } = usePageTexts('services');
  const pageRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const page = pageRef.current;
    if (!page || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => {
      const cards = entries.filter(entry => entry.isIntersecting && entry.target.tagName === 'ARTICLE');
      cards.sort((a,b) => {
        const first=a.target.getBoundingClientRect(),second=b.target.getBoundingClientRect();
        return Math.abs(first.top-second.top)>10 ? first.top-second.top : first.left-second.left;
      }).forEach((entry,index) => (entry.target as HTMLElement).style.setProperty('--service-enter-delay',`${index * 420}ms`));
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('service-entered');
        observer.unobserve(entry.target);
      });
    }, {threshold:.08,rootMargin:'0px 0px -4% 0px'});
    page.classList.add('services-motion-ready');
    page.querySelectorAll('.service-enter').forEach(element => observer.observe(element));
    return () => { observer.disconnect();page.classList.remove('services-motion-ready'); };
  }, []);

  const services = [
    {
      number: "01",
      title: text(
        'film_title',
        'Film & Teasers',
        'فیلم و تیزر'
      ),
      text: text(
        'film_description',
        'Cinematic stories for products, brands and campaigns.',
        'داستان‌های سینمایی برای محصولات، برندها و کمپین‌ها.'
      ),
      href: "/services/film-teasers",
    },
    {
      number: "02",
      title: text(
        'photography_title',
        'Photography',
        'عکاسی'
      ),
      text: text(
        'photography_description',
        'Precise imagery for campaigns, products and visual identity.',
        'تصاویر دقیق برای کمپین‌ها، محصولات و هویت بصری.'
      ),
      href: "/services/photography",
    },
    {
      number: "03",
      title: text(
        'content_title',
        'Content',
        'محتوا'
      ),
      text: text(
        'content_description',
        'Social-first content with a consistent visual language.',
        'محتوای شبکه‌های اجتماعی با زبان بصری یکپارچه.'
      ),
      href: "/services/content",
    },
  ];

  return (
    <main ref={pageRef} className="content-page services-index">
      <SiteHeader />

      <section className="inner-hero service-enter">
        <h1>{typeCopy(text(
          'hero_title',
          'From idea to final frame.',
          'از ایده تا فریم نهایی.'
        ))}</h1>
      </section>

      <section className="service-list">
        {services.map((service) => (
          <article className="service-enter" key={service.number}>

            <div>
              <h2>{typeCopy(service.title)}</h2>
              <p>{typeCopy(service.text)}</p>

              <Link
                href={service.href}
                className="service-details-link"
              >
                {text('view_service', 'VIEW SERVICE', 'مشاهده سرویس')}
              </Link>
            </div>


          </article>
        ))}
      </section>

      <footer className="content-footer service-enter">
        <Link href="/">
          {text('back_home', 'Back home', 'بازگشت به خانه')}
        </Link>
      </footer>
    </main>
  );
}
