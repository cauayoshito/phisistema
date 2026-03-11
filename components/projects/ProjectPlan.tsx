import { saveProjectPlanAction } from "@/app/actions/project-plan.actions";

type ProjectLike = {
  id: string;
  project_type?: string | null;
  plan_data?: any;
};

export default function ProjectPlan({ project }: { project: ProjectLike }) {
  const objective = String(project.plan_data?.objective ?? "");

  return (
    <section className="space-y-4 sm:space-y-6">
      <div className="rounded-xl border bg-white p-4 sm:p-5">
        <div className="mb-3 text-sm text-slate-600">
          Tipo do projeto:{" "}
          <span className="font-semibold text-slate-900">
            {project.project_type ?? "-"}
          </span>
        </div>

        <form action={saveProjectPlanAction} className="space-y-4">
          <input type="hidden" name="project_id" value={project.id} />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">
              Objetivo geral
            </label>
            <textarea
              name="objective"
              defaultValue={objective}
              className="min-h-[140px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-300"
              placeholder="Descreva o objetivo principal do projeto..."
            />
            <p className="mt-2 text-xs text-slate-500">
              Salva em <code>projects.plan_data</code>.
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto"
            >
              Salvar plano
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Metas</h3>
            <p className="text-xs text-slate-500">
              Próximo passo: persistir lista de metas (P2).
            </p>
          </div>

          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-400"
            title="P2"
          >
            Adicionar meta (em breve)
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2">DESCRIÇÃO</th>
                <th className="px-3 py-2">INDICADOR</th>
                <th className="px-3 py-2">PRAZO</th>
                <th className="px-3 py-2 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-slate-400">
                <td className="px-3 py-3">-</td>
                <td className="px-3 py-3">-</td>
                <td className="px-3 py-3">-</td>
                <td className="px-3 py-3 text-right">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
