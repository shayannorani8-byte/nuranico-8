import type { Metadata } from 'next';
import { getAdminSupabase } from '../../lib/supabase-admin';
import BrandsDirectory from './BrandsDirectory';
export const metadata: Metadata = { title:'Brands', alternates:{canonical:'/brands'} };
export default async function BrandsPage(){
  try {
    const {data,error}=await getAdminSupabase().from('brands').select('id,name,logo_url,website_url').eq('published',true).order('sort_order',{ascending:true}).order('id',{ascending:true});
    return <BrandsDirectory brands={data || []} failed={!!error} />;
  } catch { return <BrandsDirectory brands={[]} failed />; }
}
