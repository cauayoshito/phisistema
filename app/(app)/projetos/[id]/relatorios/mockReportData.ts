export type ReportPeriod = 'q1-2023' | 'q2-2023' | 'q3-2023' | 'q4-2023';

export type ExecutionItem = {
  atividade: string;
  status: 'Concluído' | 'Em Andamento' | 'Não Iniciado';
  progresso: number;
  comentarios: string;
};

export type IndicatorItem = {
  indicador: string;
  meta: number;
  realizado: number;
  desvio: string;
};

export type Attachment = {
  id: string;
  nome: string;
  tipo: 'pdf' | 'image';
  tamanho: string;
};

export type ReportData = {
  execution: ExecutionItem[];
  indicators: IndicatorItem[];
  narrative: string;
  audienceCards: {
    familias: number;
    individuos: number;
  };
  finance: {
    orcamentoTotal: number;
    executado: number;
    saldo: number;
  };
  attachments: Attachment[];
};

export const mockReportPeriods: ReportPeriod[] = ['q1-2023', 'q2-2023', 'q3-2023', 'q4-2023'];

export const mockReportDataByPeriod: Record<ReportPeriod, ReportData> = {
  'q1-2023': {
    execution: [
      {
        atividade: 'Mobilização comunitária inicial',
        status: 'Concluído',
        progresso: 100,
        comentarios: 'Meta de participação superada em 12%.',
      },
      {
        atividade: 'Estruturação de turmas',
        status: 'Concluído',
        progresso: 100,
        comentarios: 'Três turmas montadas e em operação.',
      },
      {
        atividade: 'Oficinas de inclusão digital',
        status: 'Em Andamento',
        progresso: 45,
        comentarios: 'Necessário reforço de instrutores.',
      },
    ],
    indicators: [
      { indicador: 'Participantes ativos', meta: 80, realizado: 76, desvio: '-5.0%' },
      { indicador: 'Satisfação (NPS)', meta: 70, realizado: 79, desvio: '+12.9%' },
      { indicador: 'Parcerias locais', meta: 3, realizado: 2, desvio: '-33.3%' },
    ],
    narrative:
      'Período focado em preparação e engajamento inicial. Houve boa adesão das famílias, com destaque para oficinas introdutórias.',
    audienceCards: { familias: 118, individuos: 322 },
    finance: { orcamentoTotal: 50000, executado: 14250, saldo: 35750 },
    attachments: [
      { id: 'a1', nome: 'Plano_Execucao_Q1.pdf', tipo: 'pdf', tamanho: '1.9 MB' },
      { id: 'a2', nome: 'Registro_Oficina_01.jpg', tipo: 'image', tamanho: '3.1 MB' },
    ],
  },
  'q2-2023': {
    execution: [
      {
        atividade: 'Capacitação de facilitadores',
        status: 'Concluído',
        progresso: 100,
        comentarios: 'Equipe técnica ampliada para o ciclo.',
      },
      {
        atividade: 'Atendimentos individuais',
        status: 'Em Andamento',
        progresso: 70,
        comentarios: 'Demanda maior que o previsto.',
      },
      {
        atividade: 'Ajuste de infraestrutura',
        status: 'Não Iniciado',
        progresso: 0,
        comentarios: 'Aguardando orçamento complementar.',
      },
    ],
    indicators: [
      { indicador: 'Participantes certificados', meta: 45, realizado: 38, desvio: '-15.6%' },
      { indicador: 'Frequência média', meta: 85, realizado: 81, desvio: '-4.7%' },
      { indicador: 'Novos voluntários', meta: 10, realizado: 12, desvio: '+20.0%' },
    ],
    narrative:
      'A execução avançou de forma estável, com necessidade de reforço logístico. A adesão de voluntários ajudou a manter as atividades centrais.',
    audienceCards: { familias: 134, individuos: 368 },
    finance: { orcamentoTotal: 50000, executado: 24800, saldo: 25200 },
    attachments: [
      { id: 'b1', nome: 'Relatorio_Atividades_Q2.pdf', tipo: 'pdf', tamanho: '2.3 MB' },
      { id: 'b2', nome: 'Foto_Encontro_Comunitario.png', tipo: 'image', tamanho: '4.0 MB' },
    ],
  },
  'q3-2023': {
    execution: [
      {
        atividade: 'Capacitação de Jovens',
        status: 'Concluído',
        progresso: 100,
        comentarios: '3 turmas formadas com sucesso.',
      },
      {
        atividade: 'Reforma do Espaço Comunitário',
        status: 'Em Andamento',
        progresso: 65,
        comentarios: 'Atraso na entrega de materiais.',
      },
      {
        atividade: 'Workshop de Empreendedorismo',
        status: 'Não Iniciado',
        progresso: 0,
        comentarios: 'Previsto para próximo mês.',
      },
    ],
    indicators: [
      { indicador: 'Participantes Certificados', meta: 50, realizado: 48, desvio: '-4.0%' },
      { indicador: 'Satisfação (NPS)', meta: 75, realizado: 82, desvio: '+9.3%' },
      { indicador: 'Novas Parcerias', meta: 2, realizado: 2, desvio: '0.0%' },
    ],
    narrative:
      'O trimestre apresentou boa evolução no eixo formativo, com destaque para a satisfação do público e ganhos qualitativos no vínculo comunitário.',
    audienceCards: { familias: 150, individuos: 432 },
    finance: { orcamentoTotal: 50000, executado: 35000, saldo: 15000 },
    attachments: [
      { id: 'c1', nome: 'Relatorio_Fotos_Q3.pdf', tipo: 'pdf', tamanho: '2.4 MB' },
      { id: 'c2', nome: 'Evidencia_Aula_01.jpg', tipo: 'image', tamanho: '4.1 MB' },
    ],
  },
  'q4-2023': {
    execution: [
      {
        atividade: 'Fechamento de ciclo anual',
        status: 'Em Andamento',
        progresso: 88,
        comentarios: 'Pendências em validação documental.',
      },
      {
        atividade: 'Evento de encerramento',
        status: 'Concluído',
        progresso: 100,
        comentarios: 'Participação acima do esperado.',
      },
      {
        atividade: 'Plano para 2024',
        status: 'Não Iniciado',
        progresso: 0,
        comentarios: 'Aguardando definição de orçamento.',
      },
    ],
    indicators: [
      { indicador: 'Taxa de conclusão', meta: 90, realizado: 87, desvio: '-3.3%' },
      { indicador: 'Retenção de participantes', meta: 80, realizado: 78, desvio: '-2.5%' },
      { indicador: 'Parcerias renovadas', meta: 4, realizado: 5, desvio: '+25.0%' },
    ],
    narrative:
      'Fase de consolidação com resultados consistentes. A equipe está preparando expansão para o próximo período.',
    audienceCards: { familias: 162, individuos: 451 },
    finance: { orcamentoTotal: 50000, executado: 42100, saldo: 7900 },
    attachments: [
      { id: 'd1', nome: 'Resumo_Q4_2023.pdf', tipo: 'pdf', tamanho: '1.8 MB' },
      { id: 'd2', nome: 'Registro_Encerramento.jpg', tipo: 'image', tamanho: '3.5 MB' },
    ],
  },
};
