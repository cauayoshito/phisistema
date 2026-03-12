"use client";

import Link from "next/link";
import { useState } from "react";

type ProjectType = "INCENTIVADO" | "RECURSOS_PUBLICOS" | "RECURSOS_PROPRIOS";

type OrganizationOption = {
  id: string;
  label: string;
};

type EntityOption = {
  id: string;
  organization_id: string;
  display_name: string;
  entity_type: string | null;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  organizations: OrganizationOption[];
  entities: EntityOption[];
  defaultOrganizationId: string;
  canSubmit: boolean;
};

function projectTypeLabel(type: ProjectType) {
  if (type === "INCENTIVADO") return "Incentivos Fiscais";
  if (type === "RECURSOS_PUBLICOS") return "Recursos Publicos";
  return "Recursos Proprios";
}

function entityTypeLabel(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized === "empresa") return "Empresa";
  if (normalized === "entidade_publica") return "Entidade publica";
  return "Tipo nao informado";
}

export default function NewProjectForm({
  action,
  organizations,
  entities,
  defaultOrganizationId,
  canSubmit,
}: Props) {
  const initialOrganizationId = defaultOrganizationId || organizations[0]?.id || "";
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    initialOrganizationId
  );
  const [selectedEntityId, setSelectedEntityId] = useState("");

  const filteredEntities = entities.filter(
    (entity) => entity.organization_id === selectedOrganizationId
  );

  const isSubmitDisabled =
    !canSubmit ||
    !selectedOrganizationId ||
    filteredEntities.length === 0 ||
    !selectedEntityId;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <h2 className="text-base font-semibold text-slate-900">
          Dados iniciais do projeto
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Todo projeto precisa nascer associado a uma empresa ou entidade
          publica cadastrada na organizacao.
        </p>
      </div>

      <form action={action} className="space-y-6 p-4 sm:p-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Nome do projeto
            </label>
            <input
              name="title"
              placeholder="Ex: Educacao no transito tambem e coisa de crianca"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Organizacao
            </label>
            <select
              name="organization_id"
              value={selectedOrganizationId}
              onChange={(event) => {
                setSelectedOrganizationId(event.target.value);
                setSelectedEntityId("");
              }}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            >
              {organizations.length === 0 ? (
                <option value="">Voce ainda nao tem organizacao vinculada</option>
              ) : (
                organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>
                    {organization.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Modelo do projeto
            </label>
            <select
              name="project_type"
              defaultValue="INCENTIVADO"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="INCENTIVADO">
                {projectTypeLabel("INCENTIVADO")}
              </option>
              <option value="RECURSOS_PUBLICOS">
                {projectTypeLabel("RECURSOS_PUBLICOS")}
              </option>
              <option value="RECURSOS_PROPRIOS">
                {projectTypeLabel("RECURSOS_PROPRIOS")}
              </option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Entidade vinculada
            </label>
            <select
              name="linked_entity_id"
              value={selectedEntityId}
              onChange={(event) => setSelectedEntityId(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            >
              <option value="" disabled>
                {filteredEntities.length === 0
                  ? "Nenhuma entidade ativa nesta organizacao"
                  : "Selecione uma entidade cadastrada"}
              </option>

              {filteredEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.display_name} - {entityTypeLabel(entity.entity_type)}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs text-slate-500">
              Ao trocar de organizacao, a entidade selecionada e limpa para
              evitar vinculos inconsistentes. Se a entidade ainda nao estiver
              disponivel, cadastre primeiro em{" "}
              <Link
                href="/dashboard/entities"
                className="font-medium text-blue-600 hover:underline"
              >
                Entidades
              </Link>
              .
            </p>

            {selectedOrganizationId && filteredEntities.length === 0 && (
              <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Esta organizacao ainda nao possui entidades ativas cadastradas.
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Status inicial
            </label>
            <input
              value="Rascunho"
              readOnly
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Resumo do projeto (opcional)
            </label>
            <textarea
              name="description"
              rows={4}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Escreva um resumo curto para contextualizar este projeto..."
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Ao criar o projeto, o sistema registra o vinculo estruturado com a
          entidade selecionada e salva o snapshot do nome e do tipo dessa
          entidade no proprio projeto.
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Link
            href="/dashboard/projects"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-center text-sm text-slate-700 hover:bg-slate-50 sm:w-auto"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isSubmitDisabled}
          >
            Criar projeto
          </button>
        </div>
      </form>
    </section>
  );
}
