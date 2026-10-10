import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LoginSubmit from './LoginSubmit';
import './login.css';
import '../form-controls.css';
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
    <main className="admin-login" lang="fa" dir="rtl">
      <div className="login-shell">
        <Link href="/" className="login-brand" aria-label="NURANICO — بازگشت به سایت">
          <span className="login-monogram" aria-hidden="true">N<span>®</span></span>
          <span lang="en" dir="ltr">NURANICO<small>STUDIO WORKSPACE</small></span>
        </Link>
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v3"/></svg>
          </div>
          <h1 id="login-title">ورود به پنل مدیریت</h1>
          <p className="login-intro">پروژه‌ها، رسانه‌ها و محتوای سایت را مدیریت کنید.</p>
          <form action={loginAction}>
            <label htmlFor="admin-email">ایمیل مدیر</label>
            <input id="admin-email" lang="en" type="email" name="email" autoComplete="username" required dir="ltr" placeholder="you@example.com" aria-invalid={hasError || undefined} aria-describedby={hasError ? 'login-error' : undefined} />
            <label htmlFor="admin-password">رمز عبور</label>
            <input id="admin-password" lang="en" type="password" name="password" autoComplete="current-password" required dir="ltr" aria-invalid={hasError || undefined} aria-describedby={hasError ? 'login-error' : undefined} />
            {hasError && <div className="login-error" id="login-error" role="alert">ایمیل یا رمز عبور اشتباه است. دوباره تلاش کنید.</div>}
            <LoginSubmit />
          </form>
        </section>
        <Link href="/" className="login-back">بازگشت به سایت</Link>
      </div>
    </main>
  );
}
