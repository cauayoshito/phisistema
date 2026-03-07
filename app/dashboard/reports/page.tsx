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

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(d);
}

function formatDateTime(iso: string | null | undefined) {
  if (!iso) return "-";

  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
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
  if (s === "APPROVED") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
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
          <h1 className="text-2xl font-bold text-slate-900">Relatórios</h1>
          <p className="text-sm text-slate-600">
            Crie e gerencie relatórios vinculados aos projetos da sua
            organização.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar
        </Link>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">Criar relatório</h2>
          <p className="mt-1 text-sm text-slate-600">
            Selecione o projeto e o período para iniciar um novo relatório.
          </p>
        </div>

        <form action={createReportAction} className="grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Projeto
            </label>
            <select
              name="project_id"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
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
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Título (opcional)
            </label>
            <input
              name="title"
              placeholder="Ex: Relatório Mensal"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Tipo
            </label>
            <select
              name="period_type"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              defaultValue="MONTHLY"
            >
              <option value="MONTHLY">Mensal</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Início
            </label>
            <input
              name="period_start"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              defaultValue={defaults.start}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Fim
            </label>
            <input
              name="period_end"
              type="date"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              defaultValue={defaults.end}
              required
            />
          </div>

          <div className="sm:col-span-6">
            <button
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              type="submit"
            >
              Criar relatório
            </button>
          </div>
        </form>

        {projects.length === 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Você não tem projetos visíveis para criar relatórios no momento.
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="font-semibold text-slate-900">Relatórios criados</h2>
          <p className="mt-1 text-sm text-slate-600">
            Acompanhe, duplique ou exclua relatórios existentes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                  Relatório
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                  Projeto
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                  Período
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">
                  Criado em
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-right">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {(reports ?? []).map((r: any) => {
                const status = String(r.status ?? "");
                const canDelete = status === "DRAFT";
                const statusLabel =
                  REPORT_STATUS_LABEL[r.status as ReportStatus] ?? status;

                return (
                  <tr
                    key={r.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-slate-900">
                        {fallbackTitle(r.title, r.period_start, r.period_end)}
                      </div>
                    </td>

                    <td className="px-4 py-4 align-top text-slate-600">
                      {r.project_label ?? "Projeto vinculado"}
                    </td>

                    <td className="px-4 py-4 align-top text-slate-600">
                      {formatDate(r.period_start)} → {formatDate(r.period_end)}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(
                          status
                        )}`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    <td className="px-4 py-4 align-top text-slate-600">
                      {formatDateTime(r.created_at)}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/reports/${r.id}`}
                          className="rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
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
                              ? "Só é possível excluir quando o relatório está em rascunho."
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
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Nenhum relatório encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
