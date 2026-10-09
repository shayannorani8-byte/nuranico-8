import { NextRequest, NextResponse } from 'next/server';
import { isVideoAsset } from '@/lib/media';
import { getAdminSupabase } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const allowed = new Set([
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
    if (destination !== 'home' && destination !== 'work') mediaQuery = mediaQuery.contains('destinations',[destination]);
    if (homeOnly) mediaQuery = mediaQuery.eq('show_on_home',true);
    const assets = await mediaQuery;
    if (assets.error) throw assets.error;
    const assetItems = (assets.data || []).filter(asset => asset.destinations?.length).map(asset => ({
      brand_name:asset.brand_name, id:-asset.id, href:`/media/${asset.id}`, title_en:asset.project_name || asset.name, title_fa:asset.project_name || asset.name,
      description_en:asset.brand_name || '', description_fa:asset.brand_name || '',
      media_url:asset.file_url, media_type:isVideoAsset(asset) ? 'video' : 'image', cover_url:isVideoAsset(asset) ? null : asset.file_url,
      preview_url:isVideoAsset(asset) ? asset.file_url : null, preview_enabled:isVideoAsset(asset), preview_type:'video',
      category:isVideoAsset(asset) ? 'video' : 'photo', destinations:asset.destinations,
    }));

    const links = await db
      .from('project_destinations')
      .select('project_id')
      .eq('destination', destination);

    if (links.error) throw links.error;

    const ids = Array.from(
      new Set(
        (links.data || [])
          .map(row => row.project_id)
          .filter((id): id is number => typeof id === 'number')
      )
    );

    let visibleIds = ids;
    if (homeOnly && destination !== 'home') {
      const home = await db.from('project_destinations').select('project_id').eq('destination','home');
      if (home.error) throw home.error;
      const homeIds = new Set((home.data || []).map(row => row.project_id));
      visibleIds = ids.filter(id => homeIds.has(id));
    }
    if (!visibleIds.length) {
      return NextResponse.json(
        { items: assetItems },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const projects = await db
      .from('portfolio')
      .select('*')
      .in('id', visibleIds)
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (projects.error) throw projects.error;

    return NextResponse.json(
      { items: [...(projects.data || []), ...assetItems] },
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
