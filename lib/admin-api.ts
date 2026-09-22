import { cookies } from 'next/headers';
import { getAdminCookieName, verifyAdminToken } from '@/lib/admin-auth';

export async function requireAdmin() {
  const store = await cookies();
  const token = store.get(getAdminCookieName())?.value;

  if (!(await verifyAdminToken(token))) {
    throw new Error('UNAUTHORIZED');
  }
}

export function jsonError(error: unknown) {
  console.error('===== NURANICO API ERROR =====');
  console.error(error);
  console.error('==============================');

  if (error instanceof Error && error.message === 'UNAUTHORIZED') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let message = 'Request failed';

  if (error instanceof Error) {
    message = error.message;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    message = String((error as { message?: unknown }).message || 'Request failed');
  } else if (typeof error === 'string') {
    message = error;
  }

  return new Response(
    JSON.stringify({
      error: message,
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
