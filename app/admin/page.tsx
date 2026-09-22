import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminCookieName, verifyAdminToken } from '@/lib/admin-auth';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const store = await cookies();
  const token = store.get(getAdminCookieName())?.value;

  if (!token || !(await verifyAdminToken(token))) {
    redirect('/admin/login');
  }

  return <AdminClient />;
}
