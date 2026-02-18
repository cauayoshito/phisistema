import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export const dynamic = 'force-dynamic';

/**
 * Projects page. Lists projects visible to the current user. The
 * underlying RLS policies in Supabase determine which projects are
 * returned based on the user's role and organization.
 */
export default async function ProjectsPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, status, created_at')
    .order('created_at', { ascending: false });
  const projectRows = (projects ?? []) as Array<{
    id: string;
    name: string | null;
    status: string | null;
    created_at: string | null;
  }>;

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">Projetos</h1>
        <p className="text-red-600">Erro ao carregar os projetos: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Projetos</h1>
      {projectRows.length > 0 ? (
        <ul className="space-y-2">
          {projectRows.map((project) => (
            <li key={project.id} className="p-4 border rounded">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{project.name}</span>
                <span className="text-sm text-gray-600">{project.status}</span>
              </div>
              <p className="text-xs text-gray-500">
                Criado em{' '}
                {new Date(project.created_at ?? Date.now()).toLocaleDateString('pt-BR')}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">Nenhum projeto encontrado.</p>
      )}
    </div>
  );
}
