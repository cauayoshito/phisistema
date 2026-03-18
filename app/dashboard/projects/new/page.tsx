import Link from "next/link";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import NewProjectForm from "./NewProjectForm";
import { requireUser } from "@/services/auth.service";
import {
  getUserContext,
  getOrganizationMemberships,
} from "@/services/membership.service";
import { listInstitutionalEntitiesForOrganizations } from "@/services/institutional-entities.service";
import { createProject } from "@/services/projects.service";
import { getPrimaryRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: { error?: string | string[] };
};

type ProjectType = "INCENTIVADO" | "RECURSOS_PUBLICOS" | "RECURSOS_PROPRIOS";

function readQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  return null;
}

function encodeMsg(message: string) {
  return encodeURIComponent(message);
}

function normalizeProjectType(raw: string): ProjectType {
  const normalized = String(raw ?? "")
    .trim()
    .toUpperCase();

  if (normalized === "INCENTIVADO") return "INCENTIVADO";
  if (normalized === "RECURSOS_PUBLICOS") return "RECURSOS_PUBLICOS";
  if (normalized === "RECURSOS_PROPRIOS") return "RECURSOS_PROPRIOS";
  return "INCENTIVADO";
}

function normalizeRole(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function roleLabel(value: string | null | undefined) {
  const normalized = normalizeRole(value);

  if (normalized === "ORG_ADMIN") return "Administrador";
  if (normalized === "ORG_MEMBER") return "Membro";
  return "Vínculo";
}

function getInitialMetadataByProjectType(projectType: ProjectType) {
  const base = {
    model_version: 1,
    project_type: projectType,
    identification: {
      responsible_name: "",
      responsible_email: "",
      responsible_phone: "",
      start_date: "",
      end_date: "",
      city: "",
      state: "",
    },
    objectives: {
      general_objective: "",
      specific_objectives: [],
      target_audience: "",
      expected_beneficiaries: null,
    },
    goals_and_deliveries: {
      goals: [],
      indicators: [],
      expected_results: "",
    },
    schedule: {
      stages: [],
      milestones: [],
      reporting_frequency: "",
    },
    financial: {
      total_value: null,
      executed_value: null,
      remaining_value: null,
      categories: [],
      notes: "",
    },
    accountability: {
      qualitative_report: "",
      evidence_notes: "",
      attachments_expected: [],
      photos_expected: false,
    },
    documents: {
      required: [],
      optional: [],
    },
  };

  if (projectType === "INCENTIVADO") {
    return {
      ...base,
      legal_framework: {
        incentive_law: "",
        pronac: "",
        approval_publication: "",
        sponsor: "",
        counterparties: [],
      },
      schedule: {
        ...base.schedule,
        reporting_frequency: "mensal",
      },
      accountability: {
        ...base.accountability,
        photos_expected: true,
        attachments_expected: [
          "relatorio_qualitativo",
          "registro_fotografico",
          "comprovantes_financeiros",
        ],
      },
      documents: {
        required: [
          "documentacao_institucional",
          "aprovacao_do_projeto",
          "comprovantes_financeiros",
        ],
        optional: ["materiais_complementares"],
      },
    };
  }

  if (projectType === "RECURSOS_PUBLICOS") {
    return {
      ...base,
      public_funding: {
        public_notice: "",
        agreement_number: "",
        government_agency: "",
        work_plan_reference: "",
        accountability_deadline: "",
      },
      schedule: {
        ...base.schedule,
        reporting_frequency: "mensal",
      },
      accountability: {
        ...base.accountability,
        photos_expected: true,
        attachments_expected: [
          "plano_de_trabalho",
          "extratos",
          "comprovantes_financeiros",
          "relatorio_de_execucao",
        ],
      },
      documents: {
        required: [
          "termo_ou_convenio",
          "plano_de_trabalho",
          "certidoes",
          "extratos",
          "comprovantes_financeiros",
        ],
        optional: ["anexos_complementares"],
      },
    };
  }

  return {
    ...base,
    own_resources: {
      funding_source: "",
      internal_budget_reference: "",
      internal_approval: "",
      main_investor: "",
    },
    schedule: {
      ...base.schedule,
      reporting_frequency: "mensal",
    },
    accountability: {
      ...base.accountability,
      photos_expected: true,
      attachments_expected: [
        "relatorio_qualitativo",
        "extratos",
        "comprovantes_financeiros",
      ],
    },
    documents: {
      required: [
        "documentacao_institucional",
        "comprovantes_financeiros",
        "extratos",
      ],
      optional: ["anexos_complementares"],
    },
  };
}

async function createProjectAction(formData: FormData) {
  "use server";

  const user = await requireUser();

  try {
    const [ctx, memberships] = await Promise.all([
      getUserContext(user.id),
      getOrganizationMemberships(user.id),
    ]);

    const userRole = getPrimaryRole(ctx);
    const organizationId = String(formData.get("organization_id") ?? "").trim();

    if (userRole !== "ORG") {
      redirect(
        `/dashboard/projects?error=${encodeMsg(
          "Apenas organizações sociais podem criar projetos."
        )}`
      );
    }

    const membership = memberships.find(
      (item) => item.organization_id === organizationId
    );

    const membershipRole = normalizeRole(membership?.role);

    if (membershipRole !== "ORG_ADMIN") {
      redirect(
        `/dashboard/projects?error=${encodeMsg(
          "Apenas administradores da organização podem criar projetos."
        )}`
      );
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;

    redirect(
      `/dashboard/projects?error=${encodeMsg(
        "Não foi possível validar suas permissões para criar o projeto."
      )}`
    );
  }

  const title = String(formData.get("title") ?? "").trim();
  const projectType = normalizeProjectType(
    String(formData.get("project_type") ?? "")
  );
  const description = String(formData.get("description") ?? "").trim();
  const organizationId = String(formData.get("organization_id") ?? "").trim();
  const linkedEntityId = String(formData.get("linked_entity_id") ?? "").trim();

  if (!title) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg("Informe o nome do projeto.")}`
    );
  }

  if (!organizationId) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        "Você precisa estar vinculado a uma organização para criar um projeto."
      )}`
    );
  }

  if (!linkedEntityId) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        "Selecione um financiador cadastrado da organização."
      )}`
    );
  }

  const initialMetadata = getInitialMetadataByProjectType(projectType);

  try {
    const project = await createProject({
      title,
      description: description || null,
      project_type: projectType,
      organization_id: organizationId,
      linked_entity_id: linkedEntityId,
      metadata: initialMetadata as any,
    });

    redirect(`/dashboard/projects/${project.id}?tab=overview`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Não foi possível criar o projeto agora. Revise o financiador vinculado e tente novamente.";

    redirect(`/dashboard/projects/new?error=${encodeMsg(message)}`);
  }
}

export default async function NewProjectPage({ searchParams }: Props) {
  const user = await requireUser();

  let role: ReturnType<typeof getPrimaryRole> = "ORG";
  try {
    const ctx = await getUserContext(user.id);
    role = getPrimaryRole(ctx);
  } catch {
    // fallback ORG
  }

  if (role !== "ORG") {
    redirect(
      `/dashboard/projects?error=${encodeMsg(
        "Apenas organizações sociais podem criar projetos."
      )}`
    );
  }

  const memberships = await getOrganizationMemberships(user.id);

  const adminMemberships = memberships.filter(
    (membership) => normalizeRole(membership.role) === "ORG_ADMIN"
  );

  if (adminMemberships.length === 0) {
    redirect(
      `/dashboard/projects?error=${encodeMsg(
        "Apenas administradores da organização podem criar projetos."
      )}`
    );
  }

  const errorMessage = readQueryValue(searchParams?.error);

  const availableOrganizations = adminMemberships.filter((membership) =>
    Boolean(membership.organization_id)
  );

  const hasOrganizations = availableOrganizations.length > 0;

  const organizationIds = availableOrganizations
    .map((membership) => membership.organization_id)
    .filter(Boolean) as string[];

  const institutionalEntities =
    organizationIds.length > 0
      ? await listInstitutionalEntitiesForOrganizations(organizationIds)
      : [];

  const activeEntities = institutionalEntities.filter(
    (entity) => String(entity.status ?? "").toUpperCase() === "ACTIVE"
  );

  const hasEntities = activeEntities.length > 0;

  const defaultOrgId = availableOrganizations[0]?.organization_id ?? "";

  const organizationOptions = availableOrganizations.map((membership) => ({
    id: membership.organization_id,
    label:
      (membership.organization?.name ?? "Organização sem nome") +
      " - " +
      roleLabel(membership.role),
  }));

  const entityOptions = activeEntities.map((entity) => ({
    id: entity.id,
    organization_id: entity.organization_id,
    display_name: entity.display_name,
    entity_type: entity.entity_type,
  }));

  return (
    <main className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Novo projeto
          </h1>
          <p className="text-sm text-slate-600">
            Escolha o modelo do projeto e selecione o financiador que ficará
            vinculado a ele desde a criação.
          </p>
        </div>

        <Link
          href="/dashboard/projects"
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar
        </Link>
      </header>

      {errorMessage && errorMessage !== "NEXT_REDIRECT" && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      {!hasOrganizations && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Você ainda não tem vínculo administrativo com uma organização. Peça
          acesso a um administrador para poder criar projetos.
        </div>
      )}

      {hasOrganizations && !hasEntities && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Nenhum financiador (empresa ou órgão público) foi cadastrado ainda
          para suas organizações. Entre em contato com o administrador para
          vincular um financiador antes de criar um projeto.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Incentivos Fiscais</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Projetos aprovados em uma das leis de incentivo fiscal.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Recursos Públicos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Projetos celebrados com o poder público.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Recursos Próprios</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Projetos que buscam apoio financeiro de empresas.
          </p>
        </div>
      </section>

      <NewProjectForm
        action={createProjectAction}
        organizations={organizationOptions}
        entities={entityOptions}
        defaultOrganizationId={defaultOrgId}
        canSubmit={hasOrganizations && hasEntities}
      />
    </main>
  );
}
