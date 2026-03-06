// app/dashboard/page.tsx
import Link from "next/link";
import { requireUser } from "@/services/auth.service";
import { createClient } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";
import { PROJECT_STATUS_LABEL, REPORT_STATUS_LABEL } from "@/lib/status";

export const dynamic = "force-dynamic";

function nomeDoEmail(email?: string | null) {
  if (!email) return "usuário";
  const nome = email.split("@")[0] ?? "usuário";
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function formatarData(valor?: string | null) {
  if (!valor) return "-";
  return String(valor).replace("T", " ").replace("Z", "");
}

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = createClient();

  const nome = nomeDoEmail(user.email);

  // Defaults à prova de policy: nada aqui pode quebrar a tela
  let totalProjetos = 0;
  let projetosEmAnalise = 0;

  let totalRelatorios = 0;
  let relatoriosSubmetidos = 0;

  // Projetos recentes (se policy bloquear, fica vazio)
  let projetosRecentes: Array<{
    id: string;
    title: string | null;
    name: string | null;
    status: string | null;
    created_at: string | null;
  }> = [];

  // Relatórios recentes (opcional, mas ajuda muito o dashboard)
  let relatoriosRecentes: Array<{
    id: string;
    title: string | null;
    status: string | null;
    created_at: string | null;
    project_id: string | null;
  }> = [];

  // KPIs: usa SELECT status e calcula em memória (não quebra com RLS, só pode ficar vazio)
  try {
    const [projectsRes, reportsRes] = await Promise.all([
      supabase.schema("public").from("projects").select("status"),
      supabase.schema("public").from("reports").select("status"),
    ]);

    const projects = (projectsRes.data ?? []) as Array<{
      status: string | null;
    }>;
    const reports = (reportsRes.data ?? []) as Array<{ status: string | null }>;

    totalProjetos = projects.length;
    projetosEmAnalise = projects.filter(
      (p) => p.status === "EM_ANALISE"
    ).length;

    totalRelatorios = reports.length;
    relatoriosSubmetidos = reports.filter(
      (r) => r.status === "SUBMITTED"
    ).length;
  } catch {
    // fallback: mantém zeros
  }

  // Lista rápida de projetos
  try {
    const { data } = await supabase
      .schema("public")
      .from("projects")
      .select("id, title, name, status, created_at")
      .order("created_at", { ascending: false })
      .limit(6);

    projetosRecentes = (data ?? []) as typeof projetosRecentes;
  } catch {
    // mantém []
  }

  // Lista rápida de relatórios
  try {
    const { data } = await supabase
      .schema("public")
      .from("reports")
      .select("id, title, status, created_at, project_id")
      .order("created_at", { ascending: false })
      .limit(6);

    relatoriosRecentes = (data ?? []) as typeof relatoriosRecentes;
  } catch {
    // mantém []
  }

  return (
    <div className="space-y-8">
      {/* Boas vindas + ações */}
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bem-vindo(a), {nome}!
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Visão geral do seu sistema hoje.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Usuário autenticado: {user.email ?? user.id}
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
          >
            ⬇️ Ir para relatórios
          </Link>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            ➕ Novo projeto
          </Link>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
          tag="EM_ANALISE"
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
          tag="SUBMITTED"
        />
      </section>

      {/* Atalhos */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/projects"
          className="rounded-xl border bg-white p-4 hover:bg-slate-50"
        >
          <h3 className="font-semibold text-slate-900">Projetos</h3>
          <p className="mt-1 text-sm text-slate-600">
            Cadastro, listagem e gestão por tipo.
          </p>
        </Link>

        <Link
          href="/dashboard/reports"
          className="rounded-xl border bg-white p-4 hover:bg-slate-50"
        >
          <h3 className="font-semibold text-slate-900">Relatórios</h3>
          <p className="mt-1 text-sm text-slate-600">
            Criar, enviar e acompanhar versões.
          </p>
        </Link>

        <Link
          href="/dashboard/organizations"
          className="rounded-xl border bg-white p-4 hover:bg-slate-50"
        >
          <h3 className="font-semibold text-slate-900">Organizações</h3>
          <p className="mt-1 text-sm text-slate-600">
            Membros, papéis e vínculo por organização.
          </p>
        </Link>
      </section>

      {/* Tabela: projetos recentes */}
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Projeto</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {projetosRecentes.map((p) => {
                const label = p.title ?? p.name ?? p.id;
                const statusKey = String(
                  p.status ?? ""
                ) as keyof typeof PROJECT_STATUS_LABEL;
                const statusLabel =
                  (PROJECT_STATUS_LABEL as any)[statusKey] ??
                  String(p.status ?? "-");

                return (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {label}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{statusLabel}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatarData(p.created_at)}
                    </td>
                  </tr>
                );
              })}

              {projetosRecentes.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-slate-500">
                    Nenhum projeto encontrado (ou a policy não permite listar).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tabela: relatórios recentes */}
      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-4">
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Relatório</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Criado em</th>
                <th className="px-6 py-3">Projeto</th>
              </tr>
            </thead>
            <tbody>
              {relatoriosRecentes.map((r) => {
                const statusKey = String(
                  r.status ?? ""
                ) as keyof typeof REPORT_STATUS_LABEL;
                const statusLabel =
                  (REPORT_STATUS_LABEL as any)[statusKey] ??
                  String(r.status ?? "-");

                return (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link
                        href={`/dashboard/reports/${r.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {r.title || "Sem título"}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{statusLabel}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatarData(r.created_at)}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {r.project_id ?? "-"}
                    </td>
                  </tr>
                );
              })}

              {relatoriosRecentes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-slate-500">
                    Nenhum relatório encontrado (ou a policy não permite
                    listar).
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
