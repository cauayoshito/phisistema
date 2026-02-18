'use client';

import { useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FilterX,
  FolderOpen,
  Plus,
  School,
  Search,
  Sprout,
  Users,
} from 'lucide-react';
import { mockProjects, type OrganizationIcon, type ProjectStatus } from './mockProjects';

const iconByOrganization: Record<
  OrganizationIcon,
  { icon: ComponentType<{ className?: string }>; style: string }
> = {
  school: { icon: School, style: 'bg-indigo-100 text-indigo-600' },
  sprout: { icon: Sprout, style: 'bg-green-100 text-green-600' },
  users: { icon: Users, style: 'bg-blue-100 text-blue-600' },
  building: { icon: Building2, style: 'bg-orange-100 text-orange-600' },
  folder: { icon: FolderOpen, style: 'bg-rose-100 text-rose-600' },
};

function statusClasses(status: ProjectStatus) {
  if (status === 'Ativo') {
    return 'bg-emerald-100 text-emerald-700';
  }
  if (status === 'Em Análise') {
    return 'bg-amber-100 text-amber-700';
  }
  return 'bg-slate-100 text-slate-700';
}

export default function ProjetosPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  const organizations = useMemo(() => {
    return Array.from(new Set(mockProjects.map((project) => project.organizacao))).sort();
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return mockProjects.filter((project) => {
      const matchesSearch =
        query.length === 0 ||
        project.nome.toLowerCase().includes(query) ||
        project.codigo.toLowerCase().includes(query) ||
        project.organizacao.toLowerCase().includes(query);
      const matchesOrganization =
        organizationFilter.length === 0 || project.organizacao === organizationFilter;
      const matchesStatus = statusFilter.length === 0 || project.status === statusFilter;

      return matchesSearch && matchesOrganization && matchesStatus;
    });
  }, [organizationFilter, search, statusFilter]);

  const resetFilters = () => {
    setSearch('');
    setOrganizationFilter('');
    setStatusFilter('');
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lista de Projetos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie e acompanhe o status de todos os projetos sociais.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/projetos/novo')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-600"
        >
          <Plus className="size-5" />
          Novo Projeto
        </button>
      </div>

      <div className="mb-6 grid gap-4 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-12">
        <div className="relative col-span-2 lg:col-span-5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="size-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, codigo ou organizacao..."
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="col-span-1 lg:col-span-3">
          <select
            value={organizationFilter}
            onChange={(event) => setOrganizationFilter(event.target.value)}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-3 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todas Organizações</option>
            {organizations.map((organization) => (
              <option key={organization} value={organization}>
                {organization}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-1 lg:col-span-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as ProjectStatus | '')}
            className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-3 pr-3 text-sm text-slate-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todos Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Em Análise">Em Análise</option>
            <option value="Concluído">Concluído</option>
          </select>
        </div>

        <div className="col-span-2 flex items-center justify-end lg:col-span-1">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:w-auto"
          >
            <FilterX className="size-5" />
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900" scope="col">
                  Nome do Projeto
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900" scope="col">
                  Organização
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900" scope="col">
                  Início
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900" scope="col">
                  Fim
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900" scope="col">
                  Valor
                </th>
                <th className="px-6 py-4 font-semibold text-slate-900" scope="col">
                  Status
                </th>
                <th className="px-6 py-4 text-right font-semibold text-slate-900" scope="col">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProjects.map((project) => {
                const organizationAsset = iconByOrganization[project.organizacaoIcon];
                const OrganizationIcon = organizationAsset.icon;
                return (
                  <tr key={project.id} className="group hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{project.nome}</span>
                        <span className="text-xs text-slate-500">ID: #{project.codigo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded ${organizationAsset.style}`}
                        >
                          <OrganizationIcon className="size-[14px]" />
                        </div>
                        <span className="text-slate-600">{project.organizacao}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{project.inicio}</td>
                    <td className="px-6 py-4 text-slate-600">{project.fim}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{project.valor}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(project.status)}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => router.push(`/projetos/${project.id}`)}
                        className="inline-flex items-center justify-center rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-blue-50"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
