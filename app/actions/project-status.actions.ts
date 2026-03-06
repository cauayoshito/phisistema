"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PROJECT_STATUS, type ProjectStatus } from "@/lib/status";
import { createClient } from "@/lib/supabase/server";
import { readAndValidateProjectId, readRequiredString } from "@/lib/validation/ids";

function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUS as readonly string[]).includes(value);
}

function getReason(nextStatus: ProjectStatus, formData: FormData): string | null {
  if (nextStatus === "DEVOLVIDO") {
    return readRequiredString(formData, "reason");
  }

  if (nextStatus === "ENVIADO") return "envio via detalhes";
  if (nextStatus === "EM_ANALISE") return "inicio analise via detalhes";
  if (nextStatus === "APROVADO") return "aprovado via detalhes";
  return "atualizacao via detalhes";
}

export async function changeProjectStatusAction(formData: FormData) {
  const projectId = readAndValidateProjectId(formData);
  const nextStatusRaw = readRequiredString(formData, "next_status").toUpperCase();

  if (!isProjectStatus(nextStatusRaw)) {
    redirect(
      `/dashboard/projects/${projectId}?error=${encodeURIComponent("next_status invalido.")}`,
    );
  }

  const reason = getReason(nextStatusRaw, formData);
  const supabase = createClient();

  const { error } = await supabase.rpc("phi_set_project_status", {
    p_project_id: projectId,
    p_new_status: nextStatusRaw,
    p_reason: reason,
  });

  if (error) {
    redirect(`/dashboard/projects/${projectId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${projectId}?success=1`);
}

