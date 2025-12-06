export type Projeto = {
  projeto_id: number;
  nome_projeto: string;
  cliente_id: number;
  clientes?: { 
    nome_cliente: string;
  };
  descricao: string;
  data_inicio: string; 
  data_fim: string;
  status: boolean;
};