import Link from "next/link";
import { requireUser } from "@/services/auth.service";
import { getUserContext } from "@/services/membership.service";
import { getOrganizationMemberships } from "@/services/membership.service";
import { listOrganizationsForUser } from "@/services/organizations.service";
import { getPrimaryRole } from "@/lib/roles";
import { createOrgInviteAction } from "@/app/actions/org-invite.actions";

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

  // Resolve perfil
  let role: ReturnType<typeof getPrimaryRole> = "ORG";
  try {
    const ctx = await getUserContext(user.id);
    role = getPrimaryRole(ctx);
  } catch {
    // fallback ORG
  }

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
          <h1 className="text-2xl font-bold text-slate-900">
            {role === "INVESTOR" ? "Organizações vinculadas" : "Minha Organização"}
          </h1>
          <p className="text-sm text-slate-600">
            {role === "INVESTOR"
              ? "Organizações sociais vinculadas ao seu perfil de financiador."
              : role === "CONSULTANT"
              ? "Organizações dos projetos sob sua gestão."
              : "Gerencie os dados da sua organização."}
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

      {/* ── INVESTOR: orgs vinculadas + convidar novas ── */}
      {role === "INVESTOR" && (() => {
        // Busca de convites pendentes vai ser renderizada inline
        return (
          <>
            {/* Formulário de convite */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold text-slate-900">
                  Convidar organização
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Envie um convite para vincular uma nova organização à sua
                  carteira. Ela receberá um link para criar a conta.
                </p>
              </div>

              <form
                action={createOrgInviteAction}
                className="grid gap-4 sm:grid-cols-6"
              >
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    E-mail da organização *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="contato@organizacao.org.br"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Nome sugerido (opcional)
                  </label>
                  <input
                    name="org_name"
                    placeholder="Ex: Instituto Comunidade Viva"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 sm:w-auto"
                  >
                    Gerar convite
                  </button>
                </div>
              </form>
            </section>

            {/* Organizações vinculadas */}
            {orgs.length > 0 && (
              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <h2 className="font-semibold text-slate-900">
                    Organizações na sua carteira
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {orgs.length} organização{orgs.length > 1 ? "ões" : ""}{" "}
                    vinculada{orgs.length > 1 ? "s" : ""}.
                  </p>
                </div>
                <ul className="divide-y divide-slate-200">
                  {orgs.map((org) => (
                    <li
                      key={org.id}
                      className="flex items-center justify-between gap-4 p-5"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {org.name}
                        </h3>
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
                  ))}
                </ul>
              </section>
            )}

            {orgs.length === 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">
                  Nenhuma organização vinculada ainda
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Use o formulário acima para convidar sua primeira organização.
                  Após aceitar o convite, ela aparecerá aqui.
                </p>
              </section>
            )}
          </>
        );
      })()}

      {/* ── CONSULTANT: visão somente leitura ── */}
      {role === "CONSULTANT" && (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Acesso de consultor
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Como consultor, você acompanha organizações através dos projetos
            vinculados ao seu perfil. Acesse os projetos pelo menu lateral para
            ver os dados das organizações associadas.
          </p>
          <Link
            href="/dashboard/projects"
            className="mt-4 inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver meus projetos
          </Link>
        </section>
      )}

      {/* ── ORG: vê sua organização, sem criação livre ── */}
      {role === "ORG" && (
        <>
          {orgs.length === 0 ? (
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Você ainda não está vinculado a uma organização
                </h2>
                <p className="text-sm text-slate-600">
                  Para operar na Transparência Social, sua organização precisa
                  ser vinculada a um financiador. Solicite um convite ao
                  financiador responsável ou aguarde ser adicionado.
                </p>
              </div>

              <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-semibold text-blue-900">
                  Como funciona?
                </h3>
                <p className="mt-1 text-sm text-blue-800">
                  O financiador (empresa) envia um convite por e-mail com um link
                  de aceite. Ao aceitar, sua organização fica automaticamente
                  vinculada e você poderá criar projetos e relatórios.
                </p>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Se você recebeu um convite, use o link enviado por e-mail para
                entrar na organização.
              </div>
            </section>
          ) : (
            <>
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900">
                  Minhas organizações
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Escolha uma organização para visualizar dados, documentos e
                  questionários.
                </p>
              </section>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <ul className="divide-y divide-slate-200">
                  {orgs.map((org) => {
                    const orgRole = membershipMap.get(org.id);

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
                              {membershipRoleLabel(orgRole)}
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
        </>
      )}
    </main>
  );
}
