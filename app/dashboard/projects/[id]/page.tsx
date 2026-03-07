import Link from "next/link";
import { notFound } from "next/navigation";

import { changeProjectStatusAction } from "@/app/actions/project-status.actions";

import { isConsultant } from "@/lib/permissions";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/status";

import { requireUser } from "@/services/auth.service";
import { getUserContext } from "@/services/membership.service";
import { getProjectByIdForUser } from "@/services/projects.service";
import { listReportsByProject } from "@/services/reports.service";

import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectPlan from "@/components/projects/ProjectPlan";
import ProjectFinancial from "@/components/projects/ProjectFinancial";
import ProjectDocuments from "@/components/projects/ProjectDocuments";
import ProjectReports from "@/components/projects/ProjectReports";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
  searchParams?: {
    tab?: string;
    error?: string | string[];
    success?: string | string[];
  };
};

function toProjectStatus(value: unknown): ProjectStatus {
  const v = String(value ?? "")
    .trim()
    .toUpperCase();

  if (
    v === "DRAFT" ||
    v === "ENVIADO" ||
    v === "EM_ANALISE" ||
    v === "APROVADO" ||
    v === "DEVOLVIDO"
  ) {
    return v;
  }

  return "DRAFT";
}

function readQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  return null;
}

export default async function DashboardProjectDetailPage({
  params,
  searchParams,
}: Props) {
  const user = (await requireUser()) as any;
  const safeUserId = user?.id ?? user?.user?.id;

  if (!safeUserId) {
    notFound();
  }

  const [ctx, rawProject] = await Promise.all([
    getUserContext(safeUserId),
    getProjectByIdForUser(params.id, safeUserId),
  ]);

  if (!rawProject) notFound();

  const project = rawProject as any;
  const reports = await listReportsByProject(project.id, safeUserId);

  const status = toProjectStatus(project.status);

  const projectTitle =
    project.title ?? project.name ?? project.project_name ?? "Projeto";

  const projectType =
    project.project_type ?? project.type ?? project.projectType ?? "-";

  const isOrgUser = ctx.roles.includes("ORG");
  const consultant = isConsultant(ctx);

  const canStartReview = status === "ENVIADO" && consultant;
  const canResubmit = status === "DEVOLVIDO" && isOrgUser;
  const canSubmit = status === "DRAFT" && isOrgUser;
  const canReview = status === "EM_ANALISE" && consultant;

  const errorMessage = readQueryValue(searchParams?.error);
  const success = readQueryValue(searchParams?.success);

  const tab = searchParams?.tab ?? "overview";

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{projectTitle}</h1>

          <p className="text-sm text-slate-600">Tipo: {projectType}</p>

          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
            {PROJECT_STATUS_LABEL[status]}
          </span>
        </div>

        <Link
          href="/dashboard/projects"
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar
        </Link>
      </header>

      {errorMessage && (
        <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      {success && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <section className="rounded-xl border bg-white p-4 space-y-3">
        <h2 className="font-semibold">Fluxo de status</h2>

        {canSubmit && (
          <form action={changeProjectStatusAction}>
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="next_status" value="ENVIADO" />

            <button className="rounded bg-emerald-600 px-4 py-2 text-white">
              Enviar para análise
            </button>
          </form>
        )}

        {canStartReview && (
          <form action={changeProjectStatusAction}>
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="next_status" value="EM_ANALISE" />

            <button className="rounded bg-amber-600 px-4 py-2 text-white">
              Iniciar análise
            </button>
          </form>
        )}

        {canReview && (
          <div className="grid gap-3 sm:grid-cols-2">
            <form action={changeProjectStatusAction}>
              <input type="hidden" name="project_id" value={project.id} />
              <input type="hidden" name="next_status" value="APROVADO" />

              <button className="w-full rounded bg-emerald-600 px-4 py-2 text-white">
                Aprovar
              </button>
            </form>

            <form action={changeProjectStatusAction} className="grid gap-2">
              <input type="hidden" name="project_id" value={project.id} />
              <input type="hidden" name="next_status" value="DEVOLVIDO" />

              <input
                name="reason"
                placeholder="Motivo da devolução"
                className="rounded border px-3 py-2"
                required
              />

              <button className="rounded bg-rose-600 px-4 py-2 text-white">
                Devolver
              </button>
            </form>
          </div>
        )}

        {canResubmit && (
          <form action={changeProjectStatusAction}>
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="next_status" value="ENVIADO" />

            <button className="rounded bg-blue-600 px-4 py-2 text-white">
              Reenviar
            </button>
          </form>
        )}
      </section>

      <nav className="flex gap-4 border-b pb-2 text-sm">
        <Link
          href="?tab=overview"
          className={
            tab === "overview" ? "font-semibold text-black" : "text-slate-500"
          }
        >
          Overview
        </Link>

        <Link
          href="?tab=plan"
          className={
            tab === "plan" ? "font-semibold text-black" : "text-slate-500"
          }
        >
          Plano
        </Link>

        <Link
          href="?tab=financial"
          className={
            tab === "financial" ? "font-semibold text-black" : "text-slate-500"
          }
        >
          Financeiro
        </Link>

        <Link
          href="?tab=documents"
          className={
            tab === "documents" ? "font-semibold text-black" : "text-slate-500"
          }
        >
          Documentos
        </Link>

        <Link
          href="?tab=reports"
          className={
            tab === "reports" ? "font-semibold text-black" : "text-slate-500"
          }
        >
          Relatórios
        </Link>
      </nav>

      {tab === "overview" && <ProjectOverview project={project} />}

      {tab === "plan" && <ProjectPlan project={project} />}

      {tab === "financial" && <ProjectFinancial project={project} />}

      {tab === "documents" && <ProjectDocuments project={project} />}

      {tab === "reports" && (
        <ProjectReports
          projectId={String(project.id)}
          reports={reports as any[]}
        />
      )}
    </main>
  );
}
