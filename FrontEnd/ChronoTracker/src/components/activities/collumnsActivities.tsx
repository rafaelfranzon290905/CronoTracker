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



export const columns: ColumnDef<Atividades>[] = [
   {
    accessorKey: "nome_atividade",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome da Atividade
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("nome_atividade")}</span>,
  },
  {
    accessorKey: "projeto_id",
    header: "Projeto Vinculado",
    cell: ({ row }) => {
      const projeto = row.getValue("projeto_id") as string;
      return <Badge variant="outline">{projeto}</Badge>;
    },
  },
  {
    accessorKey: "descr_atividade",
    header: "Descrição",
    cell: ({ row }) => <span>{row.getValue("descr_atividade")}</span>,
  },
  {
    accessorKey: "data_prevista_inicio",
    header: "Início Previsto",
    cell: ({ row }) => {
      const data = row.getValue("data_prevista_inicio") as string;
      const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
      return <span>{dataFormatada}</span>;
    },
  },
  {
    accessorKey: "data_prevista_fim",
    header: "Fim Previsto",
    cell: ({ row }) => {
      const data = row.getValue("data_prevista_fim") as string;
      const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
      return <span>{dataFormatada}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const label = 
        status === "em_andamento"
          ? "Em andamento"
          : status === "concluido"
          ? "Concluído"
          : "A fazer";
      const variant =
        status === "em_andamento"
          ? "default" : status === "concluido"
          ? "secondary"
          : "outline";
      return (
        <Badge variant={variant}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ações</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Editar Projeto</DropdownMenuItem>
          <DropdownMenuItem>Excluir Projeto</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];