import Link from "next/link";
import { createReportAction } from "@/app/actions/report.actions";
import { listReportsByProject } from "@/services/reports.service";
import { REPORT_STATUS_LABEL, type ReportStatus } from "@/lib/status";

type Props = {
  projectId: string;
  userId: string;
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  return String(iso).slice(0, 10);
}

function fallbackTitle(title: string | null, start: string, end: string) {
  if (title && title.trim()) return title;
  return `Relatório ${formatDate(start)} → ${formatDate(end)}`;
}

export default async function ProjectReports({ projectId, userId }: Props) {
  const reports = await listReportsByProject(projectId, userId);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <div className="flex items-center justify-between">
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
          {/* project fixo */}
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
            />
          </div>

          <div className="sm:col-span-1">
            <label className="mb-1 block text-xs text-slate-600">Fim</label>
            <input
              name="period_end"
              type="date"
              className="w-full rounded border px-3 py-2"
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
        <table className="w-full text-left text-sm">
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
            {reports.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">
                  {fallbackTitle(
                    r.title ?? null,
                    String(r.period_start),
                    String(r.period_end)
                  )}
                </td>
                <td className="px-4 py-3">
                  {formatDate(String(r.period_start))} →{" "}
                  {formatDate(String(r.period_end))}
                </td>
                <td className="px-4 py-3">
                  {REPORT_STATUS_LABEL[r.status as ReportStatus] ??
                    String(r.status)}
                </td>
                <td className="px-4 py-3">
                  {String(r.created_at).slice(0, 19)}
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
      </section>
    </section>
  );
}
