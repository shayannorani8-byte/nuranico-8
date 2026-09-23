'use client';
import SiteHeader from '../../../components/SiteHeader';


import Link from 'next/link';
import ServiceProjectShowcase from '../../../components/ServiceProjectShowcase';
import { usePageTexts } from '../../../lib/usePageTexts';

export default function PhotographyPage() {
  const { text } = usePageTexts('photography');

  return (
    <main className="service-page">
      <SiteHeader />



      <ServiceProjectShowcase
        destination="photography"
        eyebrow={text(
          'projects_eyebrow',
          'SELECTED PHOTOGRAPHY',
          'عکاسی منتخب'
        )}
        title={text(
          'projects_title',
          'Photography projects.',
          'پروژه‌های عکاسی.'
        )}
      />
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
            min-height: auto;
            padding: 72px 20px;
          }

          /* MOBILE TYPOGRAPHY */
          .service-hero h1 {
            max-width: 340px;
            font-size: clamp(34px, 9.5vw, 40px);
            line-height: .94;
            letter-spacing: -.045em;
          }

          .service-grid h2 {
            max-width: 340px;
            font-size: clamp(27px, 7.5vw, 33px);
            line-height: .98;
            letter-spacing: -.04em;
          }

          .service-grid p {
            font-size: 12px;
            line-height: 1.8;
            margin-bottom: 45px;
          }

          .service-bottom h2 {
            max-width: 340px;
            margin: 65px 0;
            font-size: clamp(31px, 8.5vw, 38px);
            line-height: .9;
            letter-spacing: -.045em;
          }

          .service-bottom small {
            font-size: 7px;
            letter-spacing: .16em;
          }
        }


        /* SERVICE TOP SPACING OPTIMIZATION */
        .service-hero {
          min-height: auto !important;
          padding: 125px 6vw 72px !important;
        }

        .service-hero > span {
          margin-bottom: 22px !important;
        }

        .service-hero h1 {
          margin-bottom: 28px !important;
        }

        .service-hero p {
          margin-top: 0 !important;
          max-width: 520px !important;
          line-height: 1.7 !important;
        }

        .service-content {
          padding: 72px 6vw 95px !important;
        }

        .service-line {
          margin-bottom: 52px !important;
        }

        .service-grid {
          gap: 7vw !important;
        }

        @media (max-width: 700px) {
          .service-hero {
            min-height: auto !important;
            padding: 92px 20px 52px !important;
          }

          .service-hero > span {
            margin-bottom: 16px !important;
          }

          .service-hero h1 {
            margin-bottom: 20px !important;
          }

          .service-hero p {
            margin-top: 0 !important;
            max-width: 100% !important;
            line-height: 1.65 !important;
          }

          .service-content {
            padding: 50px 20px 62px !important;
          }

          .service-line {
            margin-bottom: 34px !important;
          }

          .service-grid {
            gap: 32px !important;
          }
        }

      `}</style>
    </main>
  );
}
