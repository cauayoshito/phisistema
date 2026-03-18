import Link from "next/link";
import { notFound } from "next/navigation";

import { changeProjectStatusAction } from "@/app/actions/project-status.actions";

import { isConsultant } from "@/lib/permissions";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/status";

import { requireUser } from "@/services/auth.service";
import {
  getUserContext,
  getOrganizationMemberships,
} from "@/services/membership.service";
import {
  getProjectByIdForUser,
  listProjectParticipants,
} from "@/services/projects.service";
import { listReportsByProject } from "@/services/reports.service";
import { listOrganizationMembers } from "@/services/organizations.service";

import ProjectOverview from "@/components/projects/ProjectOverview";
import ProjectPlan from "@/components/projects/ProjectPlan";
import ProjectFinancial from "@/components/projects/ProjectFinancial";
import ProjectDocuments from "@/components/projects/ProjectDocuments";
import ProjectReports from "@/components/projects/ProjectReports";
import ProjectParticipants from "@/components/projects/ProjectParticipants";

export const dynamic = "force-dynamic";

const tabs = [
  { key: "overview", label: "Visão geral" },
  { key: "plan", label: "Plano" },
  { key: "financial", label: "Financeiro" },
  { key: "documents", label: "Documentos" },
  { key: "reports", label: "Relatórios" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

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

function normalizeRole(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function isTabKey(value: string): value is TabKey {
  return tabs.some((tab) => tab.key === value);
}

function readTab(value: string | string[] | undefined): TabKey {
  const tab = readQueryValue(value);
  return tab && isTabKey(tab) ? tab : "overview";
}

function buildTabHref(projectId: string, tab: TabKey) {
  return `/dashboard/projects/${projectId}?tab=${tab}`;
}

function projectTypeLabel(value: unknown) {
  const v = String(value ?? "")
    .trim()
    .toUpperCase();

  if (v === "INCENTIVADO") return "Incentivos Fiscais";
  if (v === "RECURSOS_PUBLICOS") return "Recursos Públicos";
  if (v === "RECURSOS_PROPRIOS") return "Recursos Próprios";
  return String(value ?? "-");
}

function buildStatusNote(
  status: ProjectStatus,
  isOrgUser: boolean,
  consultant: boolean
) {
  if (status === "APROVADO") {
    return "Este projeto já foi aprovado. Nenhuma ação adicional está disponível nesta etapa.";
  }

  if (status === "DRAFT") {
    return isOrgUser
      ? "Revise as informações do projeto e envie para análise quando estiver pronto."
      : "O projeto ainda está em rascunho e aguarda envio pela organização.";
  }

  if (status === "ENVIADO") {
    return consultant
      ? "Este projeto está pronto para análise."
      : "O projeto foi enviado e aguarda início da análise.";
  }

  if (status === "EM_ANALISE") {
    return "O projeto está em análise no momento.";
  }

  return isOrgUser
    ? "O projeto foi devolvido para ajustes. Revise as informações e reenvie quando estiver pronto."
    : "O projeto foi devolvido para ajustes e aguarda atualização da organização.";
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

  const project = rawProject;

  const [reports, organizationMembers, participants, orgMemberships] =
    await Promise.all([
      listReportsByProject(project.id, safeUserId),
      listOrganizationMembers(project.organization_id),
      listProjectParticipants(project.id),
      getOrganizationMemberships(safeUserId),
    ]);

  const status = toProjectStatus(project.status);

  const projectTitle =
    (project as any).title ??
    (project as any).name ??
    (project as any).project_name ??
    "Projeto";

  const projectType =
    (project as any).project_type ??
    (project as any).type ??
    (project as any).projectType ??
    "-";

  const isOrgUser = ctx.roles.includes("ORG");
  const consultant = isConsultant(ctx);

  const isLockedForOrg =
    isOrgUser &&
    (status === "ENVIADO" || status === "EM_ANALISE" || status === "APROVADO");

  const canEditProjectContent =
    isOrgUser && (status === "DRAFT" || status === "DEVOLVIDO");

  const canStartReview = status === "ENVIADO" && consultant;
  const canResubmit = status === "DEVOLVIDO" && isOrgUser;
  const canSubmit = status === "DRAFT" && isOrgUser;
  const canReview = status === "EM_ANALISE" && consultant;

  const currentParticipant = participants.find(
    (participant) => participant.user_id === safeUserId
  );

  const isProjectOwner = normalizeRole(currentParticipant?.role) === "OWNER";

  const currentOrgMembership = orgMemberships.find(
    (membership) => membership.organization_id === project.organization_id
  );

  const isOrgAdmin = normalizeRole(currentOrgMembership?.role) === "ORG_ADMIN";

  const canManageParticipants = isProjectOwner || isOrgAdmin;
  const canEditParticipants = canManageParticipants && canEditProjectContent;

  const errorMessage = readQueryValue(searchParams?.error);
  const successMessage = readQueryValue(searchParams?.success);
  const tab = readTab(searchParams?.tab);
  const hasStatusActions =
    canSubmit || canStartReview || canReview || canResubmit;
  const statusNote = buildStatusNote(status, isOrgUser, consultant);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            {projectTitle}
          </h1>

          <p className="break-words text-sm text-slate-600">
            Tipo: {projectTypeLabel(projectType)}
          </p>

          <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {PROJECT_STATUS_LABEL[status]}
          </span>
        </div>

        <Link
          href="/dashboard/projects"
          className="inline-flex min-h-10 items-center text-sm font-medium text-blue-600 hover:underline"
        >
          Voltar para projetos
        </Link>
      </header>

      {errorMessage && (
        <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <section className="space-y-4 rounded-xl border bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">
          Status do projeto
        </h2>
        <p className="text-sm text-slate-600">
          Acompanhe o andamento do projeto e execute as próximas ações quando
          estiverem disponíveis.
        </p>

        {canSubmit && (
          <form action={changeProjectStatusAction} className="w-full">
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="next_status" value="ENVIADO" />

            <button className="inline-flex min-h-11 w-full items-center justify-center rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto">
              Enviar para análise
            </button>
          </form>
        )}

        {canStartReview && (
          <form action={changeProjectStatusAction} className="w-full">
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="next_status" value="EM_ANALISE" />

            <button className="inline-flex min-h-11 w-full items-center justify-center rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 sm:w-auto">
              Iniciar análise
            </button>
          </form>
        )}

        {canReview && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form action={changeProjectStatusAction}>
              <input type="hidden" name="project_id" value={project.id} />
              <input type="hidden" name="next_status" value="APROVADO" />

              <button className="min-h-11 w-full rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
                Aprovar
              </button>
            </form>

            <form action={changeProjectStatusAction} className="grid gap-2">
              <input type="hidden" name="project_id" value={project.id} />
              <input type="hidden" name="next_status" value="DEVOLVIDO" />

              <input
                name="reason"
                placeholder="Explique o motivo da devolução"
                className="min-h-11 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400"
                required
              />

              <button className="min-h-11 rounded bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700">
                Devolver
              </button>
            </form>
          </div>
        )}

        {canResubmit && (
          <form action={changeProjectStatusAction} className="w-full">
            <input type="hidden" name="project_id" value={project.id} />
            <input type="hidden" name="next_status" value="ENVIADO" />

            <button className="inline-flex min-h-11 w-full items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto">
              Reenviar
            </button>
          </form>
        )}

        {isLockedForOrg && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Projeto enviado para análise. A edição do conteúdo e dos
            participantes está temporariamente bloqueada até nova devolução ou
            conclusão da análise.
          </div>
        )}

        {!hasStatusActions && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {statusNote}
          </div>
        )}
      </section>

      <nav className="-mx-4 overflow-x-auto border-b px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-4 pb-2 text-sm">
          {tabs.map((item) => (
            <Link
              key={item.key}
              href={buildTabHref(String(project.id), item.key)}
              className={
                tab === item.key
                  ? "whitespace-nowrap font-semibold text-slate-900"
                  : "whitespace-nowrap text-slate-500 hover:text-slate-900"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="min-w-0">
        {tab === "overview" && (
          <div className="space-y-6">
            <ProjectOverview project={project as any} />

            <ProjectParticipants
              projectId={String(project.id)}
              canManage={canEditParticipants}
              organizationMembers={organizationMembers as any[]}
              participants={participants as any[]}
            />
          </div>
        )}

        {tab === "plan" &&
          (isLockedForOrg ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Este projeto já foi enviado para análise. A aba de planejamento
              está em modo de visualização até nova devolução.
            </div>
          ) : (
            <ProjectPlan project={project as any} />
          ))}

        {tab === "financial" &&
          (isLockedForOrg ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Este projeto já foi enviado para análise. A aba financeira está em
              modo de visualização até nova devolução.
            </div>
          ) : (
            <ProjectFinancial project={project as any} />
          ))}

        {tab === "documents" &&
          (isLockedForOrg ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Este projeto já foi enviado para análise. O envio de novos
              documentos está temporariamente bloqueado.
            </div>
          ) : (
            <ProjectDocuments
              projectId={String(project.id)}
              projectType={String(projectType)}
            />
          ))}

        {tab === "reports" && (
          <ProjectReports
            projectId={String(project.id)}
            reports={reports as any[]}
          />
        )}
      </div>
    </main>
  );
}
