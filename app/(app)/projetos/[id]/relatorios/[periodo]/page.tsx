"use client";

import { FileImage } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  CloudUpload,
  FileText,
  Image,
  Pencil,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { mockProjects } from "../../../mockProjects";
import {
  mockReportDataByPeriod,
  mockReportPeriods,
  type Attachment,
  type ReportPeriod,
} from "../mockReportData";

function toPeriodLabel(period: string) {
  const [quarter, year] = period.split("-");
  return `${quarter?.toUpperCase()} ${year}`;
}

function toDateRange(period: string) {
  const [quarter, year] = period.split("-");
  if (!quarter || !year) return "Período não definido";
  if (quarter === "q1") return `01 Jan ${year} - 31 Mar ${year}`;
  if (quarter === "q2") return `01 Abr ${year} - 30 Jun ${year}`;
  if (quarter === "q3") return `01 Jul ${year} - 30 Set ${year}`;
  if (quarter === "q4") return `01 Out ${year} - 31 Dez ${year}`;
  return period;
}

function statusClasses(status: string) {
  if (status === "Concluído") return "bg-green-100 text-green-800";
  if (status === "Em Andamento") return "bg-yellow-100 text-yellow-800";
  return "bg-slate-100 text-slate-700";
}

function desvioClass(desvio: string) {
  if (desvio.startsWith("+")) return "text-green-600";
  if (desvio.startsWith("-")) return "text-red-600";
  return "text-slate-500";
}

export default function ReportByPeriodPage() {
  const params = useParams<{ id: string; periodo: string }>();
  const inputRef = useRef<HTMLInputElement>(null);

  const projectId = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const period = useMemo(() => {
    const value = params?.periodo;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const projectName = useMemo(() => {
    const project = mockProjects.find((item) => item.id === projectId);
    if (project) return project.nome;
    return `Projeto ${projectId?.toUpperCase() ?? ""}`;
  }, [projectId]);

  const selectedPeriod = useMemo(() => {
    if (period && mockReportPeriods.includes(period as ReportPeriod)) {
      return period as ReportPeriod;
    }
    return null;
  }, [period]);

  const baseData = useMemo(() => {
    if (!selectedPeriod) return null;
    return mockReportDataByPeriod[selectedPeriod];
  }, [selectedPeriod]);

  const [narrative, setNarrative] = useState(baseData?.narrative ?? "");
  const [attachments, setAttachments] = useState<Attachment[]>(
    baseData?.attachments ?? []
  );

  const financeDerived = useMemo(() => {
    if (!baseData) return { executedPercent: 0, saldoFormatado: "R$ 0,00" };
    const executedPercent =
      baseData.finance.orcamentoTotal > 0
        ? Math.round(
            (baseData.finance.executado / baseData.finance.orcamentoTotal) * 100
          )
        : 0;
    const saldoFormatado = baseData.finance.saldo.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return { executedPercent, saldoFormatado };
  }, [baseData]);

  if (!selectedPeriod || !baseData) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">
            Período inválido
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            O período solicitado não está disponível para este projeto.
          </p>
          <Link
            href={`/projetos/${projectId}/relatorios`}
            className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            Voltar para períodos
          </Link>
        </div>
      </div>
    );
  }

  const onSaveDraft = () => {
    console.log("Salvar rascunho (mock):", {
      projectId,
      selectedPeriod,
      narrative,
      attachments,
    });
    alert("Rascunho salvo (mock).");
  };

  const onSendForReview = () => {
    console.log("Enviar para análise (mock):", {
      projectId,
      selectedPeriod,
      narrative,
      attachments,
    });
    alert("Enviado para análise (mock).");
  };

  const onUploadClick = () => {
    inputRef.current?.click();
  };

  const onUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("Upload placeholder (mock):", file.name);
    alert(`Upload simulado: ${file.name}`);
    event.target.value = "";
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Link
              href="/dashboard"
              className="transition-colors hover:text-primary"
            >
              Home
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href="/projetos"
              className="transition-colors hover:text-primary"
            >
              Projetos
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/projetos/${projectId}`}
              className="transition-colors hover:text-primary"
            >
              {projectName}
            </Link>
            <ChevronRight className="size-4" />
            <Link
              href={`/projetos/${projectId}/relatorios`}
              className="transition-colors hover:text-primary"
            >
              Relatórios
            </Link>
            <ChevronRight className="size-4" />
            <span className="font-medium text-slate-900">
              {toPeriodLabel(selectedPeriod)}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Relatório de Atividades - {toPeriodLabel(selectedPeriod)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha os dados de execução física e financeira do período
            selecionado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <CalendarDays className="mr-2 size-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-900">
              {toDateRange(selectedPeriod)}
            </span>
            <Pencil className="ml-2 size-4 text-slate-500" />
          </div>
          <button
            type="button"
            onClick={onSaveDraft}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-50"
          >
            <FileText className="size-4" />
            Salvar Rascunho
          </button>
          <button
            type="button"
            onClick={onSendForReview}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-700"
          >
            <Send className="size-4" />
            Enviar para Análise
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                Execução Física
              </h3>
              <button
                className="text-sm font-medium text-primary transition-colors hover:text-blue-700"
                type="button"
              >
                Adicionar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Atividade Planejada</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-center">% Conc.</th>
                    <th className="px-6 py-3">Comentários</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {baseData.execution.map((row) => (
                    <tr key={row.atividade} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {row.atividade}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses(
                            row.status
                          )}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-slate-900">
                        {row.progresso}%
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {row.comentarios}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                Indicadores de Desempenho
              </h3>
              <button
                className="text-sm font-medium text-primary transition-colors hover:text-blue-700"
                type="button"
              >
                Exportar Dados
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Indicador</th>
                    <th className="px-6 py-3 text-right">Meta</th>
                    <th className="px-6 py-3 text-right">Realizado</th>
                    <th className="px-6 py-3 text-right">Desvio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {baseData.indicators.map((row) => (
                    <tr key={row.indicador} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {row.indicador}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {row.meta}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        {row.realizado}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-medium ${desvioClass(
                          row.desvio
                        )}`}
                      >
                        {row.desvio}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="narrative"
              className="mb-1 block text-sm font-bold text-slate-900"
            >
              Relato Qualitativo
            </label>
            <p className="mb-3 text-xs text-slate-500">
              Descreva os principais desafios, aprendizados e conquistas do
              período.
            </p>
            <div className="relative">
              <textarea
                id="narrative"
                value={narrative}
                maxLength={2000}
                onChange={(event) => setNarrative(event.target.value)}
                placeholder="Digite seu relato aqui..."
                rows={6}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="absolute bottom-2 right-2 rounded bg-white px-2 text-xs text-slate-500">
                {narrative.length} / 2000 caracteres
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 inline-flex rounded-full bg-blue-50 p-2 text-blue-600">
                <Users className="size-5" />
              </div>
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {baseData.audienceCards.familias}
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Famílias
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-2 inline-flex rounded-full bg-purple-50 p-2 text-purple-600">
                <Users className="size-5" />
              </div>
              <p className="text-2xl font-black tracking-tight text-slate-900">
                {baseData.audienceCards.individuos}
              </p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Indivíduos
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                Resumo Financeiro
              </h3>
            </div>
            <div className="space-y-6 p-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Orçamento Total</span>
                  <span className="font-bold text-slate-900">
                    {baseData.finance.orcamentoTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div className="h-2 w-full rounded-full bg-slate-300" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Executado ({financeDerived.executedPercent}%)
                  </span>
                  <span className="font-bold text-primary">
                    {baseData.finance.executado.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${financeDerived.executedPercent}%` }}
                  />
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">
                    Saldo Disponível
                  </span>
                  <span className="text-xl font-black text-green-600">
                    {financeDerived.saldoFormatado}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">Anexos</h3>
            </div>
            <div className="flex flex-1 flex-col gap-4 p-6">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={onUploadChange}
              />
              <button
                type="button"
                onClick={onUploadClick}
                className="flex min-h-[160px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-colors hover:bg-slate-100"
              >
                <div className="mb-3 rounded-full bg-white p-3 shadow-sm">
                  <CloudUpload className="size-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  Clique para upload
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PDF, JPG, PNG até 10MB
                </p>
              </button>

              <div className="space-y-2">
                {attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {file.tipo === "pdf" ? (
                        <FileText className="size-5 text-red-500" />
                      ) : (
                        <FileImage className="size-5 text-blue-500" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {file.nome}
                        </p>
                        <p className="text-xs text-slate-500">{file.tamanho}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((current) =>
                          current.filter((item) => item.id !== file.id)
                        )
                      }
                      className="text-slate-500 transition-colors hover:text-red-600"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
