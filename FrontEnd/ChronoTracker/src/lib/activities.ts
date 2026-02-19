export type Atividades = {
  atividade_id: number;
  projeto_id: number;
  nome_atividade: string;
  prioridade?: "muito alta" | "alta" | "normal" | "baixa";
  descr_atividade: string;
  data_prevista_inicio: string | null; 
  data_prevista_fim: string | null;
  status: "Pendente" | "Em Andamento" | "Concluída" | "Cancelado"; 
  horas_previstas: number;
  colaboradores_atividades: Array<{
    colaborador_id: number; 
    colaboradores: {
      colaborador_id: number; 
      nome_colaborador: string;
    };
  }>;
  projetos?: {
    nome_projeto: string;
    horas_previstas?: number;
  };
  horas_gastas?: number;
  lancamentos_de_horas?: any[];
};