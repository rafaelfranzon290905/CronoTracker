export type Collaborador = {
  colaborador_id: number;      
  nome_colaborador: string;
  total_atividades: number;
  cargo: string;
  email: string;
  data_admissao: string | null;
  total_horas?: number; 
  total_despesas_valor?: number;
  valor_despesas_aprovadas?: number;
  valor_despesas_pendentes?: number;
  atividades?: { atividade_id: number; nome_atividade: string; status: "Pendente" | "Em Andamento" | "Concluída" | "Cancelado"; projetos?: { nome_projeto: string }; }[];
  projeto_colaboradores?: { 
    projetos: { 
      projeto_id: number; 
      nome_projeto: string; 
    } 
  }[];
  lista_despesas?: {
    despesa_id: number;
    tipo_despesa: string;
    valor: number;
    data_despesa: string;
    status_aprovacao: string;
    projeto?: {
      nome_projeto: string;
    };
  }[];

  historico_lancamentos?: {
    lancamento_id: number;
    duracao_total: number;
    data_lancamento: string;
  }[];
  status: boolean;            
  // foto?: string | null;        //ainda nao vamos implementar
};

export interface Usuario {
  usuario_id: number;
  colaborador_id: number;
  nome_completo: string;
  nome_usuario: string;
  email: string;
  cargo: 'Gerente' | 'Colaborador' | string;
  status: boolean;
}