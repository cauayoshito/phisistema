import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/status";

type ProjectLike = {
  id: string;
  title?: string | null;
  name?: string | null;
  status?: string | null;
  project_type?: string | null;
  organization_id?: string | null;
  linked_entity_id?: string | null;
  linked_entity_name?: string | null;
  linked_entity_type?: string | null;
  created_at?: string | null;
  description?: string | null;
};

type Props = {
  project: ProjectLike;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(date);
}

function fallback(value?: string | null, fallbackValue = "-") {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : fallbackValue;
}

function projectStatusLabel(value?: string | null) {
  const key = String(value ?? "")
    .trim()
    .toUpperCase() as ProjectStatus;

  return PROJECT_STATUS_LABEL[key] ?? fallback(value);
}

function projectTypeLabel(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if (normalized === "INCENTIVADO") return "Incentivos Fiscais";
  if (normalized === "RECURSOS_PUBLICOS") return "Recursos Publicos";
  if (normalized === "RECURSOS_PROPRIOS") return "Recursos Proprios";
  return fallback(value);
}

function organizationSummary(value?: string | null) {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "Nenhuma organizacao vinculada.";
  return "Projeto vinculado a uma organizacao ativa no sistema.";
}

function linkedEntityTypeLabel(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "empresa") return "Empresa";
  if (normalized === "entidade_publica") return "Entidade publica";
  return "Nao informado";
}

export default function ProjectOverview({ project }: Props) {
  const title = project.title ?? project.name ?? "Projeto sem titulo";
  const hasStructuredEntityLink = Boolean(
    String(project.linked_entity_id ?? "").trim()
  );

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">Visao geral</h2>
        <p className="mt-1 text-sm text-slate-600">
          Informacoes principais para acompanhar este projeto.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Titulo
            </p>
            <p className="mt-1 break-words text-sm font-medium text-slate-900">
              {fallback(title)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {projectStatusLabel(project.status)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipo
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {projectTypeLabel(project.project_type)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Vinculo institucional
            </p>
            <p className="mt-1 break-words text-sm text-slate-700">
              {organizationSummary(project.organization_id)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Entidade vinculada
            </p>
            <p className="mt-1 break-words text-sm font-medium text-slate-900">
              {fallback(
                project.linked_entity_name,
                "Nenhuma entidade vinculada foi informada para este projeto."
              )}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Tipo de vinculo:{" "}
              <span className="font-medium text-slate-900">
                {linkedEntityTypeLabel(project.linked_entity_type)}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {hasStructuredEntityLink
                ? "Esta entidade esta cadastrada na organizacao e vinculada formalmente a este projeto."
                : "Este projeto mantem o vinculo registrado no momento da criacao."}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Criado em
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(project.created_at)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Resumo do projeto
            </p>
            <p className="mt-1 break-words text-sm text-slate-700">
              {fallback(
                project.description,
                "Nenhum resumo foi informado para este projeto."
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
