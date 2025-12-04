import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// Assumindo que a interface Atividades reflete a estrutura de dados correta
import { type Atividades } from "@/lib/activities"; 


// --- Funções Auxiliares de Formatação ---

/**
 * Formata a data de uma string para o formato DD/MM/AAAA (pt-BR).
 * @param dateString A string de data vinda da API.
 * @returns A data formatada ou uma string vazia se a data for inválida.
 */
const formatarData = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString("pt-BR");
  } catch {
    return dateString; // Retorna a string original em caso de erro
  }
};

/**
 * Define o rótulo e a variante da Badge com base no status.
 * @param status O valor do status da atividade (ex: "em_andamento").
 * @returns Um objeto contendo label (texto) e variant (estilo da badge).
 */
const getStatusBadgeProps = (status: string | null | undefined) => {
  switch (status) {
    case "em_andamento":
      return { label: "Em andamento", variant: "default" as const };
    case "concluido":
      return { label: "Concluído", variant: "secondary" as const };
    case "a_fazer":
      return { label: "A Fazer", variant: "outline" as const };
    default:
      return { label: "Não Definido", variant: "outline" as const };
  }
};

type DeleteActivityHandler = (atividadeId: number) => Promise<void>;
type EditActivityHandler = (atividadeId: number) => void;
// --- Definição das Colunas ---

export const columns = (handleDeleteActivity: DeleteActivityHandler, handleEditActivity: EditActivityHandler): ColumnDef<Atividades>[] => [
  // 1. COLUNA: Nome da Atividade (Com Ordenação)
  {
    accessorKey: "nome_atividade",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-0 py-0 h-auto" // Otimiza o estilo do botão de ordenação
      >
        Nome da Atividade
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-medium text-left">{row.getValue("nome_atividade")}</span>
    ),
    enableHiding: false, // Geralmente útil manter o nome visível
  },

  // 2. COLUNA: Projeto Vinculado (Se a API retorna apenas o ID)
  // NOTA: Se a API retornar o objeto de projeto, troque "projeto_id" por "projetos.nome"
  {
    accessorKey: "projeto_id",
    header: "Projeto Vinculado",
    cell: ({ row }) => {
      const projetoId = row.getValue("projeto_id") as number | string;
      return <Badge variant="outline">{projetoId}</Badge>; // Exibe o ID (ou o nome, se ajustado)
    },
  },

  // 3. COLUNA: Descrição
  {
    accessorKey: "descr_atividade",
    header: "Descrição",
    cell: ({ row }) => <span className="text-sm">{row.getValue("descr_atividade")}</span>,
  },

  // 4. COLUNA: Início Previsto (Com Formatação de Data)
  {
    accessorKey: "data_prevista_inicio",
    header: "Início Previsto",
    cell: ({ row }) => {
      const data = row.getValue("data_prevista_inicio") as string;
      return <span>{formatarData(data)}</span>;
    },
  },

  // 5. COLUNA: Fim Previsto (Com Formatação de Data)
  {
    accessorKey: "data_prevista_fim",
    header: "Fim Previsto",
    cell: ({ row }) => {
      const data = row.getValue("data_prevista_fim") as string;
      return <span>{formatarData(data)}</span>;
    },
  },

  // 6. COLUNA: Status (Com Badge e Lógica Separada)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const { label, variant } = getStatusBadgeProps(status);
      return (
        <Badge variant={variant}>
          {label}
        </Badge>
      );
    },
  },

  // 7. COLUNA: Ações (Dropdown Menu)
  {
    id: "actions",
    header: "Ações",
    enableHiding: false,
    cell: ({ row }) => {
      const ativdadeId = Number(req.params.atividade_id);
      console.log("ID enviado para a edição: ", ativdadeId)
      if (!Number.isInteger(atividadeId)) {
        return res.status(400).json({ error: "ID inválido." });
}

    
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                onClick={() => handleEditActivity(ativdadeId)}
            >
                Editar Atividade
            </DropdownMenuItem>
            <DropdownMenuItem 
                className="text-red-600 focus:text-red-700"
                onClick={() => handleDeleteActivity(ativdadeId)}
            >
                Excluir Atividade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];