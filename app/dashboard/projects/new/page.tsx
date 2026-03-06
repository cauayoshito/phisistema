// app/dashboard/projects/new/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/services/auth.service";
import { getUserContext } from "@/services/membership.service";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: { error?: string | string[] };
};

function readQueryValue(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  return null;
}

function encodeMsg(msg: string) {
  return encodeURIComponent(msg);
}

function normalizeProjectType(raw: string) {
  const v = String(raw ?? "")
    .trim()
    .toUpperCase();

  // CHANGE: alinhar com enum real do banco (print do table editor)
  if (v === "INCENTIVADO") return "INCENTIVADO";
  if (v === "RECURSOS_PUBLICOS") return "RECURSOS_PUBLICOS";
  if (v === "RECURSOS_PROPRIOS") return "RECURSOS_PROPRIOS";

  // fallback seguro
  return "INCENTIVADO";
}

async function createProjectAction(formData: FormData) {
  "use server";

  // CHANGE: garantir que o client da action está autenticado (cookie/token ok)
  const supabase = createClient();
  const {
    data: { user: userFromClient },
    error: userErr,
  } = await supabase.auth.getUser();

  // Mantém o padrão do projeto (requireUser)
  const user = await requireUser();

  // CHANGE: se o client perdeu auth, aqui já fica explícito (causa raiz)
  if (userErr || !userFromClient?.id) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        `Auth context inválido na server action (supabase.auth.getUser retornou null).`
      )}`
    );
  }

  // CHANGE: sanity check, os 2 ids precisam bater
  if (userFromClient.id !== user.id) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        `Inconsistência de auth: requireUser=${user.id} vs client.getUser=${userFromClient.id}`
      )}`
    );
  }

  const ctx = await getUserContext(user.id);
  const orgId = ctx?.orgMembership?.organization_id ?? null;

  if (!orgId) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        "Usuário sem organização vinculada (orgMembership.organization_id)."
      )}`
    );
  }

  const title = String(formData.get("title") ?? "").trim();
  const projectType = normalizeProjectType(
    String(formData.get("project_type"))
  );
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg("Informe o nome do projeto.")}`
    );
  }

  // CHANGE: gerar UUID no app e NÃO depender de returning/select
  const newId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : null;

  if (!newId) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        "Falha ao gerar UUID no servidor (crypto.randomUUID indisponível)."
      )}`
    );
  }

  // created_by deve ser DEFAULT auth.uid() no banco (não envia)
  // status deve ser DEFAULT (DRAFT) no banco (não envia)
  const { error } = await supabase.from("projects").insert({
    id: newId,
    title,
    description: description || null,
    project_type: projectType,
    organization_id: orgId,
  });

  if (error) {
    redirect(
      `/dashboard/projects/new?error=${encodeMsg(
        `Falha ao criar projeto [context: projects.insert]: ${error.message}`
      )}`
    );
  }

  redirect(`/dashboard/projects/${newId}?tab=overview`);
}

export default async function NewProjectPage({ searchParams }: Props) {
  const user = await requireUser();
  const ctx = await getUserContext(user.id);

  const errorMessage = readQueryValue(searchParams?.error);

  const orgId = ctx?.orgMembership?.organization_id ?? null;
  const orgName = ctx?.orgMembership?.organization?.name ?? "Organização";

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Novo projeto</h1>
          <p className="text-sm text-slate-600">
            Crie um projeto e depois complete as abas (Plano, Financeiro,
            Documentos, Relatórios).
          </p>

          <div className="mt-2 inline-flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
              Org: <span className="font-medium">{orgName}</span>
            </span>

            {orgId ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                org_id: <span className="font-mono">{orgId}</span>
              </span>
            ) : (
              <span className="rounded-full bg-rose-50 px-3 py-1 text-rose-700 border border-rose-200">
                Sem org vinculada
              </span>
            )}

            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              user: <span className="font-mono">{user.id}</span>
            </span>
          </div>
        </div>

        <Link
          href="/dashboard/projects"
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar
        </Link>
      </header>

      {errorMessage && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Dados do projeto
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Preencha o básico agora. O restante fica nas abas do projeto.
          </p>
        </div>

        <form action={createProjectAction} className="p-5 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Nome do projeto
              </label>
              <input
                name="title"
                placeholder="ex: Educação no trânsito também é coisa de criança!"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Tipo do projeto
              </label>
              <select
                name="project_type"
                defaultValue="INCENTIVADO"
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                {/* CHANGE: valores alinhados ao enum do DB */}
                <option value="INCENTIVADO">Incentivado</option>
                <option value="RECURSOS_PUBLICOS">Recursos Públicos</option>
                <option value="RECURSOS_PROPRIOS">Recursos Próprios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Status inicial
              </label>
              <input
                value="DRAFT"
                readOnly
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Descrição (opcional)
              </label>
              <textarea
                name="description"
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Notas rápidas do projeto..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/projects"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Criar projeto
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
