"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/services/auth.service";

function safeText(v: unknown) {
  return String(v ?? "").trim();
}

function toNumberLoose(input: string) {
  // aceita "1.234,56" / "1234.56" / "1234"
  const cleaned = input
    .replace(/\s/g, "")
    .replace(/[R$\u00A0]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export async function updateProjectFinancialAction(formData: FormData) {
  const projectId = safeText(formData.get("project_id"));
  const totalValueRaw = safeText(formData.get("total_value"));
  const raisedValueRaw = safeText(formData.get("raised_value"));

  if (!projectId) {
    redirect(
      `/dashboard/projects?error=${encodeURIComponent(
        "Não foi possível identificar o projeto."
      )}`
    );
  }

  const totalValue = toNumberLoose(totalValueRaw);
  const raisedValue = toNumberLoose(raisedValueRaw);

  const percent =
    totalValue && totalValue > 0 && raisedValue != null
      ? Math.max(0, Math.min(100, (raisedValue / totalValue) * 100))
      : 0;

  const financial = {
    total_value_raw: totalValueRaw,
    raised_value_raw: raisedValueRaw,
    total_value: totalValue,
    raised_value: raisedValue,
    raised_percent: Number(percent.toFixed(2)),
    updated_at: new Date().toISOString(),
  };

  const supabase = createClient() as any;
  await requireUser();

  const { error } = await supabase
    .from("projects")
    .update({ financial_data: financial })
    .eq("id", projectId);

  if (error) {
    redirect(
      `/dashboard/projects/${projectId}?tab=financial&error=${encodeURIComponent(
        "Não foi possível salvar os dados financeiros."
      )}`
    );
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  redirect(
    `/dashboard/projects/${projectId}?tab=financial&success=${encodeURIComponent(
      "Dados financeiros salvos com sucesso."
    )}`
  );
}
