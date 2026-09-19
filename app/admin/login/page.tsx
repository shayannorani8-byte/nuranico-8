'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError('ایمیل یا رمز عبور صحیح نیست.');
      setLoading(false);
      return;
    }

    router.replace('/admin');
    router.refresh();
  }

  async function handleResetPassword() {
    setError('');
    setMessage('');

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError('ابتدا ایمیل حساب مدیر را وارد کنید.');
      return;
    }

    setResetLoading(true);

    const { error } =
      await supabaseBrowser.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

    if (error) {
      setError(error.message);
      setResetLoading(false);
      return;
    }

    setMessage('لینک تغییر رمز ارسال شد. ایمیل خود را بررسی کنید.');
    setResetLoading(false);
  }

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

        <form onSubmit={handleLogin}>
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
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            dir="ltr"
            placeholder="admin@example.com"
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
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            dir="ltr"
            placeholder="••••••••"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '14px 15px',
              marginBottom: '10px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: '#101010',
              color: '#ffffff',
              outline: 'none',
              fontSize: '14px',
            }}
          />

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resetLoading}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 0',
              marginBottom: '20px',
              border: 0,
              background: 'transparent',
              color: 'rgba(255,255,255,0.55)',
              cursor: resetLoading ? 'wait' : 'pointer',
              fontSize: '13px',
              textAlign: 'right',
            }}
          >
            {resetLoading
              ? 'در حال ارسال لینک...'
              : 'رمز عبور را فراموش کرده‌اید؟'}
          </button>

          {error && (
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
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                marginBottom: '18px',
                padding: '12px 14px',
                border: '1px solid rgba(80,255,130,0.25)',
                background: 'rgba(80,255,130,0.07)',
                color: '#a8e6b7',
                fontSize: '13px',
                lineHeight: 1.7,
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              border: 0,
              background: '#ffffff',
              color: '#111111',
              cursor: loading ? 'wait' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.65 : 1,
            }}
          >
            {loading ? 'در حال ورود...' : 'ورود به پنل'}
          </button>
        </form>
      </div>
    </main>
  );
}
EOF