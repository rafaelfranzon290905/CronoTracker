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
import { type Atividades } from "@/lib/activities";
// import { usePermissions } from "@/hooks/usePermissions";

const formatarData = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", { timeZone: 'UTC' });
  } catch {
    return dateString; // Retorna a string original em caso de erro
  }
};



// --- Definição das Colunas ---

type DeleteActivityHandler = (atividadeId: number) => Promise<void>;
type EditActivityHandler = (activity: Atividades) => void;


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
    enableGlobalFilter: true,
  },

  // 2. COLUNA: Projeto Vinculado 
  // NOTA: Se a API retornar o objeto de projeto, troque "projeto_id" por "projetos.nome"
  {
    accessorKey: "projetos.nome_projeto",
    header: "Projeto Vinculado",
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const atividade = row.original;
      // console.log("Dados da linha", atividade);
      const projeto = atividade.projetos?.nome_projeto;

      return (
        <Badge variant="outline" className="">
          {projeto || "Sem Projeto"}
        </Badge>
      );
      // const projetoId = row.getValue("projeto_id") as number | string;
      // return <Badge variant="outline">{projetoId}</Badge>; // Exibe o ID (ou o nome, se ajustado)
    },
  },
  {
    accessorKey: "responsavel.nome_colaborador",
    header: "Responsável",
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const atividade = row.original;

      const responsavel = atividade.responsavel;

      if (!responsavel) {
        return <span className="text-muted-foreground text-xs italic">Sem responsável</span>;
      }

      return (
        <div className="flex justify-center">
          <div
            title={responsavel.nome_colaborador}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-blue-900 text-[10px] font-bold text-white uppercase"
          >
            {responsavel.nome_colaborador?.substring(0, 2) || "??"}
          </div>
        </div>
      );
    }
  },

  // 3. COLUNA: Descrição
  {
    accessorKey: "descr_atividade",
    header: "Descrição",
    cell: ({ row }) => <span className="text-sm">{row.getValue("descr_atividade")}</span>,
  },

  // 4. COLUNA: Início Previsto
  {
    accessorKey: "data_prevista_inicio",
    header: "Início Previsto",
    cell: ({ row }) => {
      const data = row.getValue("data_prevista_inicio") as string;
      return <span>{formatarData(data)}</span>;
    },
  },

  // 5. COLUNA: Fim Previsto 
  {
    accessorKey: "data_prevista_fim",
    header: "Fim Previsto",
    cell: ({ row }) => {
      const data = row.getValue("data_prevista_fim") as string;
      return <span>{formatarData(data)}</span>;
    },
  },
  {
  accessorKey: "horas_gastas",
  header: "Horas Gastas",
  cell: ({ row }) => {
    const horas = row.getValue("horas_gastas") as number;
    return (
      <div className="font-medium text-blue-800">
        {horas ? `${horas.toFixed(1)}h` : "0h"}
      </div>
    );
  },
},

  // 6. COLUNA: Status 
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusBool = row.getValue("status") as boolean;
      return (
        <Badge variant={statusBool ? "default" : "secondary"}
          className={!statusBool ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}>
          {statusBool ? "Ativo" : "Inativo"}
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
      const atividade = row.original;
      const atividadeId = row.original.atividade_id;

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
              onClick={() => handleEditActivity(atividade)}
            >
              Editar Atividade
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={() => handleDeleteActivity(atividadeId)}
            >
              Excluir Atividade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const getAtividadesColumns = (
  isGerente: boolean,
  handleDeleteActivity: DeleteActivityHandler,
  handleEditActivity: EditActivityHandler
): ColumnDef<Atividades>[] => {

  // 1. Gera o array COMPLETO de colunas, passando os handlers
  const allColumns = columns(handleDeleteActivity, handleEditActivity);

  if (isGerente) {
    // Se for gerente, retorna todas as colunas
    return allColumns;
  }

  // 2. Se não for gerente, filtra a coluna 'actions' (pelo id: "actions")
  return allColumns.filter(column => column.id !== 'actions');
}