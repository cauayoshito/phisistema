"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string; details?: unknown };

function asString(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

export async function saveProjectPlanAction(
  formData: FormData
): Promise<Result> {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr)
      return { ok: false, error: "Falha ao ler sessão.", details: userErr };
    if (!user) return { ok: false, error: "Não autenticado." };

    const projectId = asString(formData.get("project_id")).trim();
    const objective = asString(formData.get("objective")).trim();

    if (!projectId) return { ok: false, error: "project_id é obrigatório." };

    // Ajuste aqui conforme seu modelo (jsonb)
    const planData = {
      objective_general: objective,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("projects")
      .update({ plan_data: planData })
      .eq("id", projectId);

    if (error)
      return { ok: false, error: "Falha ao salvar plano.", details: error };

    revalidatePath(`/dashboard/projects/${projectId}?tab=plan`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: "Erro inesperado.", details: e };
  }
}
