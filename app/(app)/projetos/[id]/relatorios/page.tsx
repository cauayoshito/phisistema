'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { CalendarDays, ChevronRight, FileText } from 'lucide-react';
import { mockProjects } from '../../mockProjects';
import { mockReportPeriods } from './mockReportData';

function formatPeriodLabel(period: string) {
  const [quarter, year] = period.split('-');
  return `${quarter?.toUpperCase()} ${year}`;
}

function formatDateRange(period: string) {
  const [quarter, year] = period.split('-');
  if (!quarter || !year) return 'Período não definido';

  if (quarter === 'q1') return `01 Jan ${year} - 31 Mar ${year}`;
  if (quarter === 'q2') return `01 Abr ${year} - 30 Jun ${year}`;
  if (quarter === 'q3') return `01 Jul ${year} - 30 Set ${year}`;
  if (quarter === 'q4') return `01 Out ${year} - 31 Dez ${year}`;
  return `Período ${period}`;
}

export default function RelatoriosListPage() {
  const params = useParams<{ id: string }>();
  const projectId = useMemo(() => {
    const currentId = params?.id;
    return Array.isArray(currentId) ? currentId[0] : currentId;
  }, [params]);

  const project = useMemo(
    () => mockProjects.find((item) => item.id === projectId),
    [projectId]
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="transition-colors hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <Link href="/projetos" className="transition-colors hover:text-primary">
            Projetos
          </Link>
          <ChevronRight className="size-4" />
          <span className="text-slate-700">{project?.nome ?? projectId}</span>
          <ChevronRight className="size-4" />
          <span className="font-medium text-slate-900">Relatórios</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios por Período</h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecione um período para preencher ou revisar o relatório do projeto.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <ul className="divide-y divide-slate-200">
          {mockReportPeriods.map((period) => (
            <li key={period} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{formatPeriodLabel(period)}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="size-4" />
                    {formatDateRange(period)}
                  </p>
                </div>
              </div>
              <Link
                href={`/projetos/${projectId}/relatorios/${period}`}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
              >
                Abrir Relatório
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
