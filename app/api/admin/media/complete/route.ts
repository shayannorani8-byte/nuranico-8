import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { requireAdmin, jsonError } from '@/lib/admin-api';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();

    const name = String(body.name || '').trim();
    const key = String(body.key || '').trim();
    const mimeType = String(body.mimeType || '').trim();
    const fileUrl = String(body.fileUrl || '').trim();
    const size = Number(body.size || 0);

    if (!name || !key || !fileUrl) throw new Error('Missing media information.');
    if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/')) {
      throw new Error('Unsupported media type.');
    }

    const db = getAdminSupabase();
    const result = await db.from('media_assets').insert({
      name,
      file_url: fileUrl,
      file_path: key,
      file_type: mimeType.startsWith('video/') ? 'video' : 'image',
      mime_type: mimeType,
      file_size: Number.isFinite(size) ? size : null,
    }).select().single();

    if (result.error) throw result.error;

    return NextResponse.json({ row: result.data });
  } catch (error) {
    return jsonError(error);
  }
}
