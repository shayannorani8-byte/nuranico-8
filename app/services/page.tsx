"use client";

import Link from 'next/link';
import SiteHeader from "../../components/SiteHeader";
import { usePageTexts } from "../../lib/usePageTexts";

export default function ServicesPage() {
  const { text } = usePageTexts('services');

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
    <main className="content-page services-index">
      <SiteHeader />

      <section className="inner-hero">
        <h1>{text(
          'hero_title',
          'From idea to final frame.',
          'از ایده تا فریم نهایی.'
        )}</h1>
      </section>

      <section className="service-list">
        {services.map((service) => (
          <article key={service.number}>

            <div>
              <h2>{service.title}</h2>
              <p>{service.text}</p>

              <Link
                href={service.href}
                style={{
                  display: "inline-block",
                  marginTop: "24px",
                  padding: "12px 20px",
                  border: "1px solid rgba(255,255,255,.35)",
                  color: "#fff",
                  textDecoration: "none",
                  cursor: "pointer",
                  position: "relative",

                }}
              >
                {text('view_service', 'VIEW SERVICE', 'مشاهده سرویس')}
              </Link>
            </div>


          </article>
        ))}
      </section>

      <footer className="content-footer">
        <Link href="/">
          {text('back_home', 'Back home', 'بازگشت به خانه')}
        </Link>
      </footer>
    </main>
  );
}
