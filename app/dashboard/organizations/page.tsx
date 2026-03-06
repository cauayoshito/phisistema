import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/services/auth.service";
import { getOrganizationMemberships } from "@/services/membership.service";
import { listOrganizationsForUser } from "@/services/organizations.service";
import { createOrganizationAction } from "@/app/actions/organizations.actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: { error?: string | string[]; success?: string | string[] };
};

function msg(v?: string | string[]) {
  return typeof v === "string" ? decodeURIComponent(v) : null;
}

export default async function DashboardOrganizationsPage({
  searchParams,
}: Props) {
  const user = await requireUser();

  const error = msg(searchParams?.error);
  const success = msg(searchParams?.success);

  // 1) memberships do usuário (define acesso)
  const memberships = await getOrganizationMemberships(user.id);

  // 2) orgs que ele consegue ver (por membership)
  const orgIds = (memberships ?? []).map((m) => m.organization_id);
  const orgs = orgIds.length > 0 ? await listOrganizationsForUser(orgIds) : [];

  // Se tiver exatamente 1 org, pode redirecionar direto (opcional MVP)
  // if (orgs.length === 1) redirect(`/dashboard/organizations/${orgs[0].id}`);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Organizações</h1>
          <p className="text-sm text-slate-600">
            Gerencie sua organização e acesse documentos/questionário.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:underline"
        >
          Voltar
        </Link>
      </header>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      {/* Estado vazio (conta nova) */}
      {orgs.length === 0 ? (
        <section className="rounded-xl border bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            Você ainda não tem organização
          </h2>
          <p className="text-sm text-slate-600">
            Para continuar no PHI, crie uma organização ou entre por convite.
          </p>

          <form action={createOrganizationAction} className="space-y-3">
            <label className="block text-sm">
              Nome da organização
              <input
                name="name"
                required
                placeholder="Ex: Instituto..."
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </label>

            <button className="rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold">
              Criar organização
            </button>
          </form>

          <div className="text-xs text-slate-500">
            Se você recebeu convite, use o link do e-mail para entrar na
            organização.
          </div>
        </section>
      ) : (
        <section className="rounded-xl border bg-white overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Minhas organizações</h2>

            <form
              action={createOrganizationAction}
              className="flex items-center gap-2"
            >
              <input
                name="name"
                required
                placeholder="Nova organização..."
                className="w-64 rounded-lg border px-3 py-2 text-sm"
              />
              <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white font-semibold">
                Criar
              </button>
            </form>
          </div>

          <ul className="divide-y">
            {orgs.map((org) => (
              <li
                key={org.id}
                className="p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-xs text-slate-500">{org.id}</div>
                </div>

                <Link
                  href={`/dashboard/organizations/${org.id}`}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                >
                  Abrir →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
