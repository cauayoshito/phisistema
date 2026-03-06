// components/projects/ProjectReports.tsx

import Link from "next/link";

type ReportLike = {
  id: string;
  status: string;
  period_start: string;
  period_end: string;
};

type Props = {
  projectId: string;
  reports: ReportLike[];
  createReportAction: (formData: FormData) => Promise<void>;
};

export default function ProjectReports({
  projectId,
  reports,
  createReportAction,
}: Props) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Relatórios</h2>
          <p className="mt-1 text-sm text-slate-600">
            Prestação de contas por período.
          </p>
        </div>

        <form action={createReportAction} className="shrink-0">
          <input type="hidden" name="project_id" value={projectId} />
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Criar relatório
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-white text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {reports.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-900">
                  {r.period_start} - {r.period_end}
                </td>
                <td className="px-4 py-3 text-slate-700">{r.status}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/dashboard/reports/${r.id}`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            ))}

            {reports.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-slate-500">
                  Nenhum relatório criado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
