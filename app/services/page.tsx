"use client";

import SiteHeader from "../../components/SiteHeader";

export default function ServicesPage() {
  const services = [
    {
      number: "01",
      title: "Film & Teasers",
      text: "Cinematic stories for products, brands and campaigns.",
      href: "/services/film-teasers",
    },
    {
      number: "02",
      title: "Photography",
      text: "Precise imagery for campaigns, products and visual identity.",
      href: "/services/photography",
    },
    {
      number: "03",
      title: "Content",
      text: "Social-first content with a consistent visual language.",
      href: "/services/content",
    },
  ];

  return (
    <main className="content-page">

      <section className="inner-hero">
        <p>01 / SERVICES</p>
        <h1>From idea to final frame.</h1>
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
                VIEW SERVICE ↗
              </a>
            </div>

            <b>↗</b>
          </article>
        ))}
      </section>

      <footer className="content-footer">
        <a href="/">Back home ↗</a>
      </footer>
    </main>
  );
}
