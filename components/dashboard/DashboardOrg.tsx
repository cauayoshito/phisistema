import Link from "next/link";
import StatCard from "@/components/dashboard/StatCard";
import {
  formatarData,
  formatarDataHora,
  reportStatusLabel,
  projectStatusLabel,
  projectTypeLabel,
  pct,
} from "@/lib/dashboard-helpers";

type Props = {
  nome: string;
  projetos: any[];
  relatorios: any[];
};

export default function DashboardOrg({
  nome,
  projetos,
  relatorios,
}: Props) {
  // ── KPIs ──
  const totalProjetos = projetos.length;
  const projetosAtivos = projetos.filter((p) => {
    const s = String(p.status ?? "").toUpperCase();
    return s !== "DRAFT";
  }).length;

  const totalRelatorios = relatorios.length;
  const relatoriosDevolvidos = relatorios.filter(
    (r) => String(r.status ?? "").toUpperCase() === "RETURNED"
  ).length;
  const relatoriosRascunho = relatorios.filter(
    (r) => String(r.status ?? "").toUpperCase() === "DRAFT"
  ).length;
  const relatoriosAprovados = relatorios.filter(
    (r) => String(r.status ?? "").toUpperCase() === "APPROVED"
  ).length;

  // ── Itens que precisam de atenção (devolvidos + rascunhos) ──
  const precisamAtencao = relatorios
    .filter((r) => {
      const s = String(r.status ?? "").toUpperCase();
      return s === "RETURNED" || s === "DRAFT";
    })
    .slice(0, 5);

  const projetosTop = projetos.slice(0, 6);

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      {/* ── Header ── */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            Bem-vindo(a), {nome}!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Painel da organização — gerencie seus projetos e relatórios.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/dashboard/reports"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 sm:w-auto"
          >
            📄 Meus relatórios
          </Link>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
          >
            ➕ Novo projeto
          </Link>
        </div>
      </section>

      {/* ── KPIs ── */}
      <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Projetos ativos"
          value={projetosAtivos}
          icon={<span>🗂️</span>}
          tone="blue"
          tag={`${totalProjetos} total`}
        />
        <StatCard
          title="Relatórios enviados"
          value={totalRelatorios - relatoriosRascunho}
          icon={<span>📤</span>}
          tone="green"
          tag={`${relatoriosAprovados} aprovados`}
        />
        <StatCard
          title="Devolvidos p/ ajuste"
          value={relatoriosDevolvidos}
          icon={<span>🔄</span>}
          tone="orange"
          tag="requer ação"
        />
        <StatCard
          title="Rascunhos pendentes"
          value={relatoriosRascunho}
          icon={<span>📝</span>}
          tone="red"
          tag="a enviar"
        />
      </section>

      {/* ── Alerta de devolvidos ── */}
      {relatoriosDevolvidos > 0 && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                Você tem {relatoriosDevolvidos} relatório{relatoriosDevolvidos > 1 ? "s" : ""} devolvido{relatoriosDevolvidos > 1 ? "s" : ""}
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                O financiador solicitou ajustes. Revise e reenvie para continuar a prestação de contas.
              </p>
              <Link
                href="/dashboard/reports"
                className="mt-2 inline-flex text-sm font-medium text-amber-800 underline hover:no-underline"
              >
                Ver relatórios devolvidos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Relatórios que precisam de atenção ── */}
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-col gap-2 border-b bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Relatórios que precisam da sua atenção
          </h3>
          <Link
            href="/dashboard/reports"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {precisamAtencao.length === 0 ? (
          <div className="p-5 text-sm text-slate-500">
            Tudo em dia! Nenhum relatório pendente.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {precisamAtencao.map((r: any) => {
              const s = String(r.status ?? "").toUpperCase();
              const isReturned = s === "RETURNED";
              return (
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
                  <span
                    className={[
                      "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
                      isReturned
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-slate-50 text-slate-600",
                    ].join(" ")}
                  >
                    {isReturned ? "Devolvido" : "Rascunho"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ── Projetos recentes ── */}
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-col gap-2 border-b bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Meus projetos
          </h3>
          <Link
            href="/dashboard/projects"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 sm:px-6">Projeto</th>
                <th className="px-4 py-3 sm:px-6">Tipo</th>
                <th className="px-4 py-3 sm:px-6">Status</th>
                <th className="px-4 py-3 sm:px-6">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {projetosTop.map((p: any) => {
                const label = p.title ?? p.name ?? p.project_name ?? "Projeto sem título";
                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">
                      <Link
                        href={`/dashboard/projects/${p.id}?tab=overview`}
                        className="hover:underline"
                      >
                        {label}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-slate-600 sm:px-6">
                      {projectTypeLabel(p.project_type)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 sm:px-6">
                      {projectStatusLabel(p.status)}
                    </td>
                    <td className="px-4 py-4 text-slate-600 sm:px-6">
                      {formatarData(p.created_at)}
                    </td>
                  </tr>
                );
              })}
              {projetosTop.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-slate-500 sm:px-6">
                    Nenhum projeto criado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-slate-200 md:hidden">
          {projetosTop.map((p: any) => {
            const label = p.title ?? p.name ?? p.project_name ?? "Projeto sem título";
            return (
              <div key={p.id} className="space-y-2 p-4">
                <Link
                  href={`/dashboard/projects/${p.id}?tab=overview`}
                  className="block text-sm font-semibold text-slate-900 hover:underline"
                >
                  {label}
                </Link>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>{projectTypeLabel(p.project_type)}</span>
                  <span>·</span>
                  <span>{projectStatusLabel(p.status)}</span>
                  <span>·</span>
                  <span>{formatarData(p.created_at)}</span>
                </div>
              </div>
            );
          })}
          {projetosTop.length === 0 && (
            <div className="p-4 text-sm text-slate-500">
              Nenhum projeto criado ainda.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
