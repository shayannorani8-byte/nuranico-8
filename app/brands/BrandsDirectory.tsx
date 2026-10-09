'use client';
import {useState} from 'react';
import SiteHeader from '../../components/SiteHeader';
import PortfolioFooter from '../../components/PortfolioFooter';
import {useSiteLanguage} from '../../components/SiteLanguage';
type Brand={id:number;name:string;logo_url:string|null;website_url:string|null};
function websiteUrl(value:string|null){
  if(!value)return null;
  try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}
}
export default function BrandsDirectory({brands,failed}:{brands:Brand[];failed:boolean}){
  const {lang}=useSiteLanguage();
  const [query,setQuery]=useState('');
  const shown=brands.filter(brand=>brand.name.toLowerCase().includes(query.trim().toLowerCase()));
  return <main className="content-page brands-directory" lang={lang} dir={lang==='fa'?'rtl':'ltr'}>
    <SiteHeader />
    <section className="brands-directory-content">
      <header><h1>{lang==='fa'?'برندها':'Brands'}</h1><input type="search" value={query} onChange={event=>setQuery(event.target.value)} aria-label={lang==='fa'?'جست‌وجوی برند':'Search brands'} placeholder={lang==='fa'?'جست‌وجوی برند…':'Find a brand…'}/></header>
      {failed?<p role="alert">{lang==='fa'?'دریافت برندها ناموفق بود. صفحه را دوباره بارگذاری کنید.':'Brands could not be loaded. Please reload the page.'}</p>:
        <div className="brands-directory-grid">{shown.map((brand,index)=>{
          const url=websiteUrl(brand.website_url);
          const content=<><div className="directory-logo-stage">{brand.logo_url?<img src={brand.logo_url} alt={brand.name} loading="lazy"/>:<span dir="auto">{brand.name}</span>}</div>{brand.name?.trim()&&<h2 dir="auto">{brand.name}</h2>}{url&&<span className="directory-visit">{lang==='fa'?'وب‌سایت برند':'Visit website'}</span>}</>;
          return <article className="directory-brand-card" key={brand.id} style={{['--brand-delay' as string]:`${Math.min(index,10)*60}ms`}}>{url?<a href={url} target="_blank" rel="noopener noreferrer">{content}</a>:content}</article>;
        })}</div>}
      {!failed&&!shown.length&&<p>{lang==='fa'?(query?'برندی با این نام پیدا نشد.':'هنوز برندی اضافه نشده است.'):(query?'No matching brands.':'No brands added yet.')}</p>}
    </section>
    <PortfolioFooter />
  </main>;
}
