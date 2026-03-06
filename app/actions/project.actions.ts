// app/actions/project.actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/services/auth.service";
import { logAction } from "@/services/audit.service";
import { createProject } from "@/services/projects.service";

function enc(v: string) {
  return encodeURIComponent(v);
}

const ALLOWED_TYPES = new Set([
  "RECURSOS_PROPRIOS",
  "INCENTIVADO",
  "RECURSOS_PUBLICOS",
]);

export async function createProjectAction(formData: FormData) {
  try {
    const user = await requireUser();

    const title = String(formData.get("title") ?? "").trim();
    const projectType = String(formData.get("project_type") ?? "")
      .trim()
      .toUpperCase();
    const status = String(formData.get("status") ?? "DRAFT")
      .trim()
      .toUpperCase();
    const descriptionRaw = String(formData.get("description") ?? "").trim();

    // CHANGE: org determinística vinda do form
    const organization_id =
      String(formData.get("organization_id") ?? "").trim() || undefined;

    if (!title) {
      redirect(
        `/dashboard/projects/new?error=${enc("Informe o nome do projeto.")}`
      );
    }

    if (!ALLOWED_TYPES.has(projectType)) {
      redirect(
        `/dashboard/projects/new?error=${enc("Tipo de projeto inválido.")}`
      );
    }

    if (!organization_id) {
      redirect(
        `/dashboard/projects/new?error=${enc(
          "Sem organização selecionada/vinculada. Volte e selecione uma organização."
        )}`
      );
    }

    const project = await createProject(
      {
        title,
        project_type: projectType,
        status,
        description: descriptionRaw || null,
        organization_id, // CHANGE
      },
      user.id
    );

    await logAction(
      "create_project",
      "project",
      project.id,
      { title, project_type: projectType, status, organization_id },
      user.id
    );

    revalidatePath("/dashboard/projects");
    redirect(`/dashboard/projects/${project.id}?tab=overview`);
  } catch (e: any) {
    const msg = e?.message ? String(e.message) : "Erro ao criar projeto.";
    redirect(`/dashboard/projects/new?error=${enc(msg)}`);
  }
}
