import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { requireAdmin, jsonError } from '@/lib/admin-api';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const name = String(body.name || '').trim();
    const familyName = String(body.familyName || '').trim();
    const key = String(body.key || '').trim();
    const fileUrl = String(body.fileUrl || '').trim();
    const mimeType = String(body.mimeType || '').trim();
    const size = Number(body.size || 0);
    const weight = Number(body.weight || 400);
    const style = String(body.style || 'normal');

    const format =
      name.split('.').pop()?.toLowerCase() || '';

    if (!name || !familyName || !key || !fileUrl) {
      throw new Error('Missing font information.');
    }

    if (!['woff2', 'woff', 'ttf', 'otf'].includes(format)) {
      throw new Error('Unsupported font format.');
    }

    const db = getAdminSupabase();

    const result = await db
      .from('font_assets')
      .insert({
        name,
        family_name: familyName,
        file_url: fileUrl,
        file_path: key,
        mime_type: mimeType || null,
        file_size: Number.isFinite(size) ? size : null,
        format,
        font_weight: Number.isFinite(weight) ? weight : 400,
        font_style: style,
      })
      .select()
      .single();

    if (result.error) throw result.error;

    return NextResponse.json({
      row: result.data,
    });

  } catch (error) {
    return jsonError(error);
  }
}
