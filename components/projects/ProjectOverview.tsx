import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/status";

type ProjectLike = {
  id: string;
  title?: string | null;
  name?: string | null;
  status?: string | null;
  project_type?: string | null;
  organization_id?: string | null;
  created_at?: string | null;
  description?: string | null;
};

type Props = {
  project: ProjectLike;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(d);
}

function fallback(v?: string | null, fb = "-") {
  const s = String(v ?? "").trim();
  return s.length ? s : fb;
}

function projectStatusLabel(value?: string | null) {
  const key = String(value ?? "")
    .trim()
    .toUpperCase() as ProjectStatus;
  return PROJECT_STATUS_LABEL[key] ?? fallback(value);
}

function projectTypeLabel(value?: string | null) {
  const v = String(value ?? "")
    .trim()
    .toUpperCase();

  if (v === "RECURSOS_PROPRIOS") return "Recursos Próprios";
  if (v === "RECURSOS_PUBLICOS") return "Recursos Públicos";
  if (v === "INCENTIVADO") return "Incentivado";

  return fallback(value);
}

function organizationLabel(value?: string | null) {
  const v = String(value ?? "").trim();
  if (!v) return "Não vinculada";

  if (v.length <= 12) return v;

  return `${v.slice(0, 8)}...${v.slice(-4)}`;
}

export default function ProjectOverview({ project }: Props) {
  const title = project.title ?? project.name ?? "Projeto sem título";

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">Visão geral</h2>
        <p className="mt-1 text-sm text-slate-600">
          Informações principais do projeto.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Título
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
              Organização
            </p>
            <p className="mt-1 break-words text-sm font-medium text-slate-900">
              {organizationLabel(project.organization_id)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Criado em
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {formatDate(project.created_at)}
            </p>
          </div>

          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Identificador interno
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Registro interno do sistema.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Descrição
            </p>
            <p className="mt-1 break-words text-sm text-slate-700">
              {fallback(project.description, "Sem descrição.")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
