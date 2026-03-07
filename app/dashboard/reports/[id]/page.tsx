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

  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
  }).format(d);
}

function formatDateTime(value: unknown) {
  if (!value) return "-";

  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(d);
}

function fallbackTitle(title: string | null, start: unknown, end: unknown) {
  if (title && title.trim()) return title;
  return `Relatório ${formatDate(start)} → ${formatDate(end)}`;
}

function fallback(value: unknown, fb = "-") {
  const s = String(value ?? "").trim();
  return s.length ? s : fb;
}

function shortId(value: unknown) {
  const s = String(value ?? "").trim();
  if (!s) return "-";
  if (s.length <= 16) return s;
  return `${s.slice(0, 8)}...${s.slice(-4)}`;
}

function reportStatusLabel(value: unknown) {
  const key = String(value ?? "")
    .trim()
    .toUpperCase() as ReportStatus;
  return REPORT_STATUS_LABEL[key] ?? fallback(value);
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
  const statusLabel = reportStatusLabel(status);

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

          <p className="mt-1 text-sm text-slate-600">
            Projeto:{" "}
            <span className="font-medium">
              {project?.name ?? "Projeto vinculado"}
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
              className="cursor-not-allowed rounded bg-slate-300 px-4 py-2 text-sm text-white"
              title="Somente relatórios em rascunho podem ser editados."
            >
              Digitar relatório
            </span>
          )}

          {canSubmit && (
            <form action={safeSubmit.bind(null, reportId)}>
              <button
                className="rounded bg-emerald-600 px-4 py-2 text-sm text-white"
                type="submit"
              >
                Enviar
              </button>
            </form>
          )}

          {canReopen && (
            <form action={safeReopen.bind(null, reportId)}>
              <button
                className="rounded bg-slate-800 px-4 py-2 text-sm text-white"
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

        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <div className="text-xs text-slate-500">Identificador</div>
            <div className="font-medium text-slate-900">
              {shortId(report.id)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Criado em</div>
            <div>{formatDateTime(report.created_at)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Versão atual</div>
            <div>{fallback(report.current_version)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Enviado em</div>
            <div>{formatDateTime(report.submitted_at)}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Aprovado em</div>
            <div>{formatDateTime(report.approved_at)}</div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Versão atual</h2>
        <p className="text-xs text-slate-600">
          Informações da versão ativa do relatório.
        </p>

        {!currentVersion ? (
          <div className="mt-3 text-sm text-slate-500">
            Nenhuma versão encontrada.
          </div>
        ) : (
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
            <div>
              <div className="text-xs text-slate-500">Versão</div>
              <div>v{String(currentVersion.version_number)}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Status</div>
              <div>{reportStatusLabel(currentVersion.status)}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Criado em</div>
              <div>{formatDateTime(currentVersion.created_at)}</div>
            </div>

            <div>
              <div className="text-xs text-slate-500">Criado por</div>
              <div className="text-slate-700">
                {shortId(currentVersion.created_by)}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
