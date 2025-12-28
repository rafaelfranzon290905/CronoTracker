export type Collaborador = {
  colaborador_id: number;      
  nome_colaborador: string;   
  cargo: string;
  email: string;
  data_admissao: string | null;
  status: boolean;            
  // foto?: string | null;        //ainda nao vamos implementar
};

export interface Usuario {
  usuario_id: number;
  nome_completo: string;
  nome_usuario: string;
  email: string;
  cargo: 'Gerente' | 'Colaborador';
  status: boolean;
}