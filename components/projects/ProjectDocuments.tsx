"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  deleteProjectDocumentAction,
  getProjectDocumentSignedUrlAction,
  listProjectDocumentsAction,
  uploadProjectDocumentAction,
} from "@/app/actions/project-documents.actions";

type Props = {
  projectId: string;
  projectType: string; // pode ser enum/string mesmo
};

type DocRow = {
  id: string;
  project_id: string;
  organization_id: string;
  uploaded_by: string | null;
  doc_type: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  file_path: string | null;
  created_at: string;
};

const DOC_TYPES = [
  { value: "CNPJ", label: "CNPJ" },
  { value: "ESTATUTO", label: "Estatuto Social" },
  { value: "ATA_DIRETORIA", label: "Ata de eleição da diretoria" },
  { value: "PROJETO_PROPOSTA", label: "Projeto/Proposta" },
  { value: "ORCAMENTO", label: "Orçamento" },
  { value: "COMPROVANTE_BANCARIO", label: "Comprovantes bancários" },
];

function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i++;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export default function ProjectDocuments({ projectId, projectType }: Props) {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [docType, setDocType] = useState<string>("CNPJ");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const checklist = useMemo(() => {
    // você pode sofisticar por projectType depois.
    // por enquanto, mantém útil e "MVP completo".
    return ["Projeto/Proposta", "Orçamento", "Documentos da instituição"];
  }, []);

  async function refresh() {
    const res = await listProjectDocumentsAction(projectId);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    setDocs((res.data?.documents ?? []) as DocRow[]);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  function onUpload() {
    setMsg("");

    if (!file) {
      setMsg("Selecione um arquivo primeiro.");
      return;
    }

    const fd = new FormData();
    fd.set("project_id", projectId);
    fd.set("doc_type", docType);
    fd.set("file", file);

    startTransition(async () => {
      const res = await uploadProjectDocumentAction(fd);

      if (!res.ok) {
        setMsg(res.error || "Falha no upload.");
        return;
      }

      setMsg("Upload concluído ✅");
      setFile(null);
      // limpa o input visualmente (hack simples)
      const input = document.getElementById(
        "project-doc-file"
      ) as HTMLInputElement | null;
      if (input) input.value = "";

      await refresh();
    });
  }

  function onOpen(doc: DocRow) {
    setMsg("");

    const fd = new FormData();
    fd.set("project_id", projectId);
    fd.set("document_id", doc.id);

    startTransition(async () => {
      const res = await getProjectDocumentSignedUrlAction(fd);

      if (!res.ok) {
        setMsg(res.error || "Falha ao abrir arquivo.");
        return;
      }

      const url = res.data?.url;
      if (!url) {
        setMsg("URL não retornada.");
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  function onDelete(doc: DocRow) {
    setMsg("");

    const fd = new FormData();
    fd.set("project_id", projectId);
    fd.set("document_id", doc.id);

    startTransition(async () => {
      const res = await deleteProjectDocumentAction(fd);

      if (!res.ok) {
        setMsg(res.error || "Falha ao remover.");
        return;
      }

      setMsg("Removido ✅");
      await refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-lg font-semibold">Checklist de Documentos</h3>
        <p className="text-sm text-slate-600">
          Baseado no tipo do projeto: <b>{projectType || "—"}</b>
        </p>

        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
          {checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h3 className="text-lg font-semibold">Uploads</h3>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Tipo do documento
            </label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Arquivo</label>
            <input
              id="project-doc-file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onUpload}
            disabled={isPending}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {isPending ? "Enviando..." : "Enviar"}
          </button>

          {msg ? <span className="text-sm text-slate-700">{msg}</span> : null}
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-semibold">Arquivos enviados</h4>

          {docs.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Nenhum arquivo enviado.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-lg border">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Arquivo</th>
                    <th className="px-3 py-2">Tamanho</th>
                    <th className="px-3 py-2">Enviado em</th>
                    <th className="px-3 py-2 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="px-3 py-2">{d.doc_type}</td>
                      <td className="px-3 py-2">{d.file_name ?? "—"}</td>
                      <td className="px-3 py-2">{formatBytes(d.size_bytes)}</td>
                      <td className="px-3 py-2">
                        {d.created_at
                          ? new Date(d.created_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onOpen(d)}
                            className="rounded-md border px-3 py-1 text-xs hover:bg-slate-50"
                          >
                            Abrir
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(d)}
                            className="rounded-md border px-3 py-1 text-xs hover:bg-slate-50"
                          >
                            Remover
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
