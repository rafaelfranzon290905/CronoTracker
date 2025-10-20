import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Collaborador } from "@/lib/types";

// Função para formatar o CPF 
const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const columns: ColumnDef<Collaborador>[] = [
  // 1. Coluna de Seleção
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Selecionar todas as linhas"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Selecionar linha"
      />
    )
  },

  // 2. Coluna de Nome 
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium capitalize">{row.getValue("name")}</div>,
  },

  // 3. Coluna de CPF com formatação
  {
    accessorKey: "cpf",
    header: "CPF",
    cell: ({ row }) => <div>{formatCPF(row.getValue("cpf"))}</div>
  },
  // 4. Coluna de Cargo
  {
    accessorKey: "role",
    header: "Cargo",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const variant: "default" | "secondary" = role.includes("Gerente") ? "default" : "secondary";
      return <Badge variant={variant}>{role}</Badge>;
    },
  },

   // 5. Coluna de email
  {
    accessorKey: "email",
    header: "E-mail",
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <div className="font-medium capitalize">{email}</div>
    },
  },

    // 6. Coluna de Data de Entrada formatada
  {
    accessorKey: "dataEntrada",
    header: "Data de Entrada",
    cell: ({ row }) => {
      const data = row.getValue("dataEntrada") as string;
      const dataFormatada = new Date(data).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return <span>{dataFormatada}</span>;
    },
  },

  // 5. Coluna de Projetos com Badges
  {
    accessorKey: "projects",
    header: "Projetos",
    cell: ({ row }) => {
        const projects = row.getValue("projects") as string[];
        return (
            <div className="flex flex-wrap gap-1">
                {projects.map((project) => (
                    <Badge key={project} variant="secondary">{project}</Badge>
                ))}
            </div>
        );
    }
  },
  // 6. Coluna de Ações com Dropdown Menu
  {
    id: "actions",
    header: "Ações",
    cell: ({  }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar Colaborador</DropdownMenuItem>
            <DropdownMenuItem>
              Excluir Colaborador
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];