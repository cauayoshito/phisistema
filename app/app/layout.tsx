import { ReactNode } from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * Layout for the authenticated area of the application. It fetches
 * the current session on the server side and renders a simple
 * navigation bar. Pages within this layout inherit the session
 * context provided via cookies.
 */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Optionally the user's profile could be fetched here to show the
  // organisation name or role in the navigation bar. For now we
  // just greet the user by email if available.
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <nav className="px-4 py-3 bg-gray-800 text-white flex gap-6 items-center">
        <span className="font-semibold text-lg mr-auto">PHI</span>
        <Link href="/app/dashboard" className="hover:underline">
          Dashboard
        </Link>
        <Link href="/app/organizations" className="hover:underline">
          Organizações
        </Link>
        <Link href="/app/projects" className="hover:underline">
          Projetos
        </Link>
        <Link href="/app/reports" className="hover:underline">
          Relatórios
        </Link>
        {user && <span className="ml-4 text-sm">{user.email}</span>}
      </nav>
      <main className="p-4">{children}</main>
    </div>
  );
}
