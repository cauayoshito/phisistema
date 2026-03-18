import { createClient } from "@/lib/supabase/server";
import { getInstitutionalEntityByIdForOrganization } from "@/services/institutional-entities.service";
import { getOrganizationMemberships } from "@/services/membership.service";
import type { Database, Json } from "@/types/database";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

type ProjectMembershipInsert = {
  project_id: string;
  user_id: string;
  role: "OWNER" | "CONSULTANT" | "INVESTOR" | "VIEWER";
  created_by?: string | null;
};

export type ProjectParticipantRow = {
  user_id: string;
  role: "OWNER" | "CONSULTANT" | "INVESTOR" | "VIEWER";
  created_at?: string | null;
  full_name: string | null;
  email: string | null;
};

export type CreateProjectInput = {
  title: string;
  description?: string | null;
  project_type: string;
  status?: string;
  organization_id?: string;
  linked_entity_id: string;
  metadata?: Json;
};

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").trim().toUpperCase();
}

function serviceError(base: string, raw: unknown, context: string) {
  const anyRaw = raw as { message?: string } | null;
  const msg =
    raw instanceof Error
      ? raw.message
      : typeof anyRaw?.message === "string"
      ? anyRaw.message
      : typeof raw === "string"
      ? raw
      : JSON.stringify(raw);

  return new Error(`${base} [context: ${context}]: ${msg}`);
}

async function upsertProjectMembership(
  membership: ProjectMembershipInsert
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .schema("public")
    .from("project_memberships")
    .upsert(
      {
        project_id: membership.project_id,
        user_id: membership.user_id,
        role: membership.role,
        created_by: membership.created_by ?? null,
      },
      {
        onConflict: "project_id,user_id",
        ignoreDuplicates: false,
      }
    );

  if (error) {
    throw serviceError(
      "Falha ao vincular participante ao projeto",
      error,
      "project_memberships.upsert"
    );
  }
}

export async function listProjectsForUser(
  userId: string
): Promise<ProjectRow[]> {
  const supabase = createClient();

  const membershipRes = await supabase
    .schema("public")
    .from("project_memberships")
    .select("project_id")
    .eq("user_id", userId);

  if (membershipRes.error) {
    throw serviceError(
      "Falha ao buscar participacoes do projeto",
      membershipRes.error,
      "project_memberships.select"
    );
  }

  const projectIds = Array.from(
    new Set((membershipRes.data ?? []).map((m) => m.project_id).filter(Boolean))
  );

  if (projectIds.length === 0) return [];

  const { data, error } = await supabase
    .schema("public")
    .from("projects")
    .select("*")
    .in("id", projectIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw serviceError("Falha ao listar projetos", error, "projects.select");
  }

  return (data ?? []) as ProjectRow[];
}

export async function getProjectByIdForUser(
  projectId: string,
  userId: string
): Promise<ProjectRow | null> {
  const supabase = createClient();

  const membershipRes = await supabase
    .schema("public")
    .from("project_memberships")
    .select("project_id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipRes.error) {
    throw serviceError(
      "Falha ao validar acesso ao projeto",
      membershipRes.error,
      "project_memberships.accessCheck"
    );
  }

  if (!membershipRes.data) return null;

  const { data, error } = await supabase
    .schema("public")
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    throw serviceError("Erro ao buscar projeto", error, "projects.selectById");
  }

  return (data as ProjectRow | null) ?? null;
}

export async function createProject(
  payload: CreateProjectInput,
  userId?: string
): Promise<ProjectRow> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw serviceError(
      "Usuario nao autenticado",
      authError ?? "Sem user",
      "auth.getUser()"
    );
  }

  const effectiveUserId = userId ?? user.id;
  let organizationId = payload.organization_id?.trim() || null;

  if (!organizationId) {
    const memberships = await getOrganizationMemberships(effectiveUserId);
    const orgAdminMembership = memberships.find(
      (membership) => normalizeRole(membership.role) === "ORG_ADMIN"
    );
    organizationId = orgAdminMembership?.organization_id ?? null;
  }

  if (!organizationId) {
    throw new Error("Nao foi possivel determinar a organizacao do projeto.");
  }

  const linkedEntityId = String(payload.linked_entity_id ?? "").trim();

  if (!linkedEntityId) {
    throw new Error("Selecione um financiador cadastrado para criar o projeto.");
  }

  const linkedEntity = await getInstitutionalEntityByIdForOrganization(
    linkedEntityId,
    organizationId
  );

  if (!linkedEntity) {
    throw new Error(
      "Selecione um financiador cadastrado da organizacao para continuar."
    );
  }

  if (String(linkedEntity.status ?? "").toUpperCase() !== "ACTIVE") {
    throw new Error("O financiador selecionado nao esta ativo para novos projetos.");
  }

  const linkedEntityName = String(linkedEntity.display_name ?? "").trim();
  const linkedEntityType = String(linkedEntity.entity_type ?? "")
    .trim()
    .toLowerCase();

  if (!linkedEntityName || !linkedEntityType) {
    throw new Error(
      "O financiador selecionado nao possui dados suficientes para vincular ao projeto."
    );
  }

  const rpcResponse = await supabase.rpc(
    "create_project_secure" as never,
    {
      p_name: payload.title,
      p_description: payload.description ?? null,
      p_project_type: payload.project_type,
      p_organization_id: organizationId,
      p_linked_entity_id: linkedEntity.id,
      p_linked_entity_name: linkedEntityName,
      p_linked_entity_type: linkedEntityType,
    } as never
  );

  const error = rpcResponse.error;
  const data = rpcResponse.data as ProjectRow | null;

  if (error) {
    console.error("create_project_secure rpc error", error);
    throw serviceError(
      "Falha ao criar projeto",
      error,
      "create_project_secure"
    );
  }

  if (!data?.id) {
    throw new Error(
      "A funcao create_project_secure nao retornou um projeto valido."
    );
  }

  await upsertProjectMembership({
    project_id: data.id,
    user_id: effectiveUserId,
    role: "OWNER",
    created_by: effectiveUserId,
  });

  return data;
}

export async function getProjectsByOrganization(
  organization_id: string
): Promise<ProjectRow[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .schema("public")
    .from("projects")
    .select("*")
    .eq("organization_id", organization_id)
    .order("created_at", { ascending: false });

  if (error) {
    throw serviceError("Erro ao buscar projetos", error, "projects.select");
  }

  return (data ?? []) as ProjectRow[];
}

export async function updateProjectStatus(
  projectId: string,
  status: string
): Promise<ProjectRow> {
  const supabase = createClient();

  const { data, error } = await supabase
    .schema("public")
    .from("projects")
    .update({ status })
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) {
    throw serviceError(
      "Erro ao atualizar status do projeto",
      error,
      "projects.update"
    );
  }

  return data as ProjectRow;
}

export async function getProjectById(projectId: string): Promise<ProjectRow> {
  const supabase = createClient();

  const { data, error } = await supabase
    .schema("public")
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error) {
    throw serviceError("Erro ao buscar projeto", error, "projects.selectById");
  }

  return data as ProjectRow;
}

export async function listProjectParticipants(
  projectId: string
): Promise<ProjectParticipantRow[]> {
  const supabase = createClient();

  const membershipRes = await supabase
    .schema("public")
    .from("project_memberships")
    .select("user_id, role, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (membershipRes.error) {
    throw serviceError(
      "Falha ao listar participantes do projeto",
      membershipRes.error,
      "project_memberships.selectParticipants"
    );
  }

  const memberships = membershipRes.data ?? [];
  if (memberships.length === 0) return [];

  const userIds = memberships.map((membership) => membership.user_id);

  const profilesRes = await supabase
    .schema("public")
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds);

  if (profilesRes.error) {
    throw serviceError(
      "Falha ao buscar perfis dos participantes",
      profilesRes.error,
      "profiles.selectParticipants"
    );
  }

  const profilesMap = new Map(
    (profilesRes.data ?? []).map((profile) => [profile.id, profile])
  );

  return memberships.map((membership) => {
    const profile = profilesMap.get(membership.user_id);
    return {
      user_id: membership.user_id,
      role: membership.role as ProjectParticipantRow["role"],
      created_at: membership.created_at,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
    };
  });
}

export async function addProjectParticipant(
  projectId: string,
  userId: string,
  role: "CONSULTANT" | "INVESTOR" | "VIEWER",
  createdBy?: string
): Promise<void> {
  await upsertProjectMembership({
    project_id: projectId,
    user_id: userId,
    role,
    created_by: createdBy ?? null,
  });
}

export async function removeProjectParticipant(
  projectId: string,
  userId: string
): Promise<void> {
  const supabase = createClient();

  const currentRes = await supabase
    .schema("public")
    .from("project_memberships")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (currentRes.error) {
    throw serviceError(
      "Falha ao verificar participante do projeto",
      currentRes.error,
      "project_memberships.selectBeforeDelete"
    );
  }

  if (!currentRes.data) return;

  if (String(currentRes.data.role).toUpperCase() === "OWNER") {
    throw new Error("O criador do projeto nao pode ser removido dos participantes.");
  }

  const { error } = await supabase
    .schema("public")
    .from("project_memberships")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (error) {
    throw serviceError(
      "Falha ao remover participante do projeto",
      error,
      "project_memberships.delete"
    );
  }
}
