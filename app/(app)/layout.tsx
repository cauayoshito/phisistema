import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import AppShell from '@/components/app/AppShell';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const user = session.user;
  const metadata = user.user_metadata;
  const appUser = {
    name: typeof metadata?.full_name === 'string' ? metadata.full_name : 'Usuario',
    role: typeof metadata?.role === 'string' ? metadata.role : 'Consultor',
    org: typeof metadata?.organization_name === 'string' ? metadata.organization_name : 'Organizacao',
  };

  return <AppShell user={appUser}>{children}</AppShell>;
}
