"use client";

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
    <main className="content-page">
      <SiteHeader />

      <section className="inner-hero">
        <p>{text('eyebrow', '01 / SERVICES', '01 / خدمات')}</p>
        <h1>{text(
          'hero_title',
          'From idea to final frame.',
          'از ایده تا فریم نهایی.'
        )}</h1>
      </section>

      <section className="service-list">
        {services.map((service) => (
          <article key={service.number}>
            <span>{service.number}</span>

            <div>
              <h2>{service.title}</h2>
              <p>{service.text}</p>

              <a
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
                  zIndex: 9999,
                }}
              >
                {text('view_service', 'VIEW SERVICE ↗', 'مشاهده سرویس ↗')}
              </a>
            </div>

            <b>↗</b>
          </article>
        ))}
      </section>

      <footer className="content-footer">
        <a href="/">
          {text('back_home', 'Back home ↗', 'بازگشت به خانه ↗')}
        </a>
      </footer>
    </main>
  );
}
