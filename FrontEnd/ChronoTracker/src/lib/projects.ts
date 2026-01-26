// export type Projeto = {
//   projeto_id: number;
//   nome_projeto: string;
//   cliente_id: number;
//   clientes?: { 
//     nome_cliente: string;
//   };
//   descricao: string;
//   data_inicio: string; 
//   data_fim: string;
//   status: boolean;
//   atividades?: {
//     atividade_id: number;
//     nome_atividade: string;
//     status: boolean;
//   }[];
//   projeto_colaboradores?: {
//       colaboradores: {
//         colaborador_id: number;
//         nome_colaborador: string;
//       }
//     }[];
// };

export interface Projeto {
    projeto_id: number;
    cliente_id: number;
    nome_projeto: string;
    descricao?: string;
    data_inicio: string;
    data_fim: string;
    status: boolean;
    horas_previstas: number; // <-- Novo campo
    horas_consumidas?: number;
    clientes?: {
        nome_cliente: string;
    };
    atividades?: {
      atividade_id: number;
        nome_atividade: string;
        status: boolean;
    }[];
    projeto_colaboradores?: {
      colaboradores: {
        colaborador_id: number;
        nome_colaborador: string;
      }
    }[];
}