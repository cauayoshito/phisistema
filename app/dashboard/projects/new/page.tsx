import Link from "next/link";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { requireUser } from "@/services/auth.service";
import { getOrganizationMemberships } from "@/services/membership.service";
import { createProject } from "@/services/projects.service";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: { error?: string | string[] };
};

type ProjectType = "INCENTIVADO" | "RECURSOS_PUBLICOS" | "RECURSOS_PROPRIOS";

function readQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  return null;
}

function encodeMsg(msg: string) {
  return encodeURIComponent(msg);
}

function normalizeProjectType(raw: string): ProjectType {
  const v = String(raw ?? "")
    .trim()
    .toUpperCase();

  if (v === "INCENTIVADO") return "INCENTIVADO";
  if (v === "RECURSOS_PUBLICOS") return "RECURSOS_PUBLICOS";
  if (v === "RECURSOS_PROPRIOS") return "RECURSOS_PROPRIOS";

  return "INCENTIVADO";
}

function projectTypeLabel(type: ProjectType) {
  if (type === "INCENTIVADO") return "Incentivado";
  if (type === "RECURSOS_PUBLICOS") return "Recursos Públicos";
  return "Recursos Próprios";
}

function roleLabel(value: string | null | undefined) {
  const v = String(value ?? "")
    .trim()
    .toUpperCase();
  if (v === "ORG_ADMIN") return "Administrador";
  if (v === "ORG_MEMBER") return "Membro";
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

  await requireUser();

  const title = String(formData.get("title") ?? "").trim();
  const projectType = normalizeProjectType(
    String(formData.get("project_type") ?? "")
  );
  const description = String(formData.get("description") ?? "").trim();
  const organizationId = String(formData.get("organization_id") ?? "").trim();

  if (!title) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg("Informe o nome do projeto.")}`
    );
  }

  if (!organizationId) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        "Selecione a organização do projeto."
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
      metadata: initialMetadata as any,
    });

    redirect(`/dashboard/projects/${project.id}?tab=overview`);
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        error instanceof Error
          ? `Falha ao criar projeto: ${error.message}`
          : "Falha ao criar projeto."
      )}`
    );
  }
}

export default async function NewProjectPage({ searchParams }: Props) {
  const user = await requireUser();
  const memberships = await getOrganizationMemberships(user.id);

  const errorMessage = readQueryValue(searchParams?.error);

  const availableOrganizations = memberships.filter((m) => !!m.organization_id);

  const defaultOrgId =
    availableOrganizations.find(
      (m) => String(m.role ?? "").toUpperCase() === "ORG_ADMIN"
    )?.organization_id ??
    availableOrganizations[0]?.organization_id ??
    "";

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Novo projeto</h1>
          <p className="text-sm text-slate-600">
            Escolha o modelo do projeto e crie a base inicial para preencher as
            abas de plano, financeiro, documentos e relatórios.
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

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Incentivado</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Projetos com lei de incentivo, dados de aprovação, PRONAC,
            contrapartidas e prestação com qualitativo, financeiro e fotos.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Recursos Públicos</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Projetos com edital, convênio ou termo, plano de trabalho, execução
            financeira, extratos e prestação de contas por metas e despesas.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-slate-900">Recursos Próprios</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Projetos com investimento próprio, plano de aplicação, documentação
            institucional e prestação com metas, qualitativo e financeiro.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Dados iniciais do projeto
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            O sistema cria o projeto já com a estrutura base do modelo
            selecionado para acelerar o preenchimento da Fase 1.
          </p>
        </div>

        <form action={createProjectAction} className="space-y-6 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Nome do projeto
              </label>
              <input
                name="title"
                placeholder="Ex: Educação no trânsito também é coisa de criança!"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Organização
              </label>
              <select
                name="organization_id"
                defaultValue={defaultOrgId}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              >
                {availableOrganizations.length === 0 ? (
                  <option value="">Nenhuma organização disponível</option>
                ) : (
                  availableOrganizations.map((membership) => (
                    <option
                      key={membership.organization_id}
                      value={membership.organization_id}
                    >
                      {(membership.organization?.name ??
                        "Organização sem nome") +
                        " • " +
                        roleLabel(membership.role)}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Modelo do projeto
              </label>
              <select
                name="project_type"
                defaultValue="INCENTIVADO"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="INCENTIVADO">
                  {projectTypeLabel("INCENTIVADO")}
                </option>
                <option value="RECURSOS_PUBLICOS">
                  {projectTypeLabel("RECURSOS_PUBLICOS")}
                </option>
                <option value="RECURSOS_PROPRIOS">
                  {projectTypeLabel("RECURSOS_PROPRIOS")}
                </option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Status inicial
              </label>
              <input
                value="Rascunho"
                readOnly
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Descrição inicial (opcional)
              </label>
              <textarea
                name="description"
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Observações iniciais, resumo do projeto ou contexto do cadastro..."
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Ao criar o projeto, o sistema já inicia a estrutura-base de{" "}
            <span className="font-medium">
              identificação, metas, cronograma, financeiro, documentos e
              prestação de contas
            </span>{" "}
            conforme o modelo escolhido.
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/projects"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              disabled={availableOrganizations.length === 0}
            >
              Criar projeto
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
