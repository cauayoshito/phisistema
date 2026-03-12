"use server";

import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect";

import { requireUser } from "@/services/auth.service";
import { getOrganizationMemberships } from "@/services/membership.service";
import {
  addProjectParticipant,
  getProjectByIdForUser,
  removeProjectParticipant,
} from "@/services/projects.service";

function redirectWithMessage(
  projectId: string,
  params: { success?: string; error?: string }
): never {
  const search = new URLSearchParams();
  search.set("tab", "overview");

  if (params.success) search.set("success", params.success);
  if (params.error) search.set("error", params.error);

  redirect(`/dashboard/projects/${projectId}?${search.toString()}`);
}

function normalizeRole(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export async function addProjectParticipantAction(formData: FormData) {
  const user = (await requireUser()) as any;
  const safeUserId = user?.id ?? user?.user?.id;

  const projectId = String(formData.get("project_id") ?? "").trim();
  const participantUserId = String(formData.get("user_id") ?? "").trim();
  const role = normalizeRole(formData.get("role"));

  if (!safeUserId || !projectId) {
    redirect("/dashboard/projects");
  }

  if (!participantUserId || !role) {
    redirectWithMessage(projectId, {
      error: "Selecione o membro e o papel do participante.",
    });
  }

  if (!["CONSULTANT", "INVESTOR", "VIEWER"].includes(role)) {
    redirectWithMessage(projectId, {
      error: "O papel selecionado para o participante é inválido.",
    });
  }

  try {
    const project = await getProjectByIdForUser(projectId, safeUserId);

    if (!project) {
      redirectWithMessage(projectId, {
        error: "Você não tem acesso a este projeto.",
      });
    }

    const memberships = await getOrganizationMemberships(safeUserId);
    const orgMembership = memberships.find(
      (membership) => membership.organization_id === project.organization_id
    );

    if (!orgMembership) {
      redirectWithMessage(projectId, {
        error:
          "Você não tem permissão para gerenciar participantes deste projeto.",
      });
    }

    await addProjectParticipant(
      projectId,
      participantUserId,
      role as "CONSULTANT" | "INVESTOR" | "VIEWER",
      safeUserId
    );

    redirectWithMessage(projectId, {
      success: "Participante adicionado ao projeto com sucesso.",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithMessage(projectId, {
      error: "Não foi possível adicionar o participante.",
    });
  }
}

export async function removeProjectParticipantAction(formData: FormData) {
  const user = (await requireUser()) as any;
  const safeUserId = user?.id ?? user?.user?.id;

  const projectId = String(formData.get("project_id") ?? "").trim();
  const participantUserId = String(formData.get("user_id") ?? "").trim();

  if (!safeUserId || !projectId) {
    redirect("/dashboard/projects");
  }

  if (!participantUserId) {
    redirectWithMessage(projectId, {
      error: "Participante inválido para remoção.",
    });
  }

  try {
    const project = await getProjectByIdForUser(projectId, safeUserId);

    if (!project) {
      redirectWithMessage(projectId, {
        error: "Você não tem acesso a este projeto.",
      });
    }

    const memberships = await getOrganizationMemberships(safeUserId);
    const orgMembership = memberships.find(
      (membership) => membership.organization_id === project.organization_id
    );

    if (!orgMembership) {
      redirectWithMessage(projectId, {
        error:
          "Você não tem permissão para gerenciar participantes deste projeto.",
      });
    }

    await removeProjectParticipant(projectId, participantUserId);

    redirectWithMessage(projectId, {
      success: "Participante removido do projeto com sucesso.",
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirectWithMessage(projectId, {
      error: "Não foi possível remover o participante.",
    });
  }
}
