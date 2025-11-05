export type Atividades = {
  idAtividade: string;
  projeto_id: string;        
  nome_atividade: string;
  descr_atividade: string;
  dataInicioAtividade: string;  
  dataFimAtividade: string;  
  status: "a_fazer" | "em_andamento" | "concluido";
};