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
import { type Projeto } from "@/lib/projects";



export const columns: ColumnDef<Projeto>[] = [
 {
    accessorKey: "idProjeto",
    header: "ID Projeto",
    cell: ({ row }) => <span>{row.getValue("idProjeto")}</span>,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome do Projeto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "cliente",
    header: "Cliente",
    cell: ({ row }) => {
      const cliente = row.getValue("cliente") as string;
      return <Badge variant="outline">{cliente}</Badge>;
    },
  },
  {
    accessorKey: "Descricao",
    header: "Descrição",
    cell: ({ row }) => <span>{row.getValue("Descricao")}</span>,
  },
  {
    accessorKey: "dataEntrada",
    header: "Data de Início",
    cell: ({ row }) => {
      const data = row.getValue("dataEntrada") as string;
      const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
      return <span>{dataFormatada}</span>;
    },
  },
  {
    accessorKey: "dataFim",
    header: "Data de Fim",
    cell: ({ row }) => {
      const data = row.getValue("dataFim") as string;
      const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
      return <span>{dataFormatada}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as boolean;
      return (
        <Badge variant={status ? "default" : "secondary"}>
          {status ? "Em andamento" : "Concluído"}
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