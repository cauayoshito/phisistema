// app/actions/project-documents.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/services/auth.service";

const BUCKET = "project_documents";

type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; details?: unknown };

function asString(v: FormDataEntryValue | null) {
  return typeof v === "string" ? v : "";
}

function isFile(v: FormDataEntryValue | null): v is File {
  return !!v && typeof v !== "string";
}

function sanitizeFilename(name: string) {
  const base = name.split("/").pop()?.split("\\").pop() ?? "arquivo";
  return base
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

async function getProjectOrgId(projectId: string) {
  const supabase = createClient();

  // garante sessão + usuário (seu requireUser NÃO recebe args)
  await requireUser();

  const { data, error } = await supabase
    .from("projects")
    .select("organization_id")
    .eq("id", projectId)
    .single();

  if (error || !data?.organization_id) {
    throw new Error(
      error?.message || "Projeto não encontrado (organization_id)."
    );
  }

  return String(data.organization_id);
}

/**
 * LISTA documentos do projeto
 * (o ProjectDocuments.tsx provavelmente usa isso pra renderizar a lista)
 */
export async function listProjectDocumentsAction(
  projectId: string
): Promise<ActionResult<{ documents: any[] }>> {
  try {
    const supabase = createClient();
    await requireUser();

    if (!projectId) return { ok: false, error: "projectId ausente." };

    const { data, error } = await supabase
      .from("project_documents")
      .select(
        "id, project_id, organization_id, uploaded_by, doc_type, file_name, mime_type, size_bytes, file_path, created_at"
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error)
      return {
        ok: false,
        error: "Falha ao listar documentos.",
        details: error,
      };

    return { ok: true, data: { documents: data ?? [] } };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Erro desconhecido ao listar." };
  }
}

/**
 * UPLOAD real (Storage + insert na tabela project_documents)
 * Espera FormData com:
 * - project_id
 * - doc_type
 * - file
 */
export async function uploadProjectDocumentAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    const user = await requireUser();

    const projectId = asString(formData.get("project_id"));
    const docType = asString(formData.get("doc_type"));
    const fileEntry = formData.get("file");

    if (!projectId) return { ok: false, error: "project_id ausente." };
    if (!docType) return { ok: false, error: "doc_type ausente." };
    if (!isFile(fileEntry)) return { ok: false, error: "Arquivo inválido." };

    const orgId = await getProjectOrgId(projectId);

    const file = fileEntry;
    const safeName = sanitizeFilename(file.name || "arquivo");
    const docId = crypto.randomUUID();

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const filePath = `${orgId}/${projectId}/${docId}_${safeName}`;

    // 1) Storage upload
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return {
        ok: false,
        error: "Falha no upload (Storage).",
        details: uploadError,
      };
    }

    // 2) DB insert
    const { error: insertError } = await supabase
      .from("project_documents")
      .insert({
        id: docId,
        project_id: projectId,
        organization_id: orgId,
        uploaded_by: user.id,
        doc_type: docType,
        file_name: safeName,
        mime_type: file.type || null,
        size_bytes: bytes.byteLength,
        file_path: filePath,
      });

    if (insertError) {
      // rollback storage
      await supabase.storage.from(BUCKET).remove([filePath]);
      return {
        ok: false,
        error: "Falha ao salvar documento (DB).",
        details: insertError,
      };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Erro desconhecido no upload." };
  }
}

/**
 * SIGNED URL para baixar/visualizar
 * Espera FormData com:
 * - project_id
 * - document_id
 */
export async function getProjectDocumentSignedUrlAction(
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = createClient();
    await requireUser();

    const projectId = asString(formData.get("project_id"));
    const documentId = asString(formData.get("document_id"));

    if (!projectId) return { ok: false, error: "project_id ausente." };
    if (!documentId) return { ok: false, error: "document_id ausente." };

    const { data, error } = await supabase
      .from("project_documents")
      .select("file_path")
      .eq("id", documentId)
      .eq("project_id", projectId)
      .single();

    if (error || !data?.file_path) {
      return { ok: false, error: "Documento não encontrado.", details: error };
    }

    const { data: signed, error: signError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(data.file_path, 120); // 2 min

    if (signError || !signed?.signedUrl) {
      return {
        ok: false,
        error: "Falha ao gerar link assinado.",
        details: signError,
      };
    }

    return { ok: true, data: { url: signed.signedUrl } };
  } catch (e: any) {
    return {
      ok: false,
      error: e?.message || "Erro desconhecido ao gerar URL.",
    };
  }
}

/**
 * DELETE: apaga no storage e no banco
 * Espera FormData com:
 * - project_id
 * - document_id
 */
export async function deleteProjectDocumentAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = createClient();
    await requireUser();

    const projectId = asString(formData.get("project_id"));
    const documentId = asString(formData.get("document_id"));

    if (!projectId) return { ok: false, error: "project_id ausente." };
    if (!documentId) return { ok: false, error: "document_id ausente." };

    const { data: doc, error: selError } = await supabase
      .from("project_documents")
      .select("id, file_path")
      .eq("id", documentId)
      .eq("project_id", projectId)
      .single();

    if (selError || !doc?.id) {
      return {
        ok: false,
        error: "Documento não encontrado.",
        details: selError,
      };
    }

    if (doc.file_path) {
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .remove([doc.file_path]);
      if (storageError) {
        return {
          ok: false,
          error: "Falha ao remover do Storage.",
          details: storageError,
        };
      }
    }

    const { error: delError } = await supabase
      .from("project_documents")
      .delete()
      .eq("id", documentId)
      .eq("project_id", projectId);

    if (delError) {
      return { ok: false, error: "Falha ao remover do DB.", details: delError };
    }

    revalidatePath(`/dashboard/projects/${projectId}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Erro desconhecido ao deletar." };
  }
}
