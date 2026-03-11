import { updateProjectFinancialAction } from "@/app/actions/project-financial.actions";

type ProjectLike = {
  id: string;
  project_type?: string | null;
  financial_data?: any | null;
};

type Props = {
  project: ProjectLike;
};

function typeLabel(type?: string | null) {
  const v = String(type ?? "")
    .toUpperCase()
    .trim();
  if (!v) return "-";
  if (v === "RECURSOS_PROPRIOS") return "RECURSOS PRÓPRIOS";
  if (v === "RECURSOS_PUBLICOS") return "RECURSOS PÚBLICOS";
  if (v === "INCENTIVADO") return "INCENTIVADO";
  return v;
}

export default function ProjectFinancial({ project }: Props) {
  const totalRaw = String(project.financial_data?.total_value_raw ?? "");
  const raisedRaw = String(project.financial_data?.raised_value_raw ?? "");
  const percent = Number(project.financial_data?.raised_percent ?? 0);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-slate-900">Financeiro</h2>
        <p className="mt-1 text-sm text-slate-600">
          MVP: valor total, captado e % (persistido em{" "}
          <code className="font-mono">projects.financial_data</code>).
        </p>
      </div>

      <form action={updateProjectFinancialAction} className="space-y-6 p-4 sm:p-6">
        <input type="hidden" name="project_id" value={project.id} />

        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Tipo do projeto:{" "}
          <span className="font-semibold">
            {typeLabel(project.project_type)}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Valor total
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ex: 10000 ou 10.000,00"
              inputMode="decimal"
              name="total_value"
              defaultValue={totalRaw}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Valor captado
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="Ex: 2500 ou 2.500,00"
              inputMode="decimal"
              name="raised_value"
              defaultValue={raisedRaw}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              % captação
            </label>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700"
              readOnly
              value={`${percent}%`}
              name="raised_percent_preview"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto">
            Salvar financeiro
          </button>
        </div>
      </form>
    </section>
  );
}
