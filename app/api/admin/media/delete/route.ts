import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { deleteObject } from '@/lib/storage-servernet';
import { requireAdmin, jsonError } from '@/lib/admin-api';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const id = Number(body.id || 0);
    const filePath = String(body.filePath || '');

    if (!id) throw new Error('Missing media id.');

    const db = getAdminSupabase();

    const references = await db.from('project_media').select('project_id').eq('media_asset_id', id);
    if (references.error) throw references.error;
    if ((references.data || []).length) {
      throw new Error('This media is still attached to a project. Remove the project attachment first.');
    }

    const row = await db.from('media_assets').select('file_path').eq('id', id).maybeSingle();
    if (row.error) throw row.error;

    const key = filePath || row.data?.file_path || '';
    if (key) await deleteObject(key);

    const result = await db.from('media_assets').delete().eq('id', id);
    if (result.error) throw result.error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
