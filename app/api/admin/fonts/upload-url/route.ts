import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, jsonError } from '@/lib/admin-api';
import { createUploadUrl, publicMediaUrl } from '@/lib/storage-servernet';

const MAX_BYTES = 25 * 1024 * 1024;

function safeName(name: string) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const name = String(body.name || 'font');
    const type = String(body.type || 'application/octet-stream');
    const size = Number(body.size || 0);

    const extension = name.split('.').pop()?.toLowerCase();

    if (!['woff2', 'woff', 'ttf', 'otf'].includes(extension || '')) {
      throw new Error('Only WOFF2, WOFF, TTF and OTF font files are supported.');
    }

    if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
      throw new Error('Font file must be between 1 byte and 25 MB.');
    }

    const key =
      `fonts/${Date.now()}-${crypto.randomUUID()}-${safeName(name)}`;

    const uploadUrl = await createUploadUrl(
      key,
      type || 'application/octet-stream'
    );

    return NextResponse.json({
      uploadUrl,
      key,
      fileUrl: publicMediaUrl(key),
    });

  } catch (error) {
    return jsonError(error);
  }
}
