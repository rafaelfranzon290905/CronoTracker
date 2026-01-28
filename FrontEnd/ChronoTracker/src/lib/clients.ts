export interface Cliente {
  cliente_id: number;
  cnpj: string;
  nome_cliente: string;
  nome_contato: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  status: boolean;
}