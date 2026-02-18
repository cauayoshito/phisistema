'use client';

import type { ComponentType } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, CheckCircle2, Coins, Droplets, Laptop, Leaf, School, Search, TriangleAlert } from 'lucide-react';

type InvestorReportStatus =
  | 'Pendente'
  | 'Em Análise'
  | 'Aguardando Revisão'
  | 'Ajustes Solicitados';

type InvestorTab = 'Todos' | 'Pendentes' | 'Em Análise';

type InvestorReport = {
  id: string;
  projectId: string;
  projetoNome: string;
  organizacao: string;
  periodoLabel: string;
  periodoSlug: string;
  valor: number;
  status: InvestorReportStatus;
  categoriaIcon: 'school' | 'eco' | 'computer' | 'water_drop';
  execucaoPercent: number;
  beneficiarios: number;
};

const pageSize = 4;

const mockInvestorReports: InvestorReport[] = [
  {
    id: 'rel-001',
    projectId: 'proj-2023-001',
    projetoNome: 'Educação Digital 2024',
    organizacao: 'Associação Aprender Sempre',
    periodoLabel: 'Q1 2024 (Jan-Mar)',
    periodoSlug: '2024-q1',
    valor: 150000,
    status: 'Aguardando Revisão',
    categoriaIcon: 'school',
    execucaoPercent: 92,
    beneficiarios: 1240,
  },
  {
    id: 'rel-002',
    projectId: 'proj-2023-014',
    projetoNome: 'Saneamento Básico - Fase 1',
    organizacao: 'Instituto Água Limpa',
    periodoLabel: 'Q4 2023 (Out-Dez)',
    periodoSlug: '2023-q4',
    valor: 420000,
    status: 'Ajustes Solicitados',
    categoriaIcon: 'water_drop',
    execucaoPercent: 76,
    beneficiarios: 3180,
  },
  {
    id: 'rel-003',
    projectId: 'proj-2024-008',
    projetoNome: 'Horta Comunitária Zona Norte',
    organizacao: 'ONG Verde Vida',
    periodoLabel: 'Q1 2024 (Jan-Mar)',
    periodoSlug: '2024-q1',
    valor: 85000,
    status: 'Pendente',
    categoriaIcon: 'eco',
    execucaoPercent: 88,
    beneficiarios: 970,
  },
  {
    id: 'rel-004',
    projectId: 'proj-2024-012',
    projetoNome: 'Capacitação Jovens Tech',
    organizacao: 'Instituto Futuro Digital',
    periodoLabel: 'Q1 2024 (Jan-Mar)',
    periodoSlug: '2024-q1',
    valor: 200000,
    status: 'Em Análise',
    categoriaIcon: 'computer',
    execucaoPercent: 81,
    beneficiarios: 660,
  },
  {
    id: 'rel-005',
    projectId: 'proj-2023-027',
    projetoNome: 'Laboratório de Robótica Escolar',
    organizacao: 'Fundação Nova Escola',
    periodoLabel: 'Q4 2023 (Out-Dez)',
    periodoSlug: '2023-q4',
    valor: 310000,
    status: 'Em Análise',
    categoriaIcon: 'computer',
    execucaoPercent: 74,
    beneficiarios: 540,
  },
  {
    id: 'rel-006',
    projectId: 'proj-2024-019',
    projetoNome: 'Reflorestamento Urbano',
    organizacao: 'Instituto Raízes Vivas',
    periodoLabel: 'Q1 2024 (Jan-Mar)',
    periodoSlug: '2024-q1',
    valor: 125000,
    status: 'Pendente',
    categoriaIcon: 'eco',
    execucaoPercent: 69,
    beneficiarios: 1820,
  },
  {
    id: 'rel-007',
    projectId: 'proj-2024-021',
    projetoNome: 'Rede de Água Comunitária',
    organizacao: 'Movimento Água para Todos',
    periodoLabel: 'Q1 2024 (Jan-Mar)',
    periodoSlug: '2024-q1',
    valor: 280000,
    status: 'Aguardando Revisão',
    categoriaIcon: 'water_drop',
    execucaoPercent: 94,
    beneficiarios: 4150,
  },
  {
    id: 'rel-008',
    projectId: 'proj-2024-030',
    projetoNome: 'Formação Docente em STEM',
    organizacao: 'Instituto Saber para o Futuro',
    periodoLabel: 'Q1 2024 (Jan-Mar)',
    periodoSlug: '2024-q1',
    valor: 165000,
    status: 'Pendente',
    categoriaIcon: 'school',
    execucaoPercent: 83,
    beneficiarios: 1120,
  },
];

const tabLabels: InvestorTab[] = ['Todos', 'Pendentes', 'Em Análise'];

const categoryIconByName: Record<
  InvestorReport['categoriaIcon'],
  { icon: ComponentType<{ className?: string }>; containerClass: string }
> = {
  school: { icon: School, containerClass: 'bg-blue-100 text-blue-700' },
  eco: { icon: Leaf, containerClass: 'bg-emerald-100 text-emerald-700' },
  computer: { icon: Laptop, containerClass: 'bg-indigo-100 text-indigo-700' },
  water_drop: { icon: Droplets, containerClass: 'bg-cyan-100 text-cyan-700' },
};

function isPendingStatus(status: InvestorReportStatus) {
  return status === 'Pendente' || status === 'Aguardando Revisão' || status === 'Ajustes Solicitados';
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function statusBadgeClass(status: InvestorReportStatus) {
  if (status === 'Em Análise') {
    return 'bg-blue-50 text-blue-700 ring-blue-600/20';
  }
  if (status === 'Aguardando Revisão') {
    return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  }
  if (status === 'Ajustes Solicitados') {
    return 'bg-orange-50 text-orange-700 ring-orange-600/20';
  }
  return 'bg-slate-100 text-slate-700 ring-slate-300/50';
}

function statusAccentClass(status: InvestorReportStatus) {
  if (status === 'Aguardando Revisão') {
    return 'bg-amber-400';
  }
  if (status === 'Ajustes Solicitados') {
    return 'bg-orange-400';
  }
  if (status === 'Em Análise') {
    return 'bg-blue-400';
  }
  return 'bg-slate-400';
}

export default function InvestidorPage() {
  const router = useRouter();
  const [reports, setReports] = useState<InvestorReport[]>(mockInvestorReports);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<InvestorTab>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(mockInvestorReports[0]?.id ?? null);
  const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
  const [commentError, setCommentError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const searchedReports = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (query.length === 0) {
      return reports;
    }

    return reports.filter(
      (report) =>
        report.projetoNome.toLowerCase().includes(query) ||
        report.organizacao.toLowerCase().includes(query),
    );
  }, [reports, searchTerm]);

  const tabCounts = useMemo(
    () => ({
      Todos: searchedReports.length,
      Pendentes: searchedReports.filter((report) => isPendingStatus(report.status)).length,
      'Em Análise': searchedReports.filter((report) => report.status === 'Em Análise').length,
    }),
    [searchedReports],
  );

  const filteredReports = useMemo(() => {
    if (activeTab === 'Todos') {
      return searchedReports;
    }
    if (activeTab === 'Pendentes') {
      return searchedReports.filter((report) => isPendingStatus(report.status));
    }
    return searchedReports.filter((report) => report.status === 'Em Análise');
  }, [activeTab, searchedReports]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / pageSize));

  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReports.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredReports]);

  const selectedReport =
    (selectedReportId ? filteredReports.find((report) => report.id === selectedReportId) : null) ?? null;

  const pendingPoolCount = reports.filter((report) => isPendingStatus(report.status)).length;
  const commentValue = selectedReportId ? reviewComments[selectedReportId] ?? '' : '';

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (filteredReports.length === 0) {
      setSelectedReportId(null);
      setCommentError(null);
      return;
    }

    const selectedStillExists =
      selectedReportId !== null && filteredReports.some((report) => report.id === selectedReportId);
    if (!selectedStillExists) {
      setSelectedReportId(filteredReports[0].id);
      setCommentError(null);
    }
  }, [filteredReports, selectedReportId]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [feedback]);

  const startIndex = filteredReports.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredReports.length);

  const handleApproveSelected = () => {
    if (!selectedReport) {
      return;
    }

    // Aprovado sai desta lista para manter a tela focada apenas em relatórios pendentes.
    setReports((current) => current.filter((report) => report.id !== selectedReport.id));
    setFeedback({ type: 'success', message: 'Relatório aprovado e removido da fila pendente.' });
    setCommentError(null);
  };

  const handleRequestAdjustments = () => {
    if (!selectedReport) {
      return;
    }

    const trimmedComment = commentValue.trim();
    if (trimmedComment.length === 0) {
      setCommentError('Informe um comentário para solicitar ajustes.');
      setFeedback({ type: 'error', message: 'Comentário obrigatório para solicitar ajustes.' });
      return;
    }

    setReports((current) =>
      current.map((report) =>
        report.id === selectedReport.id ? { ...report, status: 'Ajustes Solicitados' } : report,
      ),
    );
    setCommentError(null);
    setFeedback({ type: 'success', message: 'Ajustes solicitados com sucesso.' });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {feedback && (
        <div
          role="status"
          className={`fixed right-4 top-20 z-40 rounded-lg border px-4 py-3 text-sm font-medium shadow-md ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios Pendentes</h1>
          <p className="mt-2 text-sm text-slate-500">
            Você tem <span className="font-semibold text-primary">{pendingPoolCount} relatórios</span> aguardando
            análise e aprovação.
          </p>
        </div>

        <div className="relative w-full md:w-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar projeto..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:min-w-[260px]"
          />
        </div>
      </section>

      <section className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
        {tabLabels.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'border-primary bg-blue-50 font-semibold text-primary'
                  : 'border-transparent font-medium text-slate-500 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {tab}
              <span
                className={`inline-flex h-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                  isActive ? 'bg-blue-100 text-primary' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-6 lg:col-span-2">
          {paginatedReports.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-700">Nenhum relatório encontrado para os filtros atuais.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {paginatedReports.map((report) => {
                const asset = categoryIconByName[report.categoriaIcon];
                const Icon = asset.icon;
                const isSelected = selectedReportId === report.id;
                return (
                  <article
                    key={report.id}
                    className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all ${
                      isSelected
                        ? 'border-primary ring-1 ring-primary/40'
                        : 'border-slate-200 hover:border-primary/40 hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setCommentError(null);
                    }}
                  >
                    <div className={`absolute left-0 top-0 h-full w-1 ${statusAccentClass(report.status)}`} />
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className={`flex size-10 items-center justify-center rounded-full ${asset.containerClass}`}>
                          <Icon className="size-5" />
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(report.status)}`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <h2 className="mt-4 text-base font-bold text-slate-900 transition-colors group-hover:text-primary">
                        {report.projetoNome}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">{report.organizacao}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="size-4" />
                          {report.periodoLabel}
                        </div>
                        <div className="flex items-center gap-1">
                          <Coins className="size-4" />
                          {formatCurrency(report.valor)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          router.push(`/projetos/${report.projectId}/relatorios/${report.periodoSlug}`);
                        }}
                        className="flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        Visualizar Relatório
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Mostrando <span className="font-semibold text-slate-900">{startIndex === 0 ? '0' : `${startIndex}-${endIndex}`}</span>{' '}
              de <span className="font-semibold text-slate-900">{filteredReports.length}</span> relatórios
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages || filteredReports.length === 0}
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
              </button>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-xl border border-slate-300 bg-white shadow-lg">
            {selectedReport ? (
              <>
                <div className="border-b border-slate-200 p-5">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                    Revisão Ativa
                  </span>
                  <h3 className="mt-3 text-xl font-bold leading-tight text-slate-900">{selectedReport.projetoNome}</h3>
                  <p className="mt-1 text-sm text-slate-500">Referente ao período: {selectedReport.periodoLabel}</p>
                </div>

                <div className="space-y-6 p-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Execução</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{selectedReport.execucaoPercent}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Beneficiários</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{formatInteger(selectedReport.beneficiarios)}</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="review-comments" className="mb-2 block text-sm font-semibold text-slate-900">
                      Comentários da Revisão <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="review-comments"
                      rows={6}
                      value={commentValue}
                      onChange={(event) => {
                        if (!selectedReportId) {
                          return;
                        }
                        setReviewComments((current) => ({
                          ...current,
                          [selectedReportId]: event.target.value,
                        }));
                        if (commentError) {
                          setCommentError(null);
                        }
                      }}
                      placeholder="Insira suas observações, questionamentos ou justificativas..."
                      className={`w-full resize-none rounded-lg border bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 ${
                        commentError
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                          : 'border-slate-300 focus:border-primary focus:ring-primary'
                      }`}
                    />
                    <p className="mt-1 text-xs text-slate-500">Obrigatório em caso de solicitação de ajustes.</p>
                    {commentError && (
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                        <TriangleAlert className="size-4" />
                        {commentError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleApproveSelected}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-600"
                    >
                      <CheckCircle2 className="size-5" />
                      Aprovar Relatório
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestAdjustments}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50"
                    >
                      <TriangleAlert className="size-5" />
                      Solicitar Ajustes
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-slate-700">Selecione um relatório para iniciar a revisão.</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
