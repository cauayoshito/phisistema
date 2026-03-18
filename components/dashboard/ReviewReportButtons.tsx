"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveReportAction,
  returnReportAction,
  recommendApprovalAction,
} from "@/app/actions/report.actions";

type Props = {
  reportId: string;
  roleLabel?: string; // "INVESTOR" | "CONSULTANT"
};

type ModalMode = "approve" | "return" | null;

export default function ReviewReportButtons({ reportId, roleLabel }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<ModalMode>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isReturn = mode === "return";
  const isConsultantRecommend =
    mode === "approve" && roleLabel === "CONSULTANT";
  const requiresComment = isReturn || isConsultantRecommend;
  const canSubmit = requiresComment ? comment.trim().length > 0 : true;

  function close() {
    setMode(null);
    setComment("");
    setError(null);
  }

  function handleSubmit() {
    if (!mode) return;
    if (requiresComment && !comment.trim()) {
      setError(
        isReturn
          ? "Informe o motivo da devolução para que a organização saiba o que corrigir."
          : "Descreva seu parecer para que o financiador possa avaliar sua recomendação."
      );
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        if (mode === "approve" && roleLabel === "CONSULTANT") {
          // Consultor: recomenda (NÃO muda status)
          await recommendApprovalAction(reportId, comment.trim());
        } else if (mode === "approve") {
          // Investor: aprova definitivamente
          await approveReportAction(reportId, comment.trim() || "Aprovado.");
        } else {
          // Ambos podem devolver
          await returnReportAction(reportId, comment.trim());
        }
        close();
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Falha ao processar avaliação."
        );
      }
    });
  }

  return (
    <>
      {/* Botões de trigger */}
      <button
        type="button"
        onClick={() => setMode("approve")}
        className="rounded bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        {roleLabel === "CONSULTANT" ? "Recomendar aprovação" : "Aprovar"}
      </button>

      <button
        type="button"
        onClick={() => setMode("return")}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
      >
        Devolver p/ ajustes
      </button>

      {/* Modal inline */}
      {mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {isReturn
                  ? "Devolver relatório"
                  : roleLabel === "CONSULTANT"
                  ? "Recomendar aprovação"
                  : "Aprovar relatório"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {isReturn
                  ? "Explique o que precisa ser corrigido. A organização verá este comentário."
                  : roleLabel === "CONSULTANT"
                  ? "Adicione seu parecer. O financiador verá sua recomendação."
                  : "Adicione uma observação (opcional). A organização será notificada da aprovação."}
              </p>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {isReturn
                    ? "Motivo da devolução *"
                    : isConsultantRecommend
                    ? "Seu parecer *"
                    : "Observação (opcional)"}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder={
                    isReturn
                      ? "Ex: O relatório financeiro está incompleto. Faltam comprovantes do mês de fevereiro."
                      : isConsultantRecommend
                      ? "Ex: O relatório atende os critérios de prestação de contas. Os documentos financeiros estão completos e os resultados são consistentes com as metas definidas."
                      : "Ex: Relatório bem estruturado. Parabéns pela execução."
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={isPending}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending || !canSubmit}
                  className={[
                    "rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50",
                    isReturn
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-emerald-600 hover:bg-emerald-700",
                  ].join(" ")}
                >
                  {isPending
                    ? "Processando..."
                    : isReturn
                    ? "Confirmar devolução"
                    : roleLabel === "CONSULTANT"
                    ? "Confirmar recomendação"
                    : "Confirmar aprovação"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
