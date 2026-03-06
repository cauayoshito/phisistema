// components/projects/ProjectOverview.tsx

type ProjectLike = {
  id: string;
  title: string;
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
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR");
}

function fallback(v?: string | null, fb = "—") {
  const s = String(v ?? "").trim();
  return s.length ? s : fb;
}

export default function ProjectOverview({ project }: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">Visão geral</h2>
        <p className="mt-1 text-sm text-slate-600">
          Informações principais do projeto (resumo).
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Título
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {fallback(project.title)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {fallback(project.status)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tipo
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {fallback(project.project_type)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Organização
            </p>
            <p className="mt-1 break-all text-sm font-medium text-slate-900">
              {fallback(project.organization_id)}
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

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              ID
            </p>
            <p className="mt-1 break-all text-sm font-medium text-slate-900">
              {fallback(project.id)}
            </p>
          </div>

          <div className="md:col-span-2 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Descrição
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {fallback(project.description, "Sem descrição.")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
