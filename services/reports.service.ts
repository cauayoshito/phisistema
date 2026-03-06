import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/services/audit.service";
import { getUserContext } from "@/services/membership.service";
import { getProjectByIdForUser } from "@/services/projects.service";
import type { Database, Json } from "@/types/database";

type ReportRow = Database["public"]["Tables"]["reports"]["Row"];
type ReportVersionRow = Database["public"]["Tables"]["report_versions"]["Row"];

type Decision = "APPROVED" | "RETURNED";

function normalizeRole(role: string | null | undefined): string {
  return (role ?? "").trim().toUpperCase();
}

function normalizeStatus(status: string | null | undefined): string {
  return (status ?? "").trim().toUpperCase();
}

function getOrgIdFromContext(ctx: any): string | null {
  return (
    ctx?.orgMembership?.organization_id ??
    ctx?.orgMembership?.organization?.id ??
    ctx?.organization?.id ??
    null
  );
}

async function requireProjectAccessByReportId(
  reportId: string,
  userId: string
): Promise<ReportRow> {
  const supabase = createClient();
  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .single();

  if (error || !report) {
    throw new Error("Relatório não encontrado.");
  }

  const project = await getProjectByIdForUser(report.project_id, userId);
  if (!project) {
    throw new Error("Acesso negado ao relatório.");
  }

  return report as ReportRow;
}

/**
 * P0: Projetos visíveis do usuário para o SELECT em /dashboard/reports
 * Não assume coluna "name" (pode ser title/project_name).
 */
export async function listProjectsForUserReports(
  userId: string
): Promise<Array<{ id: string; label: string }>> {
  const ctx = await getUserContext(userId);
  const orgId = getOrgIdFromContext(ctx);
  const supabase = createClient();

  async function trySelect(
    selectExpr: string,
    labelKey: "name" | "title" | "project_name"
  ): Promise<Array<{ id: string; label: string }> | null> {
    const base = supabase
      .from("projects")
      .select(selectExpr as any)
      .order("created_at", { ascending: false });

    const { data, error } = orgId
      ? await base.eq("organization_id", orgId)
      : await base;
    if (error) return null;

    const rows = (data ?? []) as any[];
    return rows.map((p) => ({
      id: String(p.id),
      label: String(p[labelKey] ?? p.id),
    }));
  }

  const byName = await trySelect("id, name", "name");
  if (byName) return byName;

  const byTitle = await trySelect("id, title", "title");
  if (byTitle) return byTitle;

  const byProjectName = await trySelect("id, project_name", "project_name");
  if (byProjectName) return byProjectName;

  const { data, error } = orgId
    ? await supabase
        .from("projects")
        .select("id")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false })
    : await supabase
        .from("projects")
        .select("id")
        .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao listar projetos: ${error.message}`);

  return ((data ?? []) as any[]).map((p) => ({
    id: String(p.id),
    label: String(p.id),
  }));
}

/**
 * Listagem /dashboard/reports com label do projeto (tenta join e faz fallback).
 */
export async function listReportsForUser(userId: string) {
  await getUserContext(userId);
  const supabase = createClient();

  const joinAttempts = [
    {
      select: `
        id, title, status, created_at, period_start, period_end, project_id,
        projects:project_id ( id, name )
      `,
      pick: (r: any) => r.projects?.name ?? null,
    },
    {
      select: `
        id, title, status, created_at, period_start, period_end, project_id,
        projects:project_id ( id, title )
      `,
      pick: (r: any) => r.projects?.title ?? null,
    },
    {
      select: `
        id, title, status, created_at, period_start, period_end, project_id,
        projects:project_id ( id, project_name )
      `,
      pick: (r: any) => r.projects?.project_name ?? null,
    },
  ];

  for (const attempt of joinAttempts) {
    const { data, error } = await supabase
      .from("reports")
      .select(attempt.select as any)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return (data as any[]).map((r) => ({
        id: r.id as string,
        title: (r.title as string | null) ?? null,
        status: r.status as string,
        created_at: r.created_at as string,
        period_start: r.period_start as string,
        period_end: r.period_end as string,
        project_id: r.project_id as string,
        project_label: attempt.pick(r),
      }));
    }
  }

  const { data: raw, error: repErr } = await supabase
    .from("reports")
    .select(
      "id, title, status, created_at, period_start, period_end, project_id"
    )
    .order("created_at", { ascending: false });

  if (repErr) throw new Error(`Falha ao listar relatórios: ${repErr.message}`);

  const projectIds = Array.from(
    new Set((raw ?? []).map((r: any) => r.project_id).filter(Boolean))
  );

  const projectLabelMap = await (async () => {
    const map = new Map<string, string>();
    const tries: Array<{
      select: string;
      key: "name" | "title" | "project_name";
    }> = [
      { select: "id, name", key: "name" },
      { select: "id, title", key: "title" },
      { select: "id, project_name", key: "project_name" },
    ];

    for (const t of tries) {
      const { data, error } = await supabase
        .from("projects")
        .select(t.select as any)
        .in("id", projectIds);
      if (error) continue;
      for (const p of (data ?? []) as any[])
        map.set(String(p.id), String(p[t.key] ?? p.id));
      if (map.size > 0) break;
    }
    return map;
  })();

  return (raw ?? []).map((r: any) => ({
    id: r.id as string,
    title: (r.title as string | null) ?? null,
    status: r.status as string,
    created_at: r.created_at as string,
    period_start: r.period_start as string,
    period_end: r.period_end as string,
    project_id: r.project_id as string,
    project_label: projectLabelMap.get(String(r.project_id)) ?? null,
  }));
}

export async function listReportsByProject(
  projectId: string,
  userId: string
): Promise<ReportRow[]> {
  const project = await getProjectByIdForUser(projectId, userId);
  if (!project) throw new Error("Acesso negado ao projeto.");

  const supabase = createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Falha ao listar relatórios: ${error.message}`);
  return (data ?? []) as ReportRow[];
}

export async function getReport(
  reportId: string,
  userId: string
): Promise<ReportRow> {
  return requireProjectAccessByReportId(reportId, userId);
}

export async function listVersions(
  reportId: string
): Promise<ReportVersionRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("report_versions")
    .select("*")
    .eq("report_id", reportId)
    .order("version_number", { ascending: false });

  if (error) throw new Error(`Falha ao listar versões: ${error.message}`);
  return (data ?? []) as ReportVersionRow[];
}

export async function getCurrentVersion(
  reportId: string
): Promise<ReportVersionRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("report_versions")
    .select("*")
    .eq("report_id", reportId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Falha ao buscar versão atual: ${error.message}`);
  return (data as ReportVersionRow | null) ?? null;
}

export async function getReportDetail(reportId: string, userId: string) {
  const report = await requireProjectAccessByReportId(reportId, userId);
  const supabase = createClient();

  const label = await (async () => {
    const tries: Array<{
      select: string;
      key: "name" | "title" | "project_name";
    }> = [
      { select: "id, name", key: "name" },
      { select: "id, title", key: "title" },
      { select: "id, project_name", key: "project_name" },
    ];

    for (const t of tries) {
      const { data, error } = await supabase
        .from("projects")
        .select(t.select as any)
        .eq("id", report.project_id)
        .maybeSingle();

      if (!error && data)
        return String((data as any)[t.key] ?? report.project_id);
    }

    return String(report.project_id);
  })();

  const currentVersion = await getCurrentVersion(reportId);

  return {
    report,
    project: { id: report.project_id, name: label },
    currentVersion,
  };
}

/**
 * ✅ FIX P0: Save draft robusto (não quebra com .single() quando RLS não retorna linha)
 */
export async function saveDraft(
  reportId: string,
  dataJson: Json,
  userId: string
): Promise<ReportVersionRow> {
  const report = await requireProjectAccessByReportId(reportId, userId);
  const ctx = await getUserContext(userId);

  if (normalizeRole(ctx.orgMembership?.role) !== "ORG_ADMIN") {
    throw new Error("Apenas ORG_ADMIN pode salvar rascunho.");
  }

  if (normalizeStatus(report.status as any) !== "DRAFT") {
    throw new Error("Só é permitido editar quando status = DRAFT.");
  }

  const supabase = createClient();
  const current = await getCurrentVersion(reportId);

  // Regra: se já existe uma versão DRAFT atual, tenta atualizar ela.
  if (current && normalizeStatus(current.status as any) === "DRAFT") {
    const { data: updated, error: updErr } = await supabase
      .from("report_versions")
      .update({
        data: dataJson,
        status: "DRAFT",
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .select("*")
      .maybeSingle();

    if (updErr) {
      throw new Error(`Falha ao atualizar rascunho: ${updErr.message}`);
    }

    // Se não veio linha (RLS pode esconder o retorno), faz fallback criando nova versão
    if (updated) {
      await supabase
        .from("reports")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", report.id);

      await logAction(
        "save_draft",
        "report",
        reportId,
        { version_number: updated.version_number, mode: "update" },
        userId
      );

      return updated as ReportVersionRow;
    }
  }

  // Fallback: cria uma nova versão DRAFT
  const nextVersionNumber = current ? current.version_number + 1 : 1;

  const { data: inserted, error: insErr } = await supabase
    .from("report_versions")
    .insert({
      report_id: reportId,
      version_number: nextVersionNumber,
      data: dataJson,
      status: "DRAFT",
      created_by: userId,
    })
    .select("*")
    .maybeSingle();

  if (insErr) {
    throw new Error(`Falha ao criar rascunho: ${insErr.message}`);
  }
  if (!inserted) {
    throw new Error(
      "Falha ao criar rascunho: nenhuma linha retornada (verifique RLS em report_versions)."
    );
  }

  const { error: reportErr } = await supabase
    .from("reports")
    .update({
      status: "DRAFT",
      updated_at: new Date().toISOString(),
      current_version: nextVersionNumber,
    })
    .eq("id", report.id);

  if (reportErr) {
    throw new Error(`Falha ao atualizar relatório: ${reportErr.message}`);
  }

  await logAction(
    "save_draft",
    "report",
    reportId,
    { version_number: nextVersionNumber, mode: "insert" },
    userId
  );

  return inserted as ReportVersionRow;
}

export async function submitReport(
  reportId: string,
  userId: string
): Promise<ReportVersionRow> {
  const report = await requireProjectAccessByReportId(reportId, userId);
  const ctx = await getUserContext(userId);

  if (normalizeRole(ctx.orgMembership?.role) !== "ORG_ADMIN") {
    throw new Error("Apenas ORG_ADMIN pode enviar relatório.");
  }

  if (normalizeStatus(report.status as any) !== "DRAFT") {
    throw new Error("Apenas relatórios em DRAFT podem ser enviados.");
  }

  const supabase = createClient();
  const current = await getCurrentVersion(reportId);
  const nextVersionNumber = current ? current.version_number + 1 : 1;

  const { data, error } = await supabase
    .from("report_versions")
    .insert({
      report_id: reportId,
      version_number: nextVersionNumber,
      data: current?.data ?? {},
      status: "SUBMITTED",
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao enviar relatório: ${error.message}`);

  const { error: reportError } = await supabase
    .from("reports")
    .update({
      status: "SUBMITTED",
      updated_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      current_version: nextVersionNumber,
    })
    .eq("id", report.id);

  if (reportError) {
    throw new Error(
      `Falha ao atualizar status do relatório: ${reportError.message}`
    );
  }

  await logAction(
    "submit_report",
    "report",
    reportId,
    { version_number: nextVersionNumber },
    userId
  );

  return data as ReportVersionRow;
}

export async function reopenToDraft(
  reportId: string,
  userId: string
): Promise<ReportVersionRow> {
  const report = await requireProjectAccessByReportId(reportId, userId);
  const ctx = await getUserContext(userId);

  if (normalizeRole(ctx.orgMembership?.role) !== "ORG_ADMIN") {
    throw new Error("Apenas ORG_ADMIN pode reabrir relatório.");
  }

  if (normalizeStatus(report.status as any) === "DRAFT") {
    throw new Error("Relatório já está em DRAFT.");
  }

  const supabase = createClient();
  const current = await getCurrentVersion(reportId);
  const nextVersionNumber = current ? current.version_number + 1 : 1;

  const { data, error } = await supabase
    .from("report_versions")
    .insert({
      report_id: reportId,
      version_number: nextVersionNumber,
      data: current?.data ?? {},
      status: "DRAFT",
      created_by: userId,
    })
    .select("*")
    .single();

  if (error) throw new Error(`Falha ao reabrir: ${error.message}`);

  const { error: reportError } = await supabase
    .from("reports")
    .update({
      status: "DRAFT",
      updated_at: new Date().toISOString(),
      current_version: nextVersionNumber,
    })
    .eq("id", report.id);

  if (reportError)
    throw new Error(`Falha ao atualizar report: ${reportError.message}`);

  await logAction(
    "reopen_report_draft",
    "report",
    reportId,
    { version_number: nextVersionNumber },
    userId
  );

  return data as ReportVersionRow;
}

async function reviewReport(
  reportId: string,
  comment: string,
  userId: string,
  decision: Decision
): Promise<void> {
  const report = await requireProjectAccessByReportId(reportId, userId);
  const ctx = await getUserContext(userId);

  // seu enum não tem CONSULTANT em memberships.role (pelo erro), então aqui depende do seu ctx.roles
  if (!ctx.roles?.includes?.("CONSULTANT")) {
    throw new Error("Apenas consultor pode revisar relatório.");
  }

  const status = decision === "APPROVED" ? "APPROVED" : "RETURNED";

  const supabase = createClient();
  const current = await getCurrentVersion(reportId);

  const payload: Record<string, any> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "APPROVED") payload.approved_at = new Date().toISOString();

  const { error: reportError } = await supabase
    .from("reports")
    .update(payload)
    .eq("id", report.id);

  if (reportError)
    throw new Error(
      `Falha ao atualizar status do relatório: ${reportError.message}`
    );

  const { error: reviewError } = await supabase.from("report_reviews").insert({
    report_id: reportId,
    version_number: current?.version_number ?? 1,
    reviewer_user_id: userId,
    decision,
    comment,
  });

  if (reviewError)
    throw new Error(`Falha ao registrar revisão: ${reviewError.message}`);

  await logAction(
    decision === "APPROVED" ? "approve_report" : "return_report",
    "report",
    reportId,
    { version_number: current?.version_number ?? 1, comment },
    userId
  );
}

export async function returnReport(
  reportId: string,
  comment: string,
  userId: string
): Promise<void> {
  await reviewReport(reportId, comment, userId, "RETURNED");
}

export async function approveReport(
  reportId: string,
  comment: string,
  userId: string
): Promise<void> {
  await reviewReport(reportId, comment, userId, "APPROVED");
}

/**
 * Necessário para o fluxo de template (resolve "is not a function")
 */
export async function getReportTemplateForProjectType(projectType: string) {
  const supabase = createClient();

  const { data: template, error: templateError } = await supabase
    .from("report_templates")
    .select("*")
    .eq("project_type", projectType)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (templateError)
    throw new Error(`Falha ao buscar template: ${templateError.message}`);
  if (!template) return null;

  const { data: sections, error: sectionsError } = await supabase
    .from("template_sections")
    .select("*")
    .eq("template_id", template.id)
    .order("sort_order", { ascending: true });

  if (sectionsError)
    throw new Error(
      `Falha ao buscar seções do template: ${sectionsError.message}`
    );

  const sectionIds = (sections ?? []).map((s: any) => s.id);

  const { data: fields, error: fieldsError } = sectionIds.length
    ? await supabase
        .from("template_fields")
        .select("*")
        .in("section_id", sectionIds)
        .order("sort_order", { ascending: true })
    : { data: [], error: null };

  if (fieldsError)
    throw new Error(
      `Falha ao buscar campos do template: ${fieldsError.message}`
    );

  return {
    template,
    sections: (sections ?? []).map((section: any) => ({
      ...section,
      fields: (fields ?? []).filter((f: any) => f.section_id === section.id),
    })),
  };
}

/**
 * P1: Duplicar / Excluir
 */
export async function duplicateReport(reportId: string, userId: string) {
  const original = await requireProjectAccessByReportId(reportId, userId);
  const supabase = createClient();

  const current = await getCurrentVersion(reportId);

  const newTitle =
    original.title && String(original.title).trim()
      ? `${String(original.title).trim()} (cópia)`
      : null;

  const { data: newReport, error: insErr } = await supabase
    .from("reports")
    .insert({
      project_id: original.project_id,
      title: newTitle,
      period_type: original.period_type,
      period_start: original.period_start,
      period_end: original.period_end,
      status: "DRAFT",
      current_version: 1,
      created_by: userId,
    })
    .select("*")
    .single();

  if (insErr || !newReport) {
    throw new Error(
      `Falha ao duplicar relatório: ${insErr?.message ?? "erro desconhecido"}`
    );
  }

  const { error: verErr } = await supabase.from("report_versions").insert({
    report_id: newReport.id,
    version_number: 1,
    status: "DRAFT",
    data: current?.data ?? {},
    created_by: userId,
  });

  if (verErr) {
    await supabase.from("reports").delete().eq("id", newReport.id);
    throw new Error(`Falha ao criar versão do duplicado: ${verErr.message}`);
  }

  await logAction(
    "duplicate_report",
    "report",
    newReport.id,
    { from_report_id: reportId },
    userId
  );

  return newReport;
}

export async function deleteReport(reportId: string, userId: string) {
  const report = await requireProjectAccessByReportId(reportId, userId);
  const ctx = await getUserContext(userId);

  if (normalizeRole(ctx.orgMembership?.role) !== "ORG_ADMIN") {
    throw new Error("Apenas ORG_ADMIN pode excluir relatório.");
  }

  if (normalizeStatus(report.status as any) !== "DRAFT") {
    throw new Error("Só é possível excluir relatório em DRAFT.");
  }

  const supabase = createClient();

  await supabase.from("report_versions").delete().eq("report_id", reportId);

  const { error: delErr } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId);
  if (delErr) throw new Error(`Falha ao excluir relatório: ${delErr.message}`);

  await logAction("delete_report", "report", reportId, {}, userId);

  return { ok: true };
}
