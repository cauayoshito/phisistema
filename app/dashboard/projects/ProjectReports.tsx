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
  return `Relatório ${formatDate(start)} → ${formatDate(end)}`;
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
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">Relatórios</h2>
          <Link
            href="/dashboard/reports"
            className="text-sm text-blue-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>

        <form
          action={createReportAction}
          className="mt-3 grid gap-3 sm:grid-cols-6"
        >
          <input type="hidden" name="project_id" value={projectId} />

          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs text-slate-600">
              Título (opcional)
            </label>
            <input
              name="title"
              placeholder="Ex: Relatório Mensal"
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs text-slate-600">Tipo</label>
            <select
              name="period_type"
              className="w-full rounded border px-3 py-2"
              defaultValue="MONTHLY"
            >
              <option value="MONTHLY">Mensal</option>
            </select>
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs text-slate-600">Início</label>
            <input
              name="period_start"
              type="date"
              className="w-full rounded border px-3 py-2"
              defaultValue={defaults.start}
              required
            />
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs text-slate-600">Fim</label>
            <input
              name="period_end"
              type="date"
              className="w-full rounded border px-3 py-2"
              defaultValue={defaults.end}
              required
            />
          </div>

          <button
            className="rounded bg-blue-600 px-4 py-2 text-white sm:col-span-6"
            type="submit"
          >
            Criar relatório para este projeto
          </button>
        </form>
      </div>

      <section className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
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
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">
                    {fallbackTitle(r.title, r.period_start, r.period_end)}
                  </td>

                  <td className="px-4 py-3">
                    {formatDate(r.period_start)} → {formatDate(r.period_end)}
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
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}

              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-slate-500">
                    Nenhum relatório ainda. Crie o primeiro acima.
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
