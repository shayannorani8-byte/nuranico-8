import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, jsonError } from '@/lib/admin-api';
import { createUploadUrl, mediaKey, publicMediaUrl } from '@/lib/storage-servernet';

const MAX_BYTES = 500 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const name = String(body.name || 'file');
    const type = String(body.type || 'application/octet-stream');
    const size = Number(body.size || 0);

    if (!type.startsWith('image/') && !type.startsWith('video/')) {
      throw new Error('Only image and video files are supported.');
    }
    if (!Number.isFinite(size) || size <= 0 || size > MAX_BYTES) {
      throw new Error('File must be between 1 byte and 500 MB.');
    }

    const key = mediaKey(name);
    const uploadUrl = await createUploadUrl(key, type);

    return NextResponse.json({
      uploadUrl,
      key,
      fileUrl: publicMediaUrl(key),
    });
  } catch (error) {
    return jsonError(error);
  }
}
