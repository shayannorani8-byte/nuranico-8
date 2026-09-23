import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get('page')?.trim() || '';
    const db = getAdminSupabase();

    let query = db
      .from('page_texts')
      .select('id,page,text_key,label,value_en,value_fa,sort_order')
      .order('sort_order', { ascending: true })
      .order('id', { ascending: true });

    if (page) {
      query = query.eq('page', page);
    }

    const result = await query;

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json(
      {
        items: result.data || [],
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Public page texts error:', error);

    return NextResponse.json(
      { error: 'Could not load page texts', items: [] },
      { status: 500 }
    );
  }
}
