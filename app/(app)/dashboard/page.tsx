import {
  Download,
  Droplets,
  FolderKanban,
  HandHeart,
  Laptop,
  Leaf,
  MoreVertical,
  Plus,
  School,
  Users,
  Wallet,
} from 'lucide-react';
import type { ComponentType } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

type Metric = {
  label: string;
  value: string;
  trend: string;
  icon: ComponentType<{ className?: string }>;
  iconWrapper: string;
};

type Project = {
  id: string;
  name: string;
  organization: string;
  status: 'Em Andamento' | 'Pendente' | 'Concluido';
  progress: number;
  update: string;
  icon: ComponentType<{ className?: string }>;
  iconWrapper: string;
  progressColor: string;
};

const mockDashboard = {
  metrics: [
    {
      label: 'Projetos Ativos',
      value: '24',
      trend: '+12%',
      icon: FolderKanban,
      iconWrapper: 'bg-blue-50 text-primary',
    },
    {
      label: 'Total Investido',
      value: 'R$ 12.5M',
      trend: '+5.4%',
      icon: Wallet,
      iconWrapper: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Organizacoes',
      value: '18',
      trend: '+2',
      icon: Users,
      iconWrapper: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Impacto Social',
      value: '98.5',
      trend: '+1.2%',
      icon: HandHeart,
      iconWrapper: 'bg-rose-50 text-rose-600',
    },
  ] as Metric[],
  recentProjects: [
    {
      id: '1',
      name: 'Inclusao Digital',
      organization: 'Inst. Tech',
      status: 'Em Andamento',
      progress: 75,
      update: 'Hoje, 14:30',
      icon: Laptop,
      iconWrapper: 'bg-blue-100 text-primary',
      progressColor: 'bg-primary',
    },
    {
      id: '2',
      name: 'Agua Limpa',
      organization: 'ONG Vida',
      status: 'Pendente',
      progress: 5,
      update: 'Ontem, 09:15',
      icon: Droplets,
      iconWrapper: 'bg-cyan-100 text-cyan-700',
      progressColor: 'bg-amber-500',
    },
    {
      id: '3',
      name: 'Educacao Jovens',
      organization: 'Fundacao Futuro',
      status: 'Concluido',
      progress: 100,
      update: '22 Out, 2023',
      icon: School,
      iconWrapper: 'bg-purple-100 text-purple-700',
      progressColor: 'bg-emerald-500',
    },
    {
      id: '4',
      name: 'Horta Comunitaria',
      organization: 'Assoc. Verde',
      status: 'Em Andamento',
      progress: 45,
      update: '20 Out, 2023',
      icon: Leaf,
      iconWrapper: 'bg-green-100 text-green-700',
      progressColor: 'bg-primary',
    },
  ] as Project[],
};

function getStatusVariant(status: Project['status']) {
  if (status === 'Concluido') return 'emerald';
  if (status === 'Pendente') return 'amber';
  return 'blue';
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Painel de Controle</h2>
          <p className="mt-1 text-sm text-slate-500">
            Visao geral dos indicadores de impacto e projetos.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={<Download className="size-5" />}>
            Exportar
          </Button>
          <Button icon={<Plus className="size-5" />}>Novo Projeto</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockDashboard.metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-lg p-2 ${metric.iconWrapper}`}>
                  <Icon className="size-5" />
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                  {metric.trend}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500">{metric.label}</p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">{metric.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Evolucao de Investimentos</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-bold text-slate-900">R$ 2.4M</span>
                <span className="text-sm text-slate-500">Este Ano</span>
                <span className="rounded bg-emerald-50 px-1.5 text-sm font-medium text-emerald-600">
                  +8.2%
                </span>
              </div>
            </div>
            <button className="text-slate-400 transition-colors hover:text-primary" type="button">
              <MoreVertical className="size-5" />
            </button>
          </div>
          <div className="relative h-64 w-full">
            <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 300">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#1c67f2" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1c67f2" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" x2="800" y1="299" y2="299" stroke="#e2e8f0" strokeWidth="1" />
              <line
                x1="0"
                x2="800"
                y1="225"
                y2="225"
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1="0"
                x2="800"
                y1="150"
                y2="150"
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line
                x1="0"
                x2="800"
                y1="75"
                y2="75"
                stroke="#f1f5f9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <path
                d="M0,250 C100,250 150,150 200,180 C250,210 300,100 400,120 C500,140 550,60 650,80 C750,100 800,40 800,40 L800,300 L0,300 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,250 C100,250 150,150 200,180 C250,210 300,100 400,120 C500,140 550,60 650,80 C750,100 800,40 800,40"
                fill="none"
                stroke="#1c67f2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
            </svg>
          </div>
          <div className="mt-4 flex justify-between px-2 text-xs font-medium text-slate-400">
            <span>Jan</span>
            <span>Fev</span>
            <span>Mar</span>
            <span>Abr</span>
            <span>Mai</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Ago</span>
            <span>Set</span>
            <span>Out</span>
            <span>Nov</span>
            <span>Dez</span>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Projetos por Categoria</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">15</span>
              <span className="text-sm text-slate-500">Ativos</span>
              <span className="rounded bg-emerald-50 px-1.5 text-sm font-medium text-emerald-600">+3</span>
            </div>
          </div>
          <div className="flex h-64 flex-1 items-end justify-between gap-4 px-2 pb-2">
            {[
              { label: 'Edu', h: 'h-32', fill: 'h-[65%]' },
              { label: 'Saude', h: 'h-48', fill: 'h-[85%]' },
              { label: 'Amb', h: 'h-20', fill: 'h-[45%]' },
              { label: 'Tech', h: 'h-36', fill: 'h-[70%]' },
            ].map((bar) => (
              <div key={bar.label} className="group flex w-full cursor-pointer flex-col items-center gap-2">
                <div className={`relative w-full rounded-t-md bg-blue-100 transition-colors group-hover:bg-primary/30 ${bar.h}`}>
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-md bg-primary transition-colors group-hover:bg-primary/80 ${bar.fill}`}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Projetos Recentes</h3>
          <a className="text-sm font-medium text-primary hover:text-blue-700" href="#">
            Ver todos
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Projeto</th>
                <th className="px-6 py-4">Organizacao</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="w-1/4 px-6 py-4">Progresso</th>
                <th className="px-6 py-4 text-right">Atualizacao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockDashboard.recentProjects.map((project) => {
                const Icon = project.icon;
                return (
                  <tr key={project.id} className="group transition-colors hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-8 items-center justify-center rounded ${project.iconWrapper}`}>
                          <Icon className="size-[18px]" />
                        </div>
                        <span className="text-sm font-medium text-slate-900">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{project.organization}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-full rounded-full bg-slate-100">
                          <div
                            className={`h-1.5 rounded-full ${project.progressColor}`}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-medium text-slate-600">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-slate-500">{project.update}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mb-6 mt-12 text-center text-sm text-slate-400">
        <p>Â© 2024 PHI System. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
