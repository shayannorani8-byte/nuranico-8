import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';
import { deleteObject } from '@/lib/storage-servernet';
import { requireAdmin, jsonError } from '@/lib/admin-api';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const id = Number(body.id || 0);

    if (!id) {
      throw new Error('Missing font id.');
    }

    const db = getAdminSupabase();

    const row = await db
      .from('font_assets')
      .select('file_path')
      .eq('id', id)
      .maybeSingle();

    if (row.error) throw row.error;

    const key = row.data?.file_path || '';

    if (key) {
      await deleteObject(key);
    }

    const result = await db
      .from('font_assets')
      .delete()
      .eq('id', id);

    if (result.error) throw result.error;

    return NextResponse.json({
      ok: true,
    });

  } catch (error) {
    return jsonError(error);
  }
}
