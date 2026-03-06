// services/projects.service.ts
import { createClient } from "@/lib/supabase/server";
import { getOrganizationMemberships } from "@/services/membership.service";
import type { Database, Json } from "@/types/database";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export type CreateProjectInput = {
  title: string;
  description?: string | null;
  project_type: string;
  status?: string;
  organization_id?: string;
  metadata?: Json;
};

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").trim().toUpperCase();
}

// CHANGE: melhorar extração de erro do PostgrestError
function serviceError(base: string, raw: unknown, context: string) {
  const anyRaw = raw as any;
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

export async function listProjectsForUser(
  userId: string
): Promise<ProjectRow[]> {
  const supabase = createClient();

  const membershipsRes = await supabase
    .schema("public")
    .from("organization_memberships")
    .select("organization_id, role")
    .eq("user_id", userId);

  if (membershipsRes.error) {
    throw serviceError(
      "Falha ao buscar memberships de organização",
      membershipsRes.error,
      "organization_memberships"
    );
  }

  const orgIds = (membershipsRes.data ?? []).map((m) => m.organization_id);
  if (orgIds.length === 0) return [];

  const { data, error } = await supabase
    .schema("public")
    .from("projects")
    .select("*")
    .in("organization_id", orgIds)
    .order("created_at", { ascending: false });

  if (error)
    throw serviceError("Falha ao listar projetos", error, "projects.select");
  return (data ?? []) as ProjectRow[];
}

export async function getProjectByIdForUser(
  projectId: string,
  userId: string
): Promise<ProjectRow | null> {
  const projects = await listProjectsForUser(userId);
  return projects.find((p) => p.id === projectId) ?? null;
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
      "Usuário não autenticado",
      authError ?? "Sem user",
      "auth.getUser()"
    );
  }

  const effectiveUserId = userId ?? user.id;

  // CHANGE: organização determinística: payload.organization_id vem do form
  let organizationId = payload.organization_id?.trim() || null;

  if (!organizationId) {
    // fallback antigo: ORG_ADMIN
    const memberships = await getOrganizationMemberships(effectiveUserId);
    const orgAdminMembership = memberships.find(
      (m) => normalizeRole(m.role) === "ORG_ADMIN"
    );
    organizationId = orgAdminMembership?.organization_id ?? null;
  }

  if (!organizationId) {
    throw new Error("Não foi possível determinar a organização do projeto.");
  }

  const { data, error } = await supabase
    .schema("public")
    .from("projects")
    .insert({
      title: payload.title,
      description: payload.description ?? null,
      project_type: payload.project_type,
      status: payload.status ?? "DRAFT",
      organization_id: organizationId,

      // CHANGE: satisfaz policy projects_insert (created_by = auth.uid())
      created_by: user.id,
    } as any)
    .select("*")
    .single();

  if (error) {
    throw serviceError("Falha ao criar projeto", error, "projects.insert");
  }

  return data as ProjectRow;
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

  if (error)
    throw serviceError("Erro ao buscar projetos", error, "projects.select");
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

  if (error)
    throw serviceError("Erro ao buscar projeto", error, "projects.selectById");
  return data as ProjectRow;
}
