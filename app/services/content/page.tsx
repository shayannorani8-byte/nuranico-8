'use client';

import Link from 'next/link';
import SiteHeader from '../../../components/SiteHeader';

export default function ContentPage() {
  return (
    <main className="service-page">
      <SiteHeader />

      <section className="service-hero">
        <span>03 / CONTENT</span>
        <h1>Content<br />with character.</h1>
        <p>
          Social-first visual content created to give brands a consistent and recognizable voice.
        </p>
      </section>

      <section className="service-content">
        <div className="service-line">
          <span>03 — SERVICE</span>
          <span>CONTENT</span>
        </div>

        <div className="service-grid">
          <h2>CREATE.<br />CONNECT.<br />REPEAT.</h2>

          <div>
            <p>
              From Instagram Reels and short-form videos to campaign content, we create
              visual assets that stay aligned with the brand and built for digital platforms.
            </p>

            <div className="service-meta">
              <div><span>REELS</span><strong>Instagram Reels</strong></div>
              <div><span>SOCIAL</span><strong>Social Content</strong></div>
              <div><span>CAMPAIGN</span><strong>Digital Campaigns</strong></div>
              <div><span>STRATEGY</span><strong>Visual Direction</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="service-bottom">
        <small>NURANICO / CREATIVE STUDIO</small>
        <h2>KEEP<br />CREATING.</h2>
        <Link href="/services">BACK TO SERVICES ↗</Link>
      </section>

      <style jsx>{`
        .service-page {
          min-height: 100vh;
          background: #151515;
          color: #f2f2f2;
          overflow: hidden;
        }

        .service-hero {
          min-height: 78vh;
          padding: 170px 6vw 100px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .service-hero > span {
          font-size: 9px;
          letter-spacing: .2em;
          color: #777;
          margin-bottom: 40px;
        }

        .service-hero h1 {
          margin: 0;
          font-size: clamp(75px, 15vw, 220px);
          line-height: .8;
          font-weight: 300;
          letter-spacing: -.08em;
        }

        .service-hero p {
          max-width: 470px;
          margin: 55px 0 0;
          color: #999;
          font-size: 15px;
          line-height: 1.8;
        }

        .service-content {
          padding: 100px 6vw 160px;
        }

        .service-line {
          border-top: 1px solid #333;
          padding: 15px 0 50px;
          display: flex;
          justify-content: space-between;
          color: #666;
          font-size: 9px;
          letter-spacing: .18em;
        }

        .service-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10vw;
        }

        .service-grid h2 {
          margin: 0;
          font-size: clamp(50px, 7vw, 105px);
          line-height: .88;
          font-weight: 300;
          letter-spacing: -.06em;
        }

        .service-grid p {
          max-width: 520px;
          color: #aaa;
          font-size: 16px;
          line-height: 1.9;
          margin: 0 0 70px;
        }

        .service-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-top: 1px solid #333;
        }

        .service-meta div {
          padding: 22px 0;
          border-bottom: 1px solid #333;
        }

        .service-meta span {
          display: block;
          color: #666;
          font-size: 8px;
          letter-spacing: .2em;
          margin-bottom: 10px;
        }

        .service-meta strong {
          font-size: 11px;
          font-weight: 400;
        }

        .service-bottom {
          min-height: 70vh;
          padding: 100px 6vw;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #191919;
        }

        .service-bottom small {
          color: #666;
          font-size: 9px;
          letter-spacing: .2em;
        }

        .service-bottom h2 {
          margin: 100px 0;
          font-size: clamp(75px, 15vw, 220px);
          line-height: .78;
          font-weight: 300;
          letter-spacing: -.08em;
        }

        .service-bottom a {
          width: max-content;
          color: #fff;
          text-decoration: none;
          border-bottom: 1px solid #555;
          padding-bottom: 12px;
          font-size: 9px;
          letter-spacing: .18em;
        }

        @media(max-width:800px) {
          .service-hero {
            padding: 140px 20px 80px;
          }

          .service-content {
            padding: 80px 20px 110px;
          }

          .service-grid {
            grid-template-columns: 1fr;
            gap: 60px;
          }

          .service-bottom {
            padding: 80px 20px;
          }
        }
      `}</style>
    </main>
  );
}
