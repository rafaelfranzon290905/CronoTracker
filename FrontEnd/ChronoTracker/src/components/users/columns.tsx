import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Key, Edit, Trash2 } from "lucide-react";
import { type Usuario } from "@/lib/types";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export const columns = (
  isGerente: boolean, 
  onEdit: (u: Usuario) => void,
  onDelete: (u: Usuario) => void,
  onPasswordReset: (u: Usuario) => void
): ColumnDef<Usuario>[] => {
  const cols: ColumnDef<Usuario>[] = [
   {

      accessorKey: "nome_completo", 
      header: "Nome Completo",
      cell: ({ row }) => {
        const isActive = row.original.status;
        const valor = row.getValue("nome_completo") as string; 
        return (
          <div className={`font-medium ${!isActive ? "text-muted-foreground line-through opacity-70" : ""}`}>
            {valor || "Sem Nome"}
          </div>
        );
      }
    },
    { accessorKey: "nome_usuario", header: "Usuário" },
    { accessorKey: "email", header: "E-mail" },
    {
      accessorKey: "cargo",
      header: "Cargo",
      cell: ({ row }) => (
        <Badge variant={row.original.cargo === "Gerente" ? "default" : "secondary"}>
          {row.original.cargo}
        </Badge>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const active = row.original.status;
        return (
          <Badge className={active ? "bg-green-600" : "bg-gray-400"}>
            {active ? "Ativo" : "Inativo"}
          </Badge>
        );
      }
    }
  ];

  if (isGerente) {
    cols.push({
      id: "actions",
      header: "Ações",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.original)}><Edit className="mr-2 h-4 w-4"/> Editar / Permissões</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPasswordReset(row.original)}><Key className="mr-2 h-4 w-4"/> Resetar Senha</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(row.original)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4"/> Inativar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    });
  }

  return cols;
};