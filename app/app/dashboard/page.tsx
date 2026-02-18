import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * Dashboard page. This page runs on the server and fetches the
 * authenticated user's session. Additional data such as the user's
 * projects could be loaded here in the future.
 */
export default async function DashboardPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Bem-vindo{user?.email ? `, ${user.email}` : ''}!</p>
      <p className="mt-2 text-sm text-gray-600">
        Esta é a área inicial da aplicação. Os próximos módulos vão
        listar informações específicas de acordo com o seu papel no
        sistema.
      </p>
    </div>
  );
}
