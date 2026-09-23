import { NextRequest, NextResponse } from 'next/server';
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

    if (!ids.length) {
      return NextResponse.json(
        { items: [] },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const projects = await db
      .from('portfolio')
      .select('*')
      .in('id', ids)
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (projects.error) throw projects.error;

    return NextResponse.json(
      { items: projects.data || [] },
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
