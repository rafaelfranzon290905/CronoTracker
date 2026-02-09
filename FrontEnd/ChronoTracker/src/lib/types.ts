export type Collaborador = {
  colaborador_id: number;      
  nome_colaborador: string;
  total_atividades: number;
  cargo: string;
  email: string;
  data_admissao: string | null;
  atividades?: { atividade_id: number; nome_atividade: string; status: boolean }[];
  projeto_colaboradores?: { projetos: { nome_projeto: string } }[];
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
  colaborador_id: number;
}