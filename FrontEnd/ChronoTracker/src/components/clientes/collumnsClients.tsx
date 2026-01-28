import { type ColumnDef } from "@tanstack/react-table";
import { type Cliente } from "@/lib/clients";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Trash2, Eye, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModalCliente } from "./ModalClientes";

// Funções de formatação mantidas para consistência
const formatarCNPJ = (v: string) => v.replace(/\D/g, "").replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
const formatarCEP = (v: string) => v.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");

export const getColumns = (
  isGerente: boolean,
  onEdit: (cliente: Cliente) => void,
  onDelete: (id: number) => void,
  onViewProjects: (id: number, nome: string) => void
): ColumnDef<Cliente>[] => {
  const columns: ColumnDef<Cliente>[] = [
    {
      accessorKey: "nome_cliente",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Empresa <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue("nome_cliente")}</span>,
    },
    { accessorKey: "nome_contato", header: "Contato" },
    {
      accessorKey: "cnpj",
      header: "CNPJ",
      cell: ({ row }) => <span>{formatarCNPJ(row.getValue("cnpj"))}</span>,
    },
    {
      header: "Localização",
      cell: ({ row }) => `${row.original.cidade}/${row.original.estado}`,
    },
    {
      id: "projects",
      header: "Projetos",
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => onViewProjects(row.original.cliente_id, row.original.nome_cliente)}>
          <Eye className="mr-2 h-4 w-4" /> Ver
        </Button>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        return (
          <Badge variant={status ? "default" : "destructive"} className={status ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700 text-white"}>
            {status ? "Ativo" : "Inativo"}
          </Badge>
        );
      },
    },
  ];

  if (isGerente) {
    columns.push({
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(row.original.cliente_id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });
  }

  return columns;
};