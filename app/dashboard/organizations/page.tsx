import Link from "next/link";
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

function shortId(value?: string | null) {
  const s = String(value ?? "").trim();
  if (!s) return "-";
  if (s.length <= 16) return s;
  return `${s.slice(0, 8)}...${s.slice(-4)}`;
}

function membershipRoleLabel(value?: string | null) {
  const v = String(value ?? "")
    .trim()
    .toUpperCase();

  if (v === "ORG_ADMIN") return "Administrador";
  if (v === "ORG_MEMBER") return "Membro";

  return "Vínculo ativo";
}

export default async function DashboardOrganizationsPage({
  searchParams,
}: Props) {
  const user = await requireUser();

  const error = msg(searchParams?.error);
  const success = msg(searchParams?.success);

  const memberships = await getOrganizationMemberships(user.id);
  const orgIds = (memberships ?? []).map((m) => m.organization_id);
  const orgs = orgIds.length > 0 ? await listOrganizationsForUser(orgIds) : [];

  const membershipMap = new Map(
    (memberships ?? []).map((m) => [m.organization_id, m.role])
  );

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Organizações</h1>
          <p className="text-sm text-slate-600">
            Gerencie suas organizações e acesse documentos e questionários.
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

      {orgs.length === 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">
              Você ainda não tem organização
            </h2>
            <p className="text-sm text-slate-600">
              Para continuar no PHI, crie uma organização ou entre por convite.
            </p>
          </div>

          <form action={createOrganizationAction} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nome da organização
              </label>
              <input
                name="name"
                required
                placeholder="Ex: Instituto Comunidade Viva"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>

            <button className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Criar organização
            </button>
          </form>

          <div className="mt-4 text-xs text-slate-500">
            Se você recebeu um convite, use o link enviado por e-mail para
            entrar na organização.
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Minhas organizações
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Escolha uma organização para visualizar dados, documentos e
                  questionários.
                </p>
              </div>

              <form
                action={createOrganizationAction}
                className="flex w-full flex-col gap-2 sm:flex-row md:w-auto"
              >
                <input
                  name="name"
                  required
                  placeholder="Nova organização..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm sm:w-72"
                />
                <button className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                  Criar
                </button>
              </form>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <ul className="divide-y divide-slate-200">
              {orgs.map((org) => {
                const role = membershipMap.get(org.id);

                return (
                  <li
                    key={org.id}
                    className="flex items-center justify-between gap-4 p-5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {org.name}
                        </h3>

                        <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {membershipRoleLabel(role)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        Identificador: {shortId(org.id)}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/organizations/${org.id}`}
                      className="shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Abrir
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
