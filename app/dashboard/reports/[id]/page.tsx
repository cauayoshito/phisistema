import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/services/auth.service";
import { getReportDetail } from "@/services/reports.service";
import {
  submitReportAction,
  reopenReportToDraftAction,
} from "@/app/actions/report.actions";
import { REPORT_STATUS_LABEL, type ReportStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

function formatDate(value: unknown) {
  if (!value) return "-";
  const s = String(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

function fallbackTitle(title: string | null, start: unknown, end: unknown) {
  if (title && title.trim()) return title;
  return `Relatório ${formatDate(start)} → ${formatDate(end)}`;
}

async function safeSubmit(reportId: string) {
  "use server";
  await submitReportAction(reportId);
}

async function safeReopen(reportId: string) {
  "use server";
  await reopenReportToDraftAction(reportId);
}

export default async function ReportDetailPage({ params }: Props) {
  const user = await requireUser();

  const reportId = params.id;
  const detail = await getReportDetail(reportId, user.id).catch(() => null);
  if (!detail?.report) notFound();

  const { report, project, currentVersion } = detail;

  const status = String(report.status ?? "");
  const statusLabel = REPORT_STATUS_LABEL[status as ReportStatus] ?? status;

  const canSubmit = status === "DRAFT";
  const canReopen = status !== "DRAFT";
  const canEdit = status === "DRAFT";

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {fallbackTitle(
              report.title ?? null,
              report.period_start,
              report.period_end
            )}
          </h1>

          <p className="text-sm text-slate-600 mt-1">
            Projeto:{" "}
            <span className="font-medium">
              {project?.name ?? String(report.project_id)}
            </span>
          </p>

          <p className="text-sm text-slate-600">
            Período:{" "}
            <span className="font-medium">
              {formatDate(report.period_start)} →{" "}
              {formatDate(report.period_end)}
            </span>
          </p>

          <p className="text-sm text-slate-600">
            Status: <span className="font-semibold">{statusLabel}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/reports"
            className="text-sm text-blue-600 hover:underline"
          >
            Voltar
          </Link>

          {canEdit ? (
            <Link
              href={`/dashboard/reports/${reportId}/edit`}
              className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:opacity-90"
              title="Digitar relatório"
            >
              Digitar relatório
            </Link>
          ) : (
            <span
              className="rounded bg-slate-300 px-4 py-2 text-sm text-white cursor-not-allowed"
              title="Somente relatórios em DRAFT podem ser editados."
            >
              Digitar relatório
            </span>
          )}

          {canSubmit && (
            <form action={safeSubmit.bind(null, reportId)}>
              <button
                className="rounded bg-emerald-600 px-4 py-2 text-white text-sm"
                type="submit"
              >
                Enviar
              </button>
            </form>
          )}

          {canReopen && (
            <form action={safeReopen.bind(null, reportId)}>
              <button
                className="rounded bg-slate-800 px-4 py-2 text-white text-sm"
                type="submit"
              >
                Reabrir p/ rascunho
              </button>
            </form>
          )}
        </div>
      </header>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Dados</h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <div className="text-xs text-slate-500">Report ID</div>
            <div className="font-mono break-all">{String(report.id)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Criado em</div>
            <div>{String(report.created_at ?? "-").slice(0, 19)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">
              Current version (reports)
            </div>
            <div>{String(report.current_version ?? "-")}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Submitted at</div>
            <div>
              {report.submitted_at
                ? String(report.submitted_at).slice(0, 19)
                : "-"}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Approved at</div>
            <div>
              {report.approved_at
                ? String(report.approved_at).slice(0, 19)
                : "-"}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Versão atual</h2>
        <p className="text-xs text-slate-600">
          Vem de report_versions (se existir e estiver populando).
        </p>

        {!currentVersion ? (
          <div className="mt-3 text-sm text-slate-500">
            Nenhuma versão encontrada.
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-4 text-sm">
            <div>
              <div className="text-xs text-slate-500">version_number</div>
              <div>v{String(currentVersion.version_number)}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">status</div>
              <div>{String(currentVersion.status ?? "-")}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">created_at</div>
              <div>
                {currentVersion.created_at
                  ? String(currentVersion.created_at).slice(0, 19)
                  : "-"}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500">created_by</div>
              <div className="font-mono text-xs break-all">
                {String(currentVersion.created_by ?? "-")}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
