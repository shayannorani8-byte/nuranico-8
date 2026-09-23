import { NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getAdminSupabase();

    // Get independent BTS media links
    const links = await db
      .from('bts_media')
      .select('id,media_asset_id,sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (links.error) {
      throw links.error;
    }

    const rows = links.data || [];

    if (!rows.length) {
      return NextResponse.json(
        {
          items: [],
          photos: [],
          videos: [],
        },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    const mediaIds = rows
      .map((row) => row.media_asset_id)
      .filter((id): id is number => typeof id === 'number');

    const assetsResult = await db
      .from('media_assets')
      .select(
        'id,name,file_url,file_type,mime_type,alt_text_en,alt_text_fa'
      )
      .in('id', mediaIds);

    if (assetsResult.error) {
      throw assetsResult.error;
    }

    const assetMap = new Map(
      (assetsResult.data || []).map((asset) => [
        asset.id,
        asset,
      ])
    );

    const items = rows
      .map((row) => {
        const asset = assetMap.get(row.media_asset_id);

        if (!asset) return null;

        const mime = String(
          asset.mime_type || ''
        ).toLowerCase();

        const fileType = String(
          asset.file_type || ''
        ).toLowerCase();

        const url = String(
          asset.file_url || ''
        ).toLowerCase();

        const isVideo =
          mime.startsWith('video/') ||
          fileType === 'video' ||
          /\.(mp4|webm|mov|m4v)(\?|$)/.test(url);

        return {
          id: row.id,
          media_asset_id: asset.id,
          name: asset.name,
          file_url: asset.file_url,
          file_type: asset.file_type,
          mime_type: asset.mime_type,
          alt_text_en: asset.alt_text_en,
          alt_text_fa: asset.alt_text_fa,
          sort_order: row.sort_order,
          kind: isVideo ? 'video' : 'photo',
        };
      })
      .filter(Boolean);

    const photos = items.filter(
      (item) => item?.kind === 'photo'
    );

    const videos = items.filter(
      (item) => item?.kind === 'video'
    );

    return NextResponse.json(
      {
        items,
        photos,
        videos,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Public BTS API error:', error);

    return NextResponse.json(
      {
        items: [],
        photos: [],
        videos: [],
        error:
          error instanceof Error
            ? error.message
            : 'Could not load BTS',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
