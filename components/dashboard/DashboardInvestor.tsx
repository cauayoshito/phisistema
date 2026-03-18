import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import {
  nomeDoEmail,
  formatarData,
  reportStatusLabel,
  projectStatusLabel,
  pct,
} from "@/lib/dashboard-helpers";

type Props = {
  nome: string;
  projetos: any[];
  relatorios: any[];
};

export default function DashboardInvestor({
  nome,
  projetos,
  relatorios,
}: Props) {
  // ── KPIs de relatórios ──
  const totalRelatorios = relatorios.length;
  const relatoriosAprovados = relatorios.filter(
    (r) => String(r.status ?? "").toUpperCase() === "APPROVED"
  ).length;
  const relatoriosPendentes = relatorios.filter((r) => {
    const s = String(r.status ?? "").toUpperCase();
    return s === "SUBMITTED" || s === "RETURNED";
  }).length;
  const relatoriosRascunho = relatorios.filter(
    (r) => String(r.status ?? "").toUpperCase() === "DRAFT"
  ).length;

  // ── KPIs de projetos ──
  const totalProjetos = projetos.length;
  const projetosAprovados = projetos.filter(
    (p) => String(p.status ?? "").toUpperCase() === "APROVADO"
  ).length;

  // ── Relatórios pendentes de ação (SUBMITTED = aguardando análise) ──
  const filaAnalise = relatorios
    .filter((r) => String(r.status ?? "").toUpperCase() === "SUBMITTED")
    .slice(0, 5);

  // ── Projetos recentes ──
  const projetosTop = projetos.slice(0, 5);

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      {/* ── Header ── */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            Olá, {nome}!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Painel do financiador — acompanhe seus projetos e relatórios.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/dashboard/reports"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto"
          >
            📄 Avaliar relatórios
          </Link>
        </div>
      </section>

      {/* ── KPIs ── */}
      <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Relatórios recebidos"
          value={totalRelatorios}
          icon={<span>📥</span>}
          tone="blue"
          tag="total"
        />
        <StatCard
          title="Aprovados"
          value={relatoriosAprovados}
          icon={<span>✅</span>}
          tone="green"
          tag={`${pct(relatoriosAprovados, totalRelatorios)}%`}
        />
        <StatCard
          title="Pendentes de análise"
          value={relatoriosPendentes}
          icon={<span>⏳</span>}
          tone="orange"
          tag="aguardando"
        />
        <StatCard
          title="Projetos ativos"
          value={totalProjetos}
          icon={<span>🗂️</span>}
          tone="blue"
          tag={`${projetosAprovados} aprovados`}
        />
      </section>

      {/* ── Barra de progresso de relatórios ── */}
      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">
          Progresso de relatórios
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Distribuição por status dos relatórios recebidos.
        </p>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100">
          {totalRelatorios > 0 && (
            <>
              <div
                className="bg-emerald-500 transition-all"
                style={{ width: `${pct(relatoriosAprovados, totalRelatorios)}%` }}
                title={`Aprovados: ${relatoriosAprovados}`}
              />
              <div
                className="bg-amber-400 transition-all"
                style={{ width: `${pct(relatoriosPendentes, totalRelatorios)}%` }}
                title={`Pendentes: ${relatoriosPendentes}`}
              />
              <div
                className="bg-slate-300 transition-all"
                style={{ width: `${pct(relatoriosRascunho, totalRelatorios)}%` }}
                title={`Rascunho: ${relatoriosRascunho}`}
              />
            </>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Aprovados ({relatoriosAprovados})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            Pendentes ({relatoriosPendentes})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-300" />
            Rascunho ({relatoriosRascunho})
          </span>
        </div>
      </section>

      {/* ── Fila de relatórios aguardando análise ── */}
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-col gap-2 border-b bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Relatórios aguardando sua análise
          </h3>
          <Link
            href="/dashboard/reports"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {filaAnalise.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            Nenhum relatório aguardando análise no momento.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {filaAnalise.map((r: any) => (
              <li key={r.id} className="flex items-center justify-between gap-4 p-4 sm:px-6">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/reports/${r.id}`}
                    className="block truncate text-sm font-semibold text-blue-600 hover:underline"
                  >
                    {r.title || "Sem título"}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {r.project_label || "Projeto vinculado"} · {formatarData(r.created_at)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  Aguardando
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Projetos recentes ── */}
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-col gap-2 border-b bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Projetos recentes
          </h3>
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {projetosTop.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            Nenhum projeto vinculado ainda.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {projetosTop.map((p: any) => {
              const label = p.title ?? p.name ?? p.project_name ?? "Projeto sem título";
              return (
                <li key={p.id} className="flex items-center justify-between gap-4 p-4 sm:px-6">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/projects/${p.id}?tab=overview`}
                      className="block truncate text-sm font-semibold text-slate-900 hover:underline"
                    >
                      {label}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatarData(p.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                    {projectStatusLabel(p.status)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
