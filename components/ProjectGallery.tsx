'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Item = {url:string;video:boolean;label:string};
export default function ProjectGallery({items,title,lang,renderVideo}:{items:Item[];title:string;lang:'en'|'fa';renderVideo:(url:string)=>ReactNode}) {
  const [active,setActive] = useState<number | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const photos = items.filter(item => !item.video);
  useEffect(() => {
    if(active == null) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow='hidden';close.current?.focus();
    function keydown(event:KeyboardEvent) {
      if(event.key === 'Escape') setActive(null);
      if(event.key === 'ArrowRight') setActive(current => current == null ? null : (current+1)%photos.length);
      if(event.key === 'ArrowLeft') setActive(current => current == null ? null : (current-1+photos.length)%photos.length);
      if(event.key === 'Tab') {
        const buttons=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button') || []);
        const first=buttons[0],last=buttons[buttons.length-1];
        if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
        else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
      }
    }
    window.addEventListener('keydown',keydown);
    return () => {document.body.style.overflow=overflow;window.removeEventListener('keydown',keydown);previous?.focus();};
  },[active,photos.length]);
  return <>
    <section className="project-gallery refined-gallery" aria-label={title}>{items.map(item => <figure key={item.url} className={item.video ? 'gallery-video' : 'gallery-photo'}>{item.video ? renderVideo(item.url) : <button className="gallery-image-button" onClick={() => setActive(photos.findIndex(photo => photo.url===item.url))} aria-label={`${lang === 'fa' ? 'نمایش بزرگ تصویر' : 'View full image'}: ${item.label}`}><img src={item.url} alt={item.label} loading="lazy" /><span className="gallery-expand" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg></span></button>}</figure>)}</section>
    {active != null && photos[active] && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={title} ref={dialog} onClick={event => {if(event.target===event.currentTarget)setActive(null);}}>
      <button ref={close} className="gallery-lightbox-close" aria-label={lang==='fa' ? 'بستن تصویر' : 'Close image'} onClick={() => setActive(null)}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
      <img src={photos[active].url} alt={photos[active].label} />
      {photos.length>1 && <div className="gallery-lightbox-navigation" dir="ltr"><button aria-label={lang==='fa' ? 'تصویر قبلی' : 'Previous image'} onClick={() => setActive((active-1+photos.length)%photos.length)}>←</button><span>{active+1} / {photos.length}</span><button aria-label={lang==='fa' ? 'تصویر بعدی' : 'Next image'} onClick={() => setActive((active+1)%photos.length)}>→</button></div>}
    </div>}
  </>;
}
