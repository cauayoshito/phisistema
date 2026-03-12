import Link from "next/link";
import { createReportAction } from "@/app/actions/report.actions";
import { REPORT_STATUS_LABEL, type ReportStatus } from "@/lib/status";

type Props = {
  projectId: string;
  reports: any[];
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  return String(iso).slice(0, 10);
}

function fallbackTitle(
  title: string | null | undefined,
  start: string | null | undefined,
  end: string | null | undefined
) {
  if (title && title.trim()) return title;
  return `Relatório ${formatDate(start)} a ${formatDate(end)}`;
}

function getCurrentMonthRange() {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const toInputDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    start: toInputDate(start),
    end: toInputDate(end),
  };
}

export default function ProjectReports({ projectId, reports }: Props) {
  const defaults = getCurrentMonthRange();

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Relatórios do projeto
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Crie um relatório aqui e abra-o na tela própria do relatório para
              concluir o preenchimento.
            </p>
          </div>

          <Link
            href="/dashboard/reports"
            className="text-sm text-blue-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        <form
          action={createReportAction}
          className="mt-4 grid gap-3 md:grid-cols-6"
        >
          <input type="hidden" name="project_id" value={projectId} />

          <div className="md:col-span-3">
            <label className="mb-1 block text-xs text-slate-600">
              Título (opcional)
            </label>
            <input
              name="title"
              placeholder="Ex: Relatório mensal"
              className="w-full rounded border border-slate-200 px-3 py-2"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-xs text-slate-600">Tipo</label>
            <select
              name="period_type"
              className="w-full rounded border border-slate-200 px-3 py-2"
              defaultValue="MONTHLY"
            >
              <option value="MONTHLY">Mensal</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-xs text-slate-600">Início</label>
            <input
              name="period_start"
              type="date"
              className="w-full rounded border border-slate-200 px-3 py-2"
              defaultValue={defaults.start}
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-xs text-slate-600">Fim</label>
            <input
              name="period_end"
              type="date"
              className="w-full rounded border border-slate-200 px-3 py-2"
              defaultValue={defaults.end}
              required
            />
          </div>

          <button
            className="w-full rounded bg-blue-600 px-4 py-2 text-white md:col-span-6"
            type="submit"
          >
            Criar relatório
          </button>
        </form>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-200 md:hidden">
          {reports.map((r: any) => (
            <div key={r.id} className="space-y-3 px-4 py-4">
              <div className="break-words text-sm font-medium text-slate-900">
                {fallbackTitle(r.title, r.period_start, r.period_end)}
              </div>

              <div className="grid gap-2 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-900">Período:</span>{" "}
                  {formatDate(r.period_start)} a {formatDate(r.period_end)}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Status:</span>{" "}
                  {REPORT_STATUS_LABEL[r.status as ReportStatus] ??
                    String(r.status ?? "-")}
                </div>
                <div>
                  <span className="font-medium text-slate-900">Criado em:</span>{" "}
                  {String(r.created_at ?? "").slice(0, 19) || "-"}
                </div>
              </div>

              <Link
                href={`/dashboard/reports/${r.id}`}
                className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Abrir relatório
              </Link>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="px-4 py-4 text-sm text-slate-500">
              Nenhum relatório foi criado para este projeto.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Criado em</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r: any) => (
                <tr key={r.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    {fallbackTitle(r.title, r.period_start, r.period_end)}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(r.period_start)} a {formatDate(r.period_end)}
                  </td>

                  <td className="px-4 py-3">
                    {REPORT_STATUS_LABEL[r.status as ReportStatus] ??
                      String(r.status ?? "-")}
                  </td>

                  <td className="px-4 py-3">
                    {String(r.created_at ?? "").slice(0, 19) || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/reports/${r.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Abrir relatório
                    </Link>
                  </td>
                </tr>
              ))}

              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-slate-500">
                    Nenhum relatório foi criado para este projeto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
