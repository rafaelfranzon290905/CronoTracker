export type Atividades = {
  // idAtividade: string;
  // projeto_id: string;        
  // nome_atividade: string;
  // descr_atividade: string;
  // dataInicioAtividade: string;  
  // dataFimAtividade: string;  
  // status: boolean;

  atividade_id: number;
  projeto_id: number;
  nome_atividade: string;
  descr_atividade: string;
  data_prevista_inicio: string | null; 
  data_prevista_fim: string | null;
  status: boolean; 
  projetos?: {nome_projeto: string};
};