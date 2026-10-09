import { notFound } from 'next/navigation';
import SiteHeader from '../../../components/SiteHeader';
import { getAdminSupabase } from '../../../lib/supabase-admin';
import { isVideoAsset } from '../../../lib/media';

export const dynamic = 'force-dynamic';
export default async function MediaPage({params}:{params:Promise<{id:string}>}) {
  const {id} = await params;
  if (!/^\d+$/.test(id)) notFound();
  const {data,error} = await getAdminSupabase().from('media_assets').select('id,name,file_url,file_type,mime_type,brand_name,project_name,alt_text_en,alt_text_fa').eq('id',Number(id)).eq('published',true).single();
  if (error || !data) notFound();
  return <main className="content-page asset-detail-page"><SiteHeader /><article><header><p dir="auto">{data.brand_name}</p><h1 dir="auto">{data.project_name || data.name}</h1></header>{isVideoAsset(data) ? <video src={data.file_url} controls playsInline preload="metadata" /> : <img src={data.file_url} alt={data.alt_text_en || data.alt_text_fa || data.name} />}<a href="/work">← All work</a></article></main>;
}
