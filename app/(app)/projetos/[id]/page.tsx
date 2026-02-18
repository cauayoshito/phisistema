'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  FileText,
  Info,
  Paperclip,
  Send,
  Users,
} from 'lucide-react';
import { mockProjects } from '../mockProjects';

type ProcessStep =
  | 'Prospecção Inicial'
  | 'Em Análise Técnica'
  | 'Aprovado para Captação'
  | 'Em Execução';

type TargetAudience =
  | 'Crianças'
  | 'Adolescentes'
  | 'Jovens Adultos'
  | 'Idosos'
  | 'Mulheres'
  | 'PCDs'
  | 'Famílias'
  | 'Comunidade Local';

type ProjectFormState = {
  nomeProjeto: string;
  organizacaoResponsavel: string;
  dataInicio: string;
  dataTermino: string;
  valorSolicitado: string;
  uf: string;
  areaAtuacao: string;
  etapaProcesso: ProcessStep;
  publicoAlvo: TargetAudience[];
  observacoes: string;
};

const targetAudienceOptions: Array<{ value: TargetAudience; label: string }> = [
  { value: 'Crianças', label: 'Crianças (0-12)' },
  { value: 'Adolescentes', label: 'Adolescentes' },
  { value: 'Jovens Adultos', label: 'Jovens Adultos' },
  { value: 'Idosos', label: 'Idosos (+60)' },
  { value: 'Mulheres', label: 'Mulheres' },
  { value: 'PCDs', label: 'PCDs' },
  { value: 'Famílias', label: 'Famílias' },
  { value: 'Comunidade Local', label: 'Comunidade Local' },
];

function parseDate(value: string) {
  const [day, month, year] = value.split('/');
  if (!day || !month || !year) {
    return '';
  }

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function buildInitialState(project?: (typeof mockProjects)[number]): ProjectFormState {
  return {
    nomeProjeto: project?.nome ?? '',
    organizacaoResponsavel: project?.organizacao ?? '',
    dataInicio: project ? parseDate(project.inicio) : '',
    dataTermino: project ? parseDate(project.fim) : '',
    valorSolicitado: project?.valor.replace('R$ ', '') ?? '',
    uf: '',
    areaAtuacao: '',
    etapaProcesso: 'Prospecção Inicial',
    publicoAlvo: [],
    observacoes: '',
  };
}

export default function ProjetoDetalhesPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const projectId = useMemo(() => {
    const currentId = params?.id;
    return Array.isArray(currentId) ? currentId[0] : currentId;
  }, [params]);

  const project = useMemo(
    () => mockProjects.find((item) => item.id === projectId),
    [projectId]
  );

  const draftStorageKey = useMemo(
    () => (projectId ? `phi:project:draft:${projectId}` : ''),
    [projectId]
  );

  const [formState, setFormState] = useState<ProjectFormState>(() =>
    buildInitialState(project)
  );

  useEffect(() => {
    if (!project) {
      return;
    }

    const fallbackState = buildInitialState(project);
    if (!draftStorageKey) {
      setFormState(fallbackState);
      return;
    }

    const serializedDraft = localStorage.getItem(draftStorageKey);
    if (!serializedDraft) {
      setFormState(fallbackState);
      return;
    }

    try {
      const parsedDraft = JSON.parse(serializedDraft) as Partial<ProjectFormState>;
      setFormState({ ...fallbackState, ...parsedDraft });
    } catch {
      setFormState(fallbackState);
    }
  }, [draftStorageKey, project]);

  if (!project) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Projeto não encontrado</h1>
          <p className="mt-2 text-sm text-slate-600">
            O projeto informado não foi encontrado na base mock.
          </p>
          <button
            type="button"
            onClick={() => router.push('/projetos')}
            className="mt-6 inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            Voltar para Projetos
          </button>
        </div>
      </div>
    );
  }

  const toggleAudience = (audience: TargetAudience) => {
    setFormState((current) => {
      const alreadySelected = current.publicoAlvo.includes(audience);
      const nextAudience = alreadySelected
        ? current.publicoAlvo.filter((item) => item !== audience)
        : [...current.publicoAlvo, audience];

      return {
        ...current,
        publicoAlvo: nextAudience,
      };
    });
  };

  const handleSaveDraft = () => {
    if (!draftStorageKey) {
      return;
    }

    localStorage.setItem(draftStorageKey, JSON.stringify(formState));
    alert('Rascunho salvo (mock).');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      id: project.id,
      codigo: project.codigo,
      ...formState,
    };

    console.log('Project submit payload (mock):', payload);
    alert('Enviado (mock).');
  };

  return (
    <div className="mx-auto w-full max-w-7xl pb-10">
      <div className="mb-8">
        <nav className="mb-4 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/dashboard" className="transition-colors hover:text-primary">
            Home
          </Link>
          <ChevronRight className="size-4" />
          <Link href="/projetos" className="transition-colors hover:text-primary">
            Projetos
          </Link>
          <ChevronRight className="size-4" />
          <span className="font-medium text-slate-900">Dados do Projeto</span>
        </nav>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dados do Projeto</h1>
            <p className="mt-1 text-sm text-slate-500">
              Preencha as informações detalhadas para submissão do projeto social.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              <Info className="size-4" />
              <span>Status: Rascunho Inicial</span>
            </div>
            {projectId && (
              <Link
                href={`/projetos/${projectId}/relatorios`}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
              >
                <BarChart3 className="size-4" />
                Ver Relatórios
              </Link>
            )}
          </div>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <FileText className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Informações Gerais</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Nome do Projeto <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.nomeProjeto}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    nomeProjeto: event.target.value,
                  }))
                }
                placeholder="Ex: Programa Jovens do Futuro"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="lg:col-span-4">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Organização Responsável <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={formState.organizacaoResponsavel}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    organizacaoResponsavel: event.target.value,
                  }))
                }
                placeholder="Nome da ONG ou Instituição"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Data de Início</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={formState.dataInicio}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      dataInicio: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Data de Término</label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={formState.dataTermino}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      dataTermino: event.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Valor Solicitado (R$)</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                  R$
                </span>
                <input
                  type="text"
                  value={formState.valorSolicitado}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      valorSolicitado: event.target.value,
                    }))
                  }
                  placeholder="0,00"
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">UF (Localização)</label>
              <select
                value={formState.uf}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    uf: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecione</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="BA">Bahia</option>
              </select>
            </div>

            <div className="lg:col-span-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Área de Atuação</label>
              <select
                value={formState.areaAtuacao}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    areaAtuacao: event.target.value,
                  }))
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecione a área principal</option>
                <option value="educacao">Educação</option>
                <option value="saude">Saúde</option>
                <option value="meio_ambiente">Meio Ambiente</option>
                <option value="cultura">Cultura</option>
                <option value="esporte">Esporte e Lazer</option>
              </select>
            </div>

            <div className="lg:col-span-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Etapa do Processo</label>
              <select
                value={formState.etapaProcesso}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    etapaProcesso: event.target.value as ProcessStep,
                  }))
                }
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Prospecção Inicial">Prospecção Inicial</option>
                <option value="Em Análise Técnica">Em Análise Técnica</option>
                <option value="Aprovado para Captação">Aprovado para Captação</option>
                <option value="Em Execução">Em Execução</option>
              </select>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <Users className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Público Alvo</h3>
          </div>

          <div className="p-6">
            <p className="mb-4 text-sm text-slate-500">
              Selecione todos os grupos beneficiários diretos do projeto.
            </p>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {targetAudienceOptions.map((audience) => {
                const checked = formState.publicoAlvo.includes(audience.value);
                return (
                  <label
                    key={audience.value}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAudience(audience.value)}
                      className="size-5 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-slate-700 transition-colors group-hover:text-primary">
                      {audience.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <FileText className="size-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Observações e Detalhes</h3>
          </div>

          <div className="p-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Descrição detalhada ou anotações internas
            </label>
            <textarea
              value={formState.observacoes}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  observacoes: event.target.value,
                }))
              }
              placeholder="Descreva aqui os objetivos específicos, metodologia de aplicação ou qualquer observação relevante para os investidores e consultores..."
              className="min-h-[160px] w-full rounded-lg border border-slate-300 p-4 text-sm leading-relaxed text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400">Mínimo de 100 caracteres.</span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-blue-700"
              >
                <Paperclip className="size-4" />
                Anexar Documentos
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse items-center justify-end gap-4 pb-12 pt-4 sm:flex-row">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="h-12 w-full rounded-lg border border-slate-300 bg-white px-6 font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
          >
            Salvar Rascunho
          </button>
          <button
            type="submit"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 font-bold text-white shadow-md transition-colors hover:bg-blue-600 sm:w-auto"
          >
            <span>Enviar para análise</span>
            <Send className="size-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
