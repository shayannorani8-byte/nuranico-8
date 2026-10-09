'use client';

import { useFormStatus } from 'react-dom';

export default function LoginSubmit() {
  const { pending } = useFormStatus();
  return <button className="login-submit" type="submit" disabled={pending} aria-busy={pending}>
    {pending ? 'در حال ورود…' : 'ورود به پنل'}
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="m14 6-6 6 6 6M8 12h12"/></svg>
  </button>;
}
