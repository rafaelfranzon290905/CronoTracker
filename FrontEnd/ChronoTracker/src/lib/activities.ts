export type Atividades = {
  atividade_id: number;
  projeto_id: number;
  colaborador_id: number | null; 
  nome_atividade: string;
  prioridade?: "muito alta" | "alta" | "normal" | "baixa";
  descr_atividade: string;
  data_prevista_inicio: string | null; 
  data_prevista_fim: string | null;
  status: boolean; 
  responsavel?: {
    colaborador_id: number;
    nome_colaborador: string;
  } | null;
  projetos?: {
    nome_projeto: string;
  };
  horas_gastas?: number;
  lancamentos_de_horas?: any[];
};