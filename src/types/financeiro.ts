export interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PlanoContas {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'receita' | 'despesa' | 'imposto' | 'custo' | 'ativo' | 'passivo';
  classe?: string;
  centro_custo_id?: string;
  descricao?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LancamentoFinanceiro {
  id: string;
  data: string;
  descricao?: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  plano_contas_id?: string;
  centro_custo_id?: string;
  vehicle_placa?: string;
  created_at: string;
}

export interface FolhaPagamento {
  id: string;
  funcionario_id: string;
  competencia: string;
  salario_base?: number;
  horas_extras?: number;
  descontos?: number;
  beneficios?: number;
  ferias?: boolean;
  ferias_inicio?: string;
  ferias_fim?: string;
  promocao?: boolean;
  nova_funcao?: string;
  exame_periodico?: string;
  created_at: string;
}
