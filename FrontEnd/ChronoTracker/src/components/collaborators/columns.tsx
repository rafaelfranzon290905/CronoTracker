import { type ColumnDef, type RowData } from "@tanstack/react-table"; // Adicionei RowData
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
import { type Collaborador } from "@/lib/types";

// --- PARTE NOVA: Tipagem do Meta ---
// Isso ensina ao TypeScript que sua tabela aceita onDelete
declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    onEdit: (data: TData) => void;
    onDelete: (id: number) => void; // A nova função
  }
}

export const columns: ColumnDef<Collaborador>[] = [
  // 2. Coluna de Nome 
  {
    accessorKey: "nome_colaborador",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium capitalize">{row.getValue("nome_colaborador")}</div>,
  },

  // 4. Coluna de Cargo
  {
    accessorKey: "cargo",
    header: "Cargo",
    cell: ({ row }) => {
      const role = row.getValue("cargo") as string;
      const variant: "default" | "secondary" | "outline" = role.toLowerCase().includes("gerente") ? "default" : "secondary";
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

   // 6. Coluna de Data de admissao formatada
  {
    accessorKey: "data_admissao",
    header: "Data de Admissão",
    cell: ({ row }) => {
      const dataString = row.getValue("data_admissao") as string | null;
      if (!dataString) return <span className="text-muted-foreground text-sm">Pendente</span>;
      const data = new Date(dataString);
      const dataFormatada = data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return <span>{dataFormatada}</span>;
    },
  },
// 6. Coluna de Status 
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isAtivo = row.getValue("status") as boolean;
      
      return (
        <Badge variant={isAtivo ? "default" : "destructive"} className={isAtivo ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700 text-white"}>
          {isAtivo ? "Ativo" : "Inativo"}
        </Badge>
      );
    }
  },
  // 6. Coluna de Ações com Dropdown Menu
  {
    id: "actions",
    header: "Ações",
    cell: ({ table, row }) => {
      const colaborador = row.original;
      const meta = table.options.meta; // Agora isso está tipado corretamente

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
            
            <DropdownMenuItem onClick={() => meta?.onEdit(colaborador)}>
                Editar Colaborador
            </DropdownMenuItem>
            
            {/* --- MUDANÇA AQUI --- */}
            <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 cursor-pointer"
                onClick={() => {
                    // Verifica se o ID existe e chama a função
                    if(colaborador.colaborador_id && meta?.onDelete) {
                        meta.onDelete(colaborador.colaborador_id)
                    }
                }}
            >
              Excluir Colaborador
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];