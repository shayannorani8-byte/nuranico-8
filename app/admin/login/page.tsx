import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminToken, getAdminCookieName } from '@/lib/admin-auth';

async function loginAction(formData: FormData) {
  'use server';

  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  const adminEmail = process.env.ADMIN_EMAIL || '';
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (
    !adminEmail ||
    !adminPassword ||
    email !== adminEmail ||
    password !== adminPassword
  ) {
    redirect('/admin/login?error=1');
  }

  const cookieStore = await cookies();

  cookieStore.set(getAdminCookieName(), await createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/admin');
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const hasError = params.error === '1';

  return (
    <main
      dir="rtl"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: '#111111',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.12)',
          background: '#181818',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '13px',
              letterSpacing: '0.22em',
              opacity: 0.55,
              marginBottom: '12px',
              direction: 'ltr',
            }}
          >
            NURANICO
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 500,
            }}
          >
            ورود به پنل مدیریت
          </h1>

          <p
            style={{
              marginTop: '10px',
              marginBottom: 0,
              color: 'rgba(255,255,255,0.55)',
              fontSize: '14px',
              lineHeight: 1.8,
            }}
          >
            برای مدیریت سایت وارد حساب مدیر شوید.
          </p>
        </div>

        <form action={loginAction}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '8px',
            }}
          >
            ایمیل
          </label>

          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            dir="ltr"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 15px',
              marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: '#101010',
              color: '#ffffff',
              outline: 'none',
              fontSize: '14px',
            }}
          />

          <label
            style={{
              display: 'block',
              fontSize: '13px',
              marginBottom: '8px',
            }}
          >
            رمز عبور
          </label>

          <input
            type="password"
            name="password"
            autoComplete="current-password"
            required
            dir="ltr"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 15px',
              marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: '#101010',
              color: '#ffffff',
              outline: 'none',
              fontSize: '14px',
            }}
          />

          {hasError && (
            <div
              style={{
                marginBottom: '18px',
                padding: '12px 14px',
                border: '1px solid rgba(255,80,80,0.3)',
                background: 'rgba(255,80,80,0.08)',
                color: '#ffb0b0',
                fontSize: '13px',
                lineHeight: 1.7,
              }}
            >
              ایمیل یا رمز عبور اشتباه است.
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              border: 0,
              background: '#ffffff',
              color: '#111111',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ورود به پنل
          </button>
        </form>
      </div>
    </main>
  );
}
