import Link from "next/link";
import { createInstitutionalEntityAction } from "@/app/actions/institutional-entities.actions";
import { revokeInstitutionalEntityInviteAction } from "@/app/actions/institutional-entity-invites.actions";
import InviteEntityMemberButton from "@/components/entities/InviteEntityMemberButton";
import { requireUser } from "@/services/auth.service";
import {
  listInstitutionalEntityInvites,
  listInstitutionalEntityMembers,
} from "@/services/institutional-entity-invites.service";
import { getOrganizationMemberships } from "@/services/membership.service";
import { listInstitutionalEntitiesForOrganizations } from "@/services/institutional-entities.service";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: { error?: string | string[]; success?: string | string[] };
};

function readMessage(value?: string | string[]) {
  return typeof value === "string" ? decodeURIComponent(value) : null;
}

function entityTypeLabel(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "empresa") return "Empresa";
  if (normalized === "entidade_publica") return "Entidade publica";
  return "Tipo nao informado";
}

function shortValue(value?: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : "-";
}

function inviteStatusLabel(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if (normalized === "PENDING") return "Pendente";
  if (normalized === "ACCEPTED") return "Aceito";
  if (normalized === "EXPIRED") return "Expirado";
  if (normalized === "REVOKED") return "Revogado";
  return "Status";
}

function inviteStatusClass(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if (normalized === "ACCEPTED") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (normalized === "EXPIRED" || normalized === "REVOKED") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function memberRoleLabel(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if (normalized === "ENTITY_ADMIN") return "Administrador";
  if (normalized === "ENTITY_MEMBER") return "Membro";
  return "Vinculo ativo";
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function DashboardEntitiesPage({ searchParams }: Props) {
  const user = await requireUser();
  const memberships = await getOrganizationMemberships(user.id);

  const error = readMessage(searchParams?.error);
  const success = readMessage(searchParams?.success);

  const availableOrganizations = memberships.filter((membership) =>
    Boolean(membership.organization_id)
  );
  const organizationIds = availableOrganizations
    .map((membership) => membership.organization_id)
    .filter(Boolean) as string[];

  const entities =
    organizationIds.length > 0
      ? await listInstitutionalEntitiesForOrganizations(organizationIds)
      : [];

  const entityIds = entities.map((entity) => entity.id);
  const [invites, members] =
    entityIds.length > 0
      ? await Promise.all([
          listInstitutionalEntityInvites(entityIds),
          listInstitutionalEntityMembers(entityIds),
        ])
      : [[], []];

  const defaultOrganizationId = availableOrganizations[0]?.organization_id ?? "";
  const organizationNames = new Map(
    availableOrganizations.map((membership) => [
      membership.organization_id,
      membership.organization?.name ?? "Organizacao sem nome",
    ])
  );

  const invitesByEntity = new Map<string, typeof invites>();
  for (const invite of invites) {
    const current = invitesByEntity.get(invite.entity_id) ?? [];
    current.push(invite);
    invitesByEntity.set(invite.entity_id, current);
  }

  const membersByEntity = new Map<string, typeof members>();
  for (const member of members) {
    const current = membersByEntity.get(member.entity_id) ?? [];
    current.push(member);
    membersByEntity.set(member.entity_id, current);
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">Entidades</h1>
          <p className="text-sm text-slate-600">
            Cadastre entidades, gere convites por link/token e acompanhe os
            vinculos institucionais ja formalizados.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          Voltar
        </Link>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {availableOrganizations.length === 0 ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
          Voce ainda nao tem vinculo com uma organizacao. Entre em uma
          organizacao para cadastrar entidades e criar projetos.
        </section>
      ) : (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 space-y-1">
              <h2 className="text-base font-semibold text-slate-900">
                Nova entidade
              </h2>
              <p className="text-sm text-slate-600">
                Este cadastro ficara disponivel na criacao de novos projetos da
                organizacao.
              </p>
            </div>

            <form
              action={createInstitutionalEntityAction}
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Organizacao
                </label>
                <select
                  name="organization_id"
                  defaultValue={defaultOrganizationId}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  {availableOrganizations.map((membership) => (
                    <option
                      key={membership.organization_id}
                      value={membership.organization_id}
                    >
                      {membership.organization?.name ?? "Organizacao sem nome"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Tipo da entidade
                </label>
                <select
                  name="entity_type"
                  defaultValue=""
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="" disabled>
                    Selecione o tipo
                  </option>
                  <option value="empresa">Empresa</option>
                  <option value="entidade_publica">Entidade publica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Nome exibido
                </label>
                <input
                  name="display_name"
                  required
                  placeholder="Ex: Secretaria Municipal de Cultura"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Razao social ou nome formal
                </label>
                <input
                  name="legal_name"
                  placeholder="Opcional"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  CNPJ ou documento
                </label>
                <input
                  name="tax_id"
                  placeholder="Opcional"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  E-mail de contato
                </label>
                <input
                  name="contact_email"
                  type="email"
                  placeholder="Opcional"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Telefone de contato
                </label>
                <input
                  name="contact_phone"
                  placeholder="Opcional"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto"
                >
                  Cadastrar entidade
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Entidades cadastradas
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Gere convites por link/token e acompanhe membros ativos sem sair
                desta area.
              </p>
            </div>

            {entities.length === 0 ? (
              <div className="p-5 text-sm text-slate-600">
                Nenhuma entidade foi cadastrada ainda.
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {entities.map((entity) => {
                  const entityInvites = (
                    invitesByEntity.get(entity.id) ?? []
                  ).slice(0, 3);
                  const entityMembers = (
                    membersByEntity.get(entity.id) ?? []
                  ).slice(0, 3);

                  return (
                    <li key={entity.id} className="space-y-4 p-5">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900">
                              {entity.display_name}
                            </h3>

                            <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                              {entityTypeLabel(entity.entity_type)}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600">
                            Organizacao:{" "}
                            <span className="font-medium text-slate-900">
                              {organizationNames.get(entity.organization_id) ??
                                "Organizacao sem nome"}
                            </span>
                          </p>

                          <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                            <p>
                              Nome formal:{" "}
                              <span className="text-slate-900">
                                {shortValue(entity.legal_name)}
                              </span>
                            </p>
                            <p>
                              Documento:{" "}
                              <span className="text-slate-900">
                                {shortValue(entity.tax_id)}
                              </span>
                            </p>
                            <p>
                              E-mail:{" "}
                              <span className="text-slate-900">
                                {shortValue(entity.contact_email)}
                              </span>
                            </p>
                            <p>
                              Telefone:{" "}
                              <span className="text-slate-900">
                                {shortValue(entity.contact_phone)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <InviteEntityMemberButton
                            entityId={entity.id}
                            entityName={entity.display_name}
                          />

                          <Link
                            href="/dashboard/projects/new"
                            className="inline-flex items-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Usar em projeto
                          </Link>
                        </div>
                      </div>

                      <div className="grid gap-4 xl:grid-cols-2">
                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">
                                Convites recentes
                              </h4>
                              <p className="mt-1 text-xs text-slate-600">
                                Ultimos convites gerados para esta entidade.
                              </p>
                            </div>

                            <span className="text-xs font-medium text-slate-500">
                              {invitesByEntity.get(entity.id)?.length ?? 0} total
                            </span>
                          </div>

                          <div className="mt-3 space-y-3">
                            {entityInvites.length === 0 ? (
                              <p className="text-sm text-slate-600">
                                Nenhum convite gerado ainda.
                              </p>
                            ) : (
                              entityInvites.map((invite) => (
                                <div
                                  key={invite.id}
                                  className="rounded-lg border border-slate-200 bg-white p-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-medium text-slate-900">
                                      {invite.email}
                                    </p>
                                    <span
                                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${inviteStatusClass(
                                        invite.status
                                      )}`}
                                    >
                                      {inviteStatusLabel(invite.status)}
                                    </span>
                                  </div>
                                  <p className="mt-2 text-xs text-slate-600">
                                    Papel: {memberRoleLabel(invite.role)} | Expira
                                    em {formatDateTime(invite.expires_at)}
                                  </p>

                                  {String(invite.status ?? "").toUpperCase() ===
                                  "PENDING" ? (
                                    <form
                                      action={
                                        revokeInstitutionalEntityInviteAction
                                      }
                                      className="mt-3"
                                    >
                                      <input
                                        type="hidden"
                                        name="invite_id"
                                        value={invite.id}
                                      />
                                      <button
                                        type="submit"
                                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                      >
                                        Revogar convite
                                      </button>
                                    </form>
                                  ) : null}
                                </div>
                              ))
                            )}
                          </div>
                        </section>

                        <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-semibold text-slate-900">
                                Membros vinculados
                              </h4>
                              <p className="mt-1 text-xs text-slate-600">
                                Usuarios que ja aceitaram convite ou possuem
                                vinculo ativo.
                              </p>
                            </div>

                            <span className="text-xs font-medium text-slate-500">
                              {membersByEntity.get(entity.id)?.length ?? 0} ativos
                            </span>
                          </div>

                          <div className="mt-3 space-y-3">
                            {entityMembers.length === 0 ? (
                              <p className="text-sm text-slate-600">
                                Nenhum membro ativo vinculado ainda.
                              </p>
                            ) : (
                              entityMembers.map((member) => (
                                <div
                                  key={member.id}
                                  className="rounded-lg border border-slate-200 bg-white p-3"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <p className="text-sm font-medium text-slate-900">
                                        {member.profile?.full_name ??
                                          member.profile?.email ??
                                          member.user_id}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {member.profile?.email ?? "Sem e-mail"}
                                      </p>
                                    </div>

                                    <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                      {memberRoleLabel(member.role)}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </section>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
