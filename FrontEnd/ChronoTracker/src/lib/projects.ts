export interface Projeto {
    projeto_id: number;
    cliente_id: number;
    nome_projeto: string;
    descricao?: string;
    data_inicio: string;
    data_fim: string;
    status: "Orçando" | "Em Andamento" | "Concluído" | "Cancelado";
    horas_previstas: number; 
    total_despesas?: number;
    horas_gastas?: number;
    horas_consumidas?: number;
    clientes?: {
        cliente_id: number;
        nome_cliente: string;
    };
    atividades?: {
      atividade_id: number;
        nome_atividade: string;
        status: "Pendente" | "Em Andamento" | "Concluída" | "Cancelado";
    }[];
    projeto_colaboradores?: {
      colaboradores: {
        colaborador_id: number;
        nome_colaborador: string;
        cargo: string;
      }
    }[];
    despesas?: {
        despesa_id: number;
        tipo_despesa: string;
        data_despesa: string;
        valor: number;
        status_aprovacao: string;
        anexo: string;
        motivo_reprovacao?: string;
        colaborador?: {
            nome_colaborador: string;
        }
    }[];
}