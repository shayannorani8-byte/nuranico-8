'use client';

import SiteHeader from '../../components/SiteHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePageTexts } from '../../lib/usePageTexts';
import { localizedValue } from '../../lib/media';
import { useSiteData } from '../../components/SiteData';

export default function ContactPage() {
  const initialData = useSiteData();
  const [email, setEmail] = useState(String(initialData.content.contact_email || 'hello@nuranico.com'));
  const [instagram, setInstagram] = useState(String(initialData.content.contact_instagram || ''));
  const [personalInstagram, setPersonalInstagram] = useState(String(initialData.content.personal_instagram || ''));
  const [phone, setPhone] = useState(String(initialData.content.contact_phone || ''));
  const [titles, setTitles] = useState({ en: String(initialData.content.contact_title_en || ''), fa: String(initialData.content.contact_title_fa || '') });
  const { lang, text } = usePageTexts('contact');

  useEffect(() => {
    import('../../lib/supabase').then(({ supabase }) =>
      supabase
        .from('site_content')
        .select('*')
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setTitles({ en: data.contact_title_en || '', fa: data.contact_title_fa || '' });
            setPhone(data.contact_phone || '');
          }
          if (data?.contact_email) {
            setEmail(data.contact_email);
          }

          if (data?.contact_instagram) {
            setInstagram(data.contact_instagram);
          }

          if (data?.personal_instagram) {
            setPersonalInstagram(data.personal_instagram);
          }
        })
    );
  }, []);



  const channels = [
    { label:text('email_label','Email','ایمیل'),value:email,href:`mailto:${email}`,icon:'M4 6h16v12H4z M4 6l8 6 8-6',external:false },
    ...(phone ? [{label:text('phone_label','Phone','تلفن'),value:phone,href:`tel:${phone.replace(/[۰-۹]/g,digit=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))).replace(/[٠-٩]/g,digit=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[^0-9+]/g,'')}`,icon:'M6 3h4l1 5-2 2c1 3 2 4 5 5l2-2 5 1v4c-9 2-19-8-15-15z',external:false}] : []),
    ...[instagram,personalInstagram].filter(Boolean).map((url,index)=>({label:index===0?text('studio_instagram','Studio Instagram','اینستاگرام استودیو'):text('director_instagram','Director Instagram','اینستاگرام کارگردان'),value:'@'+url.replace(/^https?:\/\/(www\.)?instagram\.com\//i,'').replace(/^@/,'').split(/[/?#]/)[0],href:url,icon:'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4z M16 12a4 4 0 11-8 0 4 4 0 018 0 M17.5 6.5h.01',external:true})),
  ];
  return (
    <main className="content-page contact-page">
      <SiteHeader />
      <section className="contact-inner">
        <div className="contact-intro">
          <p className="contact-kicker">{text('contact_label','Contact','تماس')}</p>
          <h1>{localizedValue(lang,titles.en,titles.fa,text('title','Let’s create something.','بیایید چیزی بسازیم.'))}</h1>
          <p className="contact-description">{text('description','Tell us about the next project.','پروژه بعدی‌تان را برای ما بفرستید.')}</p>
        </div>
        <div className="contact-channels">
          {channels.map(channel=><a key={channel.href} className="contact-channel" href={channel.href} target={channel.external?'_blank':undefined} rel={channel.external?'noreferrer':undefined}>
            <span className="contact-channel-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d={channel.icon}/></svg></span>
            <span className="contact-channel-copy"><span className="contact-channel-label">{channel.label}</span><span className="contact-channel-value" lang="en" dir="ltr">{channel.value}</span></span>
          </a>)}
        </div>
      </section>
      <footer className="inner-footer"><span lang="en" dir="ltr">NURANICO®</span><Link href="/">{text('back_home','Back home','بازگشت به خانه')}</Link></footer>
    </main>
  );
}
