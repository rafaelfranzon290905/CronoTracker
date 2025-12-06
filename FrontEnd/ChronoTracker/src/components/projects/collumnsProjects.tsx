import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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

const deleteProject = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este projeto? Essa ação não pode ser desfeita.")) {
        try {
            const response = await fetch(`http://localhost:3001/projetos/${id}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                alert("Projeto excluído com sucesso!");
                window.location.reload(); 
            } else {
                alert("Erro ao excluir projeto.");
            }
        } catch (error) {
            console.error("Erro de conexão:", error);
            alert("Erro ao conectar com o servidor.");
        }
    }
};


export const columns: ColumnDef<Projeto>[] = [
 {
    accessorKey: "projeto_id",
    header: "ID",
    cell: ({ row }) => <span>{row.getValue("projeto_id")}</span>,
  },
  {
    accessorKey: "nome_projeto",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome do Projeto
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium">{row.getValue("nome_projeto")}</span>,
  },
  {
    accessorKey: "clientes.nome_cliente",
    header: "Cliente",
    cell: ({ row }) => {
      const nomeCliente = row.original.clientes?.nome_cliente || "Sem Cliente";
      return <Badge variant="outline">{nomeCliente}</Badge>;
    },
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ row }) => <span className="truncate max-w-[200px] block" title={row.getValue("descricao")}>{row.getValue("descricao")}</span>,
  },
  {
    accessorKey: "data_inicio",
    header: "Data de Início",
    cell: ({ row }) => {
      const data = row.getValue("data_inicio") as string;
      const dataFormatada = new Date(data).toLocaleDateString("pt-BR");
      return <span>{dataFormatada}</span>;
    },
  },
  {
    accessorKey: "data_fim",
    header: "Data de Fim",
    cell: ({ row }) => {
      const data = row.getValue("data_fim") as string;
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
        <Badge variant={status ? "default" : "destructive"}>
          {status ? "Ativo" : "Inativo"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const projeto = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50 min-w-[160px] rounded-md p-1">
            <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-center">Ações</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-100 h-px my-1" />
            <DropdownMenuItem className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none hover:bg-gray-100 cursor-pointer rounded-sm transition-colors">
              <Edit className="h-4 w-4 text-blue-900" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
                onClick={() => deleteProject(projeto.projeto_id)}
                className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none hover:bg-red-50 cursor-pointer rounded-sm text-red-600 focus:text-red-600 transition-colors"
            >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];