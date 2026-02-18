import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

/**
 * Organizações page. Displays a list of organizations for the current
 * user. Organization users see only their organization; investors and
 * consultants may see all organizations.
 */
export default async function OrganizationsPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  // Attempt to load the current user's profile to determine their role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch organizations. RLS policies in Supabase ensure that only
  // permitted rows are returned based on the authenticated user's role.
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('*');
  const organizationRows = (organizations ?? []) as Array<{
    id: string;
    name: string | null;
    email: string | null;
  }>;

  if (error) {
    // If there is an error (e.g., due to missing RLS policy) display a message
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Organizações</h1>
        <p className="text-red-600">Erro ao carregar as organizações: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Organizações</h1>
      {organizationRows.length > 0 ? (
        <ul className="space-y-2">
          {organizationRows.map((org) => (
            <li key={org.id} className="p-4 border rounded">
              <h2 className="font-semibold">{org.name}</h2>
              <p className="text-sm text-gray-600">{org.email}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">Nenhuma organização encontrada.</p>
      )}
    </div>
  );
}
