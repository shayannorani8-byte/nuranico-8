export default function MediaCountBadge({count,lang}:{count?:number;lang:'en'|'fa'}) {
  if(!count || count < 2) return null;
  return <span className="media-count-badge" lang={lang}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5" /></svg><span>{new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(count)} {lang === 'fa' ? 'محتوا' : 'items'}</span></span>;
}
