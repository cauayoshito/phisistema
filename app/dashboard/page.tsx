import Link from "next/link";
import { requireUser } from "@/services/auth.service";
import StatCard from "@/components/dashboard/StatCard";
import {
  PROJECT_STATUS_LABEL,
  REPORT_STATUS_LABEL,
  type ProjectStatus,
  type ReportStatus,
} from "@/lib/status";
import { listProjectsForUser } from "@/services/projects.service";
import { listReportsForUser } from "@/services/reports.service";

export const dynamic = "force-dynamic";

function nomeDoEmail(email?: string | null) {
  if (!email) return "usuário";
  const nome = email.split("@")[0] ?? "usuário";
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function formatarDataHora(valor?: string | null) {
  if (!valor) return "-";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function formatarData(valor?: string | null) {
  if (!valor) return "-";

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(data);
}

function projectTypeLabel(v?: string | null) {
  const value = String(v ?? "")
    .trim()
    .toUpperCase();

  if (value === "RECURSOS_PROPRIOS") return "Recursos Próprios";
  if (value === "INCENTIVADO") return "Incentivado";
  if (value === "RECURSOS_PUBLICOS") return "Recursos Públicos";
  return "-";
}

function projectStatusLabel(v?: string | null) {
  const value = String(v ?? "")
    .trim()
    .toUpperCase() as ProjectStatus;
  return PROJECT_STATUS_LABEL[value] ?? String(v ?? "-");
}

function reportStatusLabel(v?: string | null) {
  const value = String(v ?? "")
    .trim()
    .toUpperCase() as ReportStatus;
  return REPORT_STATUS_LABEL[value] ?? String(v ?? "-");
}

export default async function DashboardPage() {
  const user = await requireUser();

  const nome = nomeDoEmail(user.email);

  let projetosRecentes: Array<any> = [];
  let relatoriosRecentes: Array<any> = [];

  try {
    projetosRecentes = await listProjectsForUser(user.id);
  } catch {
    projetosRecentes = [];
  }

  try {
    relatoriosRecentes = await listReportsForUser(user.id);
  } catch {
    relatoriosRecentes = [];
  }

  const totalProjetos = projetosRecentes.length;
  const projetosEmAnalise = projetosRecentes.filter(
    (p) => String(p.status ?? "").toUpperCase() === "EM_ANALISE"
  ).length;

  const totalRelatorios = relatoriosRecentes.length;
  const relatoriosSubmetidos = relatoriosRecentes.filter(
    (r) => String(r.status ?? "").toUpperCase() === "SUBMITTED"
  ).length;

  const projetosTop = projetosRecentes.slice(0, 6);
  const relatoriosTop = relatoriosRecentes.slice(0, 6);

  return (
    <div className="min-w-0 space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Bem-vindo(a), {nome}!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Visão geral do seu sistema hoje.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href="/dashboard/reports"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            ⬇️ Ir para relatórios
          </Link>

          <Link
            href="/dashboard/projects/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            ➕ Novo projeto
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de projetos"
          value={totalProjetos}
          icon={<span>📁</span>}
          tone="blue"
          tag="geral"
        />
        <StatCard
          title="Projetos em análise"
          value={projetosEmAnalise}
          icon={<span>🧠</span>}
          tone="orange"
          tag="Em análise"
        />
        <StatCard
          title="Relatórios"
          value={totalRelatorios}
          icon={<span>📄</span>}
          tone="red"
          tag="geral"
        />
        <StatCard
          title="Relatórios enviados"
          value={relatoriosSubmetidos}
          icon={<span>📤</span>}
          tone="green"
          tag="Enviados"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/dashboard/projects"
          className="rounded-xl border bg-white p-4 transition hover:bg-slate-50"
        >
          <h3 className="font-semibold text-slate-900">Projetos</h3>
          <p className="mt-1 text-sm text-slate-600">
            Cadastro, listagem e gestão por tipo.
          </p>
        </Link>

        <Link
          href="/dashboard/reports"
          className="rounded-xl border bg-white p-4 transition hover:bg-slate-50"
        >
          <h3 className="font-semibold text-slate-900">Relatórios</h3>
          <p className="mt-1 text-sm text-slate-600">
            Criar, enviar e acompanhar versões.
          </p>
        </Link>

        <Link
          href="/dashboard/organizations"
          className="rounded-xl border bg-white p-4 transition hover:bg-slate-50 sm:col-span-2 xl:col-span-1"
        >
          <h3 className="font-semibold text-slate-900">Organizações</h3>
          <p className="mt-1 text-sm text-slate-600">
            Membros, papéis e vínculo por organização.
          </p>
        </Link>
      </section>

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

        {/* Mobile */}
        <div className="divide-y md:hidden">
          {projetosTop.map((p) => {
            const label =
              p.title ?? p.name ?? p.project_name ?? "Projeto sem título";

            return (
              <div key={p.id} className="space-y-3 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/projects/${p.id}?tab=overview`}
                    className="block truncate text-sm font-semibold text-slate-900 hover:underline"
                  >
                    {label}
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                  <div>
                    <span className="font-medium text-slate-800">Tipo: </span>
                    {projectTypeLabel(p.project_type)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">Status: </span>
                    {projectStatusLabel(p.status)}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">
                      Criado em:{" "}
                    </span>
                    {formatarData(p.created_at)}
                  </div>
                </div>
              </div>
            );
          })}

          {projetosTop.length === 0 && (
            <div className="p-4 text-sm text-slate-500">
              Nenhum projeto recente.
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Projeto</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {projetosTop.map((p) => {
                const label =
                  p.title ?? p.name ?? p.project_name ?? "Projeto sem título";

                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link
                        href={`/dashboard/projects/${p.id}?tab=overview`}
                        className="hover:underline"
                      >
                        {label}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {projectTypeLabel(p.project_type)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {projectStatusLabel(p.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatarData(p.created_at)}
                    </td>
                  </tr>
                );
              })}

              {projetosTop.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-slate-500">
                    Nenhum projeto recente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex flex-col gap-2 border-b bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h3 className="text-sm font-semibold text-slate-900">
            Relatórios recentes
          </h3>
          <Link
            href="/dashboard/reports"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        {/* Mobile */}
        <div className="divide-y md:hidden">
          {relatoriosTop.map((r) => (
            <div key={r.id} className="space-y-3 p-4">
              <div className="min-w-0">
                <Link
                  href={`/dashboard/reports/${r.id}`}
                  className="block truncate text-sm font-semibold text-blue-600 hover:underline"
                >
                  {r.title || "Sem título"}
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-800">Status: </span>
                  {reportStatusLabel(r.status)}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Criado em: </span>
                  {formatarDataHora(r.created_at)}
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-slate-800">Projeto: </span>
                  <span className="break-words">
                    {r.project_label || "Projeto vinculado"}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {relatoriosTop.length === 0 && (
            <div className="p-4 text-sm text-slate-500">
              Nenhum relatório recente.
            </div>
          )}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Relatório</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Criado em</th>
                <th className="px-6 py-3">Projeto</th>
              </tr>
            </thead>
            <tbody>
              {relatoriosTop.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <Link
                      href={`/dashboard/reports/${r.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {r.title || "Sem título"}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {reportStatusLabel(r.status)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {formatarDataHora(r.created_at)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {r.project_label || "Projeto vinculado"}
                  </td>
                </tr>
              ))}

              {relatoriosTop.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-slate-500">
                    Nenhum relatório recente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}