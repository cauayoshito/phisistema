import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/services/auth.service";
import { getUserContext } from "@/services/membership.service";
import { getPrimaryRole } from "@/lib/roles";
import { getReportDetail } from "@/services/reports.service";
import {
  submitReportAction,
  reopenReportToDraftAction,
  approveReportAction,
  returnReportAction,
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

async function safeApprove(reportId: string) {
  "use server";
  await approveReportAction(reportId, "Aprovado pelo financiador.");
}

async function safeReturn(reportId: string) {
  "use server";
  await returnReportAction(reportId, "Devolvido para ajustes.");
}

export default async function ReportDetailPage({ params }: Props) {
  const user = await requireUser();

  let role: ReturnType<typeof getPrimaryRole> = "ORG";
  try {
    const ctx = await getUserContext(user.id);
    role = getPrimaryRole(ctx);
  } catch {
    // fallback ORG
  }

  const reportId = params.id;
  const detail = await getReportDetail(reportId, user.id).catch(() => null);
  if (!detail?.report) notFound();

  const { report, project, currentVersion } = detail;

  const status = String(report.status ?? "")
    .trim()
    .toUpperCase();
  const statusLabel = reportStatusLabel(status);

  const isOrg = role === "ORG";
  const isReviewer = role === "INVESTOR" || role === "CONSULTANT";

  const canEdit = status === "DRAFT" && isOrg;
  const canSubmit = status === "DRAFT" && isOrg;
  const canReopen = status === "RETURNED" && isOrg;
  const canApprove = status === "SUBMITTED" && isReviewer;
  const canReturn = status === "SUBMITTED" && isReviewer;

  const isLockedForOrg =
    isOrg &&
    (status === "SUBMITTED" || status === "APPROVED" || status === "RETURNED");

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-900 sm:text-3xl">
            {fallbackTitle(
              report.title ?? null,
              report.period_start,
              report.period_end
            )}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
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

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/reports"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Voltar
          </Link>

          {canEdit && (
            <Link
              href={`/dashboard/reports/${reportId}/edit`}
              className="rounded bg-slate-900 px-4 py-2 text-sm text-white hover:opacity-90"
            >
              Digitar relatório
            </Link>
          )}

          {canSubmit && (
            <form action={safeSubmit.bind(null, reportId)}>
              <button
                className="rounded bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700"
                type="submit"
              >
                Enviar
              </button>
            </form>
          )}

          {canReopen && (
            <form action={safeReopen.bind(null, reportId)}>
              <button
                className="rounded bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-900"
                type="submit"
              >
                Reabrir p/ rascunho
              </button>
            </form>
          )}

          {canApprove && (
            <form action={safeApprove.bind(null, reportId)}>
              <button
                className="rounded bg-emerald-600 px-4 py-2 text-sm text-white transition hover:bg-emerald-700"
                type="submit"
              >
                Aprovar
              </button>
            </form>
          )}

          {canReturn && (
            <form action={safeReturn.bind(null, reportId)}>
              <button
                className="rounded bg-amber-600 px-4 py-2 text-sm text-white transition hover:bg-amber-700"
                type="submit"
              >
                Devolver p/ ajustes
              </button>
            </form>
          )}
        </div>
      </header>

      {isLockedForOrg && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Relatório enviado para análise. A edição está temporariamente
          bloqueada até nova devolução ou conclusão da avaliação.
        </div>
      )}

      {!canEdit && !canSubmit && !canReopen && isOrg && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Este relatório está em modo de visualização. Novas edições só ficam
          disponíveis quando ele voltar para rascunho.
        </div>
      )}

      {!canApprove && !canReturn && isReviewer && status !== "DRAFT" && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Nenhuma ação adicional está disponível para este relatório no status
          atual.
        </div>
      )}

      <section className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold text-slate-900">Dados</h2>

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
        <h2 className="font-semibold text-slate-900">Versão atual</h2>
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
