'use client';
import {useState,type ReactNode} from 'react';
import ProjectGallery from './ProjectGallery';
export default function BtsGallery({items,title,lang,renderVideo}:{items:{url:string;video:boolean;label:string}[];title:string;lang:'en'|'fa';renderVideo:(url:string)=>ReactNode}){
 const [kind,setKind]=useState<'photo'|'video'>('photo');
 const filtered=items.filter(item=>item.video===(kind==='video'));
 return <div className="bts-typed-gallery">
  <div className="bts-type-switch" role="group" aria-label={title}>{(['photo','video'] as const).map(type=><button type="button" key={type} aria-pressed={kind===type} onClick={()=>setKind(type)}>{lang==='fa' ? type==='photo' ? 'عکس‌ها' : 'ویدیوها' : type==='photo' ? 'Photos' : 'Videos'} <span>{new Intl.NumberFormat(lang).format(items.filter(item=>item.video===(type==='video')).length)}</span></button>)}</div>
  {filtered.length ? <ProjectGallery key={kind} items={filtered} title={title} lang={lang} renderVideo={renderVideo}/> : <p className="bts-type-empty" role="status">{lang==='fa' ? kind==='photo' ? 'هنوز عکس پشت‌صحنه‌ای منتشر نشده است.' : 'هنوز ویدیوی پشت‌صحنه‌ای منتشر نشده است.' : kind==='photo' ? 'No behind-the-scenes photos yet.' : 'No behind-the-scenes videos yet.'}</p>}
 </div>;
}
