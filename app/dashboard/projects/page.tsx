import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listProjectsForUser } from "@/services/projects.service";
import {
  getUserContext,
  getOrganizationMemberships,
} from "@/services/membership.service";
import { getPrimaryRole } from "@/lib/roles";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: {
    q?: string;
    type?: string;
    error?: string;
  };
};

function getSearchMessage(error?: string) {
  if (!error) return null;
  try {
    return decodeURIComponent(error);
  } catch {
    return error;
  }
}

function readString(v: string | string[] | undefined): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function normalizeProjectType(value: string) {
  const v = value.trim().toUpperCase();
  if (
    v === "RECURSOS_PROPRIOS" ||
    v === "INCENTIVADO" ||
    v === "RECURSOS_PUBLICOS"
  ) {
    return v;
  }
  return "ALL";
}

function normalizeRole(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function projectTypeLabel(v: string) {
  const value = String(v ?? "")
    .trim()
    .toUpperCase();

  if (value === "RECURSOS_PROPRIOS") return "Recursos Próprios";
  if (value === "INCENTIVADO") return "Incentivado";
  if (value === "RECURSOS_PUBLICOS") return "Recursos Públicos";
  return "Todos";
}

function badgeForType(v: string) {
  const t = String(v ?? "").toUpperCase();

  if (t === "RECURSOS_PROPRIOS") {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  if (t === "INCENTIVADO") {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }

  if (t === "RECURSOS_PUBLICOS") {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  return "bg-slate-50 text-slate-700 border-slate-200";
}

function badgeForStatus(v: string) {
  const s = String(v ?? "").toUpperCase();

  if (s === "DRAFT") return "bg-slate-100 text-slate-700 border-slate-200";
  if (s === "ENVIADO") return "bg-amber-50 text-amber-700 border-amber-200";
  if (s === "EM_ANALISE") {
    return "bg-yellow-50 text-yellow-800 border-yellow-200";
  }
  if (s === "APROVADO") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (s === "DEVOLVIDO") return "bg-rose-50 text-rose-700 border-rose-200";

  return "bg-slate-50 text-slate-700 border-slate-200";
}

function projectStatusLabel(value: unknown) {
  const status = String(value ?? "")
    .trim()
    .toUpperCase() as ProjectStatus;

  return PROJECT_STATUS_LABEL[status] ?? String(value ?? "-");
}

export default async function ProjectsPage({ searchParams }: Props) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let role: ReturnType<typeof getPrimaryRole> = "ORG";
  let canCreateProject = false;

  try {
    const [ctx, memberships] = await Promise.all([
      getUserContext(user.id),
      getOrganizationMemberships(user.id),
    ]);

    role = getPrimaryRole(ctx);

    const hasOrgAdminMembership = memberships.some(
      (membership) => normalizeRole(membership.role) === "ORG_ADMIN"
    );

    canCreateProject = role === "ORG" && hasOrgAdminMembership;
  } catch {
    // fallback seguro: não libera criação sem validar
    canCreateProject = false;
  }

  const q = readString(searchParams?.q);
  const type = normalizeProjectType(readString(searchParams?.type));
  const errorMessage = getSearchMessage(searchParams?.error);

  const allProjects = await listProjectsForUser(user.id);

  const projects = allProjects.filter((p: any) => {
    if (type !== "ALL" && String(p.project_type).toUpperCase() !== type) {
      return false;
    }

    if (
      q &&
      !String(p.title ?? "")
        .toLowerCase()
        .includes(q.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const makeHref = (next: { q?: string; type?: string }) => {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextType = next.type ?? type;

    if (nextQ) params.set("q", nextQ);
    if (nextType && nextType !== "ALL") params.set("type", nextType);

    const s = params.toString();
    return s ? `/dashboard/projects?${s}` : "/dashboard/projects";
  };

  const actionLabel = role === "ORG" ? "Abrir" : "Visualizar";

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Projetos
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {role === "INVESTOR"
              ? "Projetos das organizações vinculadas ao seu perfil."
              : role === "CONSULTANT"
              ? "Projetos sob sua gestão como consultor."
              : "Gerencie e acompanhe seus projetos."}
          </p>
        </div>

        {canCreateProject && (
          <Link
            href="/dashboard/projects/new"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 sm:w-auto"
          >
            Novo Projeto
          </Link>
        )}
      </header>

      {errorMessage && (
        <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form className="w-full lg:w-96" action={makeHref({})} method="get">
            <input
              type="hidden"
              name="type"
              value={type !== "ALL" ? type : ""}
            />

            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar por nome..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
            />
          </form>

          <div className="-mx-1 overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 px-1 lg:min-w-0">
              <Link
                href={makeHref({ type: "ALL" })}
                className={[
                  "whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium",
                  type === "ALL"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                Todos
              </Link>

              <Link
                href={makeHref({ type: "RECURSOS_PROPRIOS" })}
                className={[
                  "whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium",
                  type === "RECURSOS_PROPRIOS"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                Próprio
              </Link>

              <Link
                href={makeHref({ type: "INCENTIVADO" })}
                className={[
                  "whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium",
                  type === "INCENTIVADO"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                Incentivado
              </Link>

              <Link
                href={makeHref({ type: "RECURSOS_PUBLICOS" })}
                className={[
                  "whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-medium",
                  type === "RECURSOS_PUBLICOS"
                    ? "border-blue-200 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                Público
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          Filtro: <span className="font-medium">{projectTypeLabel(type)}</span>
          {q ? (
            <>
              {" · "}Busca: <span className="font-medium">{q}</span>
            </>
          ) : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="divide-y divide-slate-200 md:hidden">
          {(projects ?? []).map((p: any) => (
            <div key={p.id} className="space-y-4 p-4">
              <div className="min-w-0">
                <Link
                  href={`/dashboard/projects/${p.id}?tab=overview`}
                  className="block break-words text-sm font-semibold text-slate-900 hover:underline"
                >
                  {p.title}
                </Link>

                <span className="mt-1 block break-all text-xs text-slate-500">
                  ID: {p.id}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                    badgeForType(p.project_type),
                  ].join(" ")}
                >
                  {projectTypeLabel(String(p.project_type ?? ""))}
                </span>

                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                    badgeForStatus(p.status),
                  ].join(" ")}
                >
                  {projectStatusLabel(p.status)}
                </span>
              </div>

              <div className="flex">
                <Link
                  href={`/dashboard/projects/${p.id}?tab=overview`}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-slate-50"
                >
                  {actionLabel}
                </Link>
              </div>
            </div>
          ))}

          {(projects ?? []).length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-slate-500">
              Nenhum projeto encontrado.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-4 sm:px-6">Nome do Projeto</th>
                <th className="px-4 py-4 sm:px-6">Tipo</th>
                <th className="px-4 py-4 sm:px-6">Status</th>
                <th className="px-4 py-4 text-right sm:px-6">Ações</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {(projects ?? []).map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex min-w-0 flex-col">
                      <Link
                        href={`/dashboard/projects/${p.id}?tab=overview`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {p.title}
                      </Link>

                      <span className="mt-1 text-xs text-slate-500">
                        ID: {p.id}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-4 sm:px-6">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                        badgeForType(p.project_type),
                      ].join(" ")}
                    >
                      {projectTypeLabel(String(p.project_type ?? ""))}
                    </span>
                  </td>

                  <td className="px-4 py-4 sm:px-6">
                    <span
                      className={[
                        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                        badgeForStatus(p.status),
                      ].join(" ")}
                    >
                      {projectStatusLabel(p.status)}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right sm:px-6">
                    <Link
                      href={`/dashboard/projects/${p.id}?tab=overview`}
                      className="text-blue-600 hover:underline"
                    >
                      {actionLabel}
                    </Link>
                  </td>
                </tr>
              ))}

              {(projects ?? []).length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-500 sm:px-6"
                  >
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-4 py-4 text-sm text-slate-500 sm:px-6">
          Mostrando{" "}
          <span className="font-medium text-slate-900">
            {(projects ?? []).length}
          </span>{" "}
          projeto(s).
        </div>
      </section>
    </main>
  );
}
