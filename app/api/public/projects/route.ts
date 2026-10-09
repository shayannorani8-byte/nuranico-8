import { NextRequest, NextResponse } from 'next/server';
import { isVideoAsset } from '@/lib/media';
import { getAdminSupabase } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const allowed = new Set([
  'all',
  'home',
  'work',
  'film',
  'photography',
  'content',
  'featured',
  'bts',
]);

export async function GET(request: NextRequest) {
  try {
    const destination =
      request.nextUrl.searchParams.get('destination') || '';

    if (!allowed.has(destination)) {
      return NextResponse.json(
        { items: [], error: 'Invalid destination' },
        { status: 400 }
      );
    }

    const db = getAdminSupabase();
    const homeOnly = destination === 'home' || request.nextUrl.searchParams.get('home') === '1';
    let mediaQuery = db.from('media_assets').select('id,name,file_url,file_type,mime_type,brand_name,project_name,destinations,show_on_home').eq('published',true).order('created_at',{ascending:false});
    if (destination !== 'home' && destination !== 'work' && destination !== 'all') mediaQuery = mediaQuery.contains('destinations',[destination]);
    if (homeOnly) mediaQuery = mediaQuery.eq('show_on_home',true);
    const assets = await mediaQuery;
    if (assets.error) throw assets.error;
    const assetItems = (assets.data || []).filter(asset => asset.destinations?.length).map(asset => ({
      show_on_home:asset.show_on_home, brand_name:asset.brand_name, id:-asset.id, href:`/media/${asset.id}`, title_en:asset.project_name || asset.name, title_fa:asset.project_name || asset.name,
      description_en:asset.brand_name || '', description_fa:asset.brand_name || '',
      media_url:asset.file_url, media_type:isVideoAsset(asset) ? 'video' : 'image', cover_url:isVideoAsset(asset) ? null : asset.file_url,
      preview_url:isVideoAsset(asset) ? asset.file_url : null, preview_enabled:isVideoAsset(asset), preview_type:'video',
      category:isVideoAsset(asset) ? 'video' : 'photo', destinations:asset.destinations,
    }));

    const [links, projects] = await Promise.all([
      db.from('project_destinations').select('project_id,destination'),
      db.from('portfolio').select('*').eq('published',true).order('sort_order',{ascending:true}).order('created_at',{ascending:false}),
    ]);
    if (links.error) throw links.error;
    if (projects.error) throw projects.error;
    const sections = new Map<number,string[]>();
    for (const link of links.data || []) sections.set(link.project_id,[...(sections.get(link.project_id) || []),link.destination]);
    const projectItems = (projects.data || []).filter(project => {
      const assigned = sections.get(project.id) || [];
      const explicit = assigned.filter(section => ['film','photography','content','bts'].includes(section));
      // Legacy published projects can lack section links; classify them by their actual media.
      const fallback = isVideoAsset(project) ? 'film' : /photograph|photo/i.test(project.category || '') ? 'photography' : /content/i.test(project.category || '') ? 'content' : 'work';
      const matches = destination === 'all' || destination === 'work' || assigned.includes(destination) || (!explicit.length && destination === fallback);
      return matches && (!homeOnly || assigned.includes('home'));
    }).map(project => ({...project,show_on_home:(sections.get(project.id) || []).includes('home')}));

    return NextResponse.json(
      { items: [...projectItems, ...assetItems].sort((a,b) => Number(!!b.show_on_home) - Number(!!a.show_on_home)) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Public projects API error:', error);

    return NextResponse.json(
      {
        items: [],
        error:
          error instanceof Error
            ? error.message
            : 'Could not load projects',
      },
      { status: 500 }
    );
  }
}
