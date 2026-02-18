export type ProjectStatus = 'Ativo' | 'Em Análise' | 'Concluído';
export type OrganizationIcon = 'school' | 'sprout' | 'users' | 'building' | 'folder';

export type Project = {
  id: string;
  nome: string;
  codigo: string;
  organizacao: string;
  organizacaoIcon: OrganizationIcon;
  inicio: string;
  fim: string;
  valor: string;
  status: ProjectStatus;
};

export const mockProjects: Project[] = [
  {
    id: 'proj-2023-001',
    nome: 'Educação para Todos',
    codigo: 'PROJ-2023-001',
    organizacao: 'Instituto Crescer',
    organizacaoIcon: 'school',
    inicio: '10/01/2023',
    fim: '15/12/2023',
    valor: 'R$ 150.000,00',
    status: 'Ativo',
  },
  {
    id: 'proj-2023-045',
    nome: 'Horta Comunitária Urbana',
    codigo: 'PROJ-2023-045',
    organizacao: 'ONG Vida Verde',
    organizacaoIcon: 'sprout',
    inicio: '01/03/2023',
    fim: '30/06/2024',
    valor: 'R$ 45.500,00',
    status: 'Em Análise',
  },
  {
    id: 'proj-2023-088',
    nome: 'Capacitação Digital',
    codigo: 'PROJ-2023-088',
    organizacao: 'Ação Solidária',
    organizacaoIcon: 'users',
    inicio: '15/02/2023',
    fim: '20/12/2023',
    valor: 'R$ 80.000,00',
    status: 'Ativo',
  },
  {
    id: 'proj-2022-112',
    nome: 'Reforma do Centro Comunitário',
    codigo: 'PROJ-2022-112',
    organizacao: 'Associação Moradores',
    organizacaoIcon: 'building',
    inicio: '01/01/2023',
    fim: '30/06/2023',
    valor: 'R$ 120.000,00',
    status: 'Concluído',
  },
  {
    id: 'proj-2023-156',
    nome: 'Esporte Jovem',
    codigo: 'PROJ-2023-156',
    organizacao: 'Clube Futuro',
    organizacaoIcon: 'folder',
    inicio: '15/04/2023',
    fim: '15/10/2024',
    valor: 'R$ 65.000,00',
    status: 'Em Análise',
  },
  {
    id: 'proj-2024-011',
    nome: 'Água Limpa para Comunidades',
    codigo: 'PROJ-2024-011',
    organizacao: 'ONG Vida Verde',
    organizacaoIcon: 'sprout',
    inicio: '12/01/2024',
    fim: '30/11/2024',
    valor: 'R$ 210.000,00',
    status: 'Ativo',
  },
  {
    id: 'proj-2024-026',
    nome: 'Biblioteca Itinerante',
    codigo: 'PROJ-2024-026',
    organizacao: 'Instituto Crescer',
    organizacaoIcon: 'school',
    inicio: '03/02/2024',
    fim: '14/12/2024',
    valor: 'R$ 95.000,00',
    status: 'Em Análise',
  },
  {
    id: 'proj-2024-039',
    nome: 'Feira de Empreendedorismo',
    codigo: 'PROJ-2024-039',
    organizacao: 'Ação Solidária',
    organizacaoIcon: 'users',
    inicio: '18/03/2024',
    fim: '20/09/2024',
    valor: 'R$ 58.000,00',
    status: 'Ativo',
  },
  {
    id: 'proj-2023-173',
    nome: 'Requalificação de Praça Pública',
    codigo: 'PROJ-2023-173',
    organizacao: 'Associação Moradores',
    organizacaoIcon: 'building',
    inicio: '21/05/2023',
    fim: '18/01/2024',
    valor: 'R$ 133.000,00',
    status: 'Concluído',
  },
  {
    id: 'proj-2024-052',
    nome: 'Laboratório de Inovação Social',
    codigo: 'PROJ-2024-052',
    organizacao: 'Clube Futuro',
    organizacaoIcon: 'folder',
    inicio: '11/04/2024',
    fim: '15/12/2024',
    valor: 'R$ 174.000,00',
    status: 'Em Análise',
  },
];
