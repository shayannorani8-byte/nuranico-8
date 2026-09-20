'use client';
import SiteHeader from '../../components/SiteHeader';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Item={id:number;title_en?:string;title_fa:string;description_en?:string;description_fa?:string;category:string;cover_url?:string;media_url?:string;media_type?:string;brand_id?:number|null;bts_media_url?:string|null;bts_media_type?:string|null;bts_gallery_urls?:string[]|null};
const demo=['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85','https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85','https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85','https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85'];
export default function WorkPage(){
 const [lang,setLang]=useState<'en'|'fa'>('en'); const [items,setItems]=useState<Item[]>([]);
 useEffect(()=>{const s=localStorage.getItem('nuranico-lang');if(s==='fa'||s==='en')setLang(s);},[]);
 useEffect(()=>{document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';localStorage.setItem('nuranico-lang',lang);},[lang]);
 useEffect(()=>{import('../../lib/supabase').then(({supabase})=>supabase.from('portfolio').select('*').eq('published',true).order('sort_order').then(({data})=>setItems(data||[])));},[]);
 const list=items.length?items:Array.from({length:6},(_,i)=>({id:-(i+1),title_en:['Motion / Identity','Editorial Story','Campaign Film','Visual Direction','Brand Atmosphere','Social Film'][i],title_fa:['Motion / Identity','Editorial Story','Campaign Film','Visual Direction','Brand Atmosphere','Social Film'][i],category:['video','photo','content'][i%3],cover_url:demo[i%demo.length]}));
 return <main className="content-page"><SiteHeader /><section className="inner-hero"><p>02 / SELECTED WORK</p><h1>{lang==='fa'?'پروژه‌های منتخب.':'Selected work.'}</h1><Link className="inner-bts-link" href="/work/behind-the-scenes">{lang==='fa'?'مشاهده همه پشت صحنه‌ها ↗':'Explore all Behind the Scenes ↗'}</Link></section><section className="inner-grid">{list.map((item,i)=><Link href={item.id>0?`/work/${item.id}`:`/work/demo-${Math.abs(item.id)}`} className="inner-project" key={item.id}><div><img src={item.cover_url||demo[i%demo.length]} alt="" /></div><p>{item.category.toUpperCase()} / {String(i+1).padStart(2,'0')}</p><h2>{lang==='fa'?item.title_fa:item.title_en||item.title_fa}</h2></Link>)}</section><footer className="inner-footer"><span>NURANICO®</span><Link href="/">Home ↗</Link></footer></main>;
}