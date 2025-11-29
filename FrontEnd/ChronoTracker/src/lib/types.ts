export type Collaborador = {
  colaborador_id: number;      
  nome_colaborador: string;   
  cargo: string;
  email: string;
  data_admissao: string | null;
  status: boolean;            
  // foto?: string | null;        //ainda nao vamos implementar
};