import Link from "next/link";
import { requireUser } from "@/services/auth.service";
import {
  listProjectsForUserReports,
  listReportsForUser,
} from "@/services/reports.service";
import {
  createReportAction,
  duplicateReportAction,
  deleteReportAction,
} from "@/app/actions/report.actions";
import ConfirmDeleteButton from "./ConfirmDeleteButton";
import { REPORT_STATUS_LABEL, type ReportStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null | undefined) {
  if (!iso) return "-";
  return String(iso).slice(0, 10);
}

function fallbackTitle(
  title: string | null,
  periodStart: string,
  periodEnd: string
) {
  if (title && title.trim()) return title;
  return `Relatório ${formatDate(periodStart)} → ${formatDate(periodEnd)}`;
}

function toIsoDateLocal(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentMonthDefaults() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  return {
    start: toIsoDateLocal(firstDay),
    end: toIsoDateLocal(lastDay),
  };
}

function badgeClass(status: string) {
  const s = status.toUpperCase();
  if (s === "DRAFT") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "SUBMITTED") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "APPROVED")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "RETURNED") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

async function doDuplicate(reportId: string) {
  "use server";
  await duplicateReportAction(reportId);
}

async function doDelete(reportId: string) {
  "use server";
  await deleteReportAction(reportId);
}

export default async function DashboardReportsPage() {
  const user = await requireUser();

  const [projects, reports] = await Promise.all([
    listProjectsForUserReports(user.id),
    listReportsForUser(user.id),
  ]);

  const defaults = getCurrentMonthDefaults();

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-slate-600">
            Crie e gerencie relatórios vinculados a projetos da sua organização.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar
        </Link>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Criar relatório</h2>

        <form
          action={createReportAction}
          className="mt-3 grid gap-3 sm:grid-cols-6"
        >
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs text-slate-600">Projeto</label>
            <select
              name="project_id"
              className="w-full rounded border px-3 py-2"
              required
            >
              <option value="">Selecione...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

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

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-slate-600">Tipo</label>
            <select
              name="period_type"
              className="w-full rounded border px-3 py-2"
              defaultValue="MONTHLY"
            >
              <option value="MONTHLY">Mensal</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-slate-600">Início</label>
            <input
              name="period_start"
              type="date"
              className="w-full rounded border px-3 py-2"
              defaultValue={defaults.start}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-slate-600">Fim</label>
            <input
              name="period_end"
              type="date"
              className="w-full rounded border px-3 py-2"
              defaultValue={defaults.end}
            />
          </div>

          <button
            className="rounded bg-blue-600 px-4 py-2 text-white sm:col-span-6"
            type="submit"
          >
            Criar relatório
          </button>
        </form>

        {projects.length === 0 && (
          <p className="mt-3 text-sm text-amber-700">
            Você não tem projetos visíveis para criar relatórios. Verifique sua
            organização/permissões.
          </p>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Projeto</th>
              <th className="px-4 py-3">Período</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Criado em</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {(reports ?? []).map((r: any) => {
              const status = String(r.status);
              const canDelete = status === "DRAFT";
              const statusLabel =
                REPORT_STATUS_LABEL[r.status as ReportStatus] ?? status;

              return (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">
                    {fallbackTitle(r.title, r.period_start, r.period_end)}
                  </td>
                  <td className="px-4 py-3">
                    {r.project_label ?? r.project_id}
                  </td>
                  <td className="px-4 py-3">
                    {formatDate(r.period_start)} → {formatDate(r.period_end)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${badgeClass(
                        status
                      )}`}
                    >
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {String(r.created_at).slice(0, 19)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/dashboard/reports/${r.id}`}
                        className="rounded bg-slate-900 px-3 py-1.5 text-xs text-white hover:opacity-90"
                      >
                        Abrir
                      </Link>

                      <form action={doDuplicate.bind(null, r.id)}>
                        <button
                          className="text-sm text-slate-700 hover:underline"
                          type="submit"
                        >
                          Duplicar
                        </button>
                      </form>

                      <ConfirmDeleteButton
                        action={doDelete.bind(null, r.id)}
                        disabled={!canDelete}
                        title={
                          !canDelete
                            ? "Só é possível excluir quando status = DRAFT"
                            : "Excluir relatório"
                        }
                      />
                    </div>
                  </td>
                </tr>
              );
            })}

            {(reports ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-slate-500">
                  Nenhum relatório encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
