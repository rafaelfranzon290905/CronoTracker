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
import { type Collaborador } from "@/lib/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ListTodo, Info, Briefcase } from "lucide-react"
import { Link } from "react-router-dom";


export const columns = (isGerente: boolean): ColumnDef<Collaborador>[] => [
 // 2. Coluna de Nome 
  {
    accessorKey: "nome_colaborador",
    header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-transparent p-0"
      >
        Nome
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    )
  },
    cell: ({ row }) => {
      const colaborador = row.original;
      const isAtivo = row.original.status;
      return (
       <Link
          to={`/collaborators/${colaborador.colaborador_id}`}
          className={`font-medium text-blue-950 hover:text-blue-800 hover:underline transition-all decoration-2 underline-offset-4 ${
            !isAtivo ? "text-muted-foreground line-through opacity-70" : ""
          }`}
        >
          {colaborador.nome_colaborador}
        </Link>
      );
    },
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
  // {
  //   accessorKey: "email",
  //   header: "E-mail",
  //   cell: ({ row }) => {
  //     const email = row.getValue("email") as string;
  //     // Trocamos 'capitalize' por 'lowercase' para garantir o padrão de e-mail
  //     return <div className="font-medium lowercase">{email}</div>
  //   },
  // },
  // Coluna de projetos associados
  {
  id: "projetos",
  header: "Projetos",
  cell: ({ row }) => {
    const nomes = (row.original as any).listaProjetos || [];
    const total = nomes.length;
    if (total === 0) return <span className="text-muted-foreground text-xs italic">Nenhum</span>;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
            <Briefcase/>
            <span className="font-bold">{total}</span> 
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <div className="bg-botao-light p-2 px-3 rounded-t-md">
            <h4 className="text-white text-sm font-semibold flex items-center gap-2">
              Projetos Vinculados
            </h4>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            <ul className="space-y-1">
              {nomes.map((nome: string, i: number) => (
                <li
                key={i}
                className="flex items-center justify-between p-2 rounded-md text-xs border-b last:border-0 border-slate-100">
                  <span className="font-medium text-slate-700 truncate max-w-[180px]" title={nome}>
                    {nome}
                  </span>
                </li>
              ))}
            </ul>
            
          </div>
        </PopoverContent>
      </Popover>
    );
  },
},

// Coluna de atividades
{
  id: "atividades_equipe",
  header: "Atividades",
  cell: ({ row }) => {
    const atividades = (row.original as any).atividadesEquipe || [];
    if (atividades.length === 0) return <span className="text-muted-foreground text-xs italic">Sem projetos/equipe</span>;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-2 border-dashed">
            <ListTodo />
            <span className="font-bold">{atividades.length}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <div className="bg-botao-light p-2 px-3 rounded-t-md">
            <h4 className="text-white text-sm font-semibold flex items-center gap-2">
              Atividades Disponíveis
            </h4>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            <ul className="space-y-1">
              {atividades.map((atv: any) => (
              <li key={atv.atividade_id} className="flex items-center justify-between p-2 rounded-md text-xs border-b last:border-0 border-slate-100">
                <span className="font-medium text-slate-700 truncate max-w-[180px]" title={atv.nome_atividade}>{atv.nome_atividade}</span>
              </li>
            ))}
            </ul>
          </div>
        </PopoverContent>
      </Popover>
    );
  },
},
    // 6. Coluna de Data de admissao formatada
  // {
  //   accessorKey: "data_admissao",
  //   header: "Data de Admissão",
  //   cell: ({ row }) => {
  //     const dataString = row.getValue("data_admissao") as string | null;
  //     if (!dataString) return <span className="text-muted-foreground text-sm">Pendente</span>;
  //     const data = new Date(dataString);
  //     const dataFormatada = data.toLocaleDateString("pt-BR", {
  //       day: "2-digit",
  //       month: "2-digit",
  //       year: "numeric",
  //     });
  //     return <span>{dataFormatada}</span>;
  //   },
  // },
  
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
            <DropdownMenuItem onClick={() => (table.options.meta as any)?.onEdit(colaborador)}>Editar Colaborador</DropdownMenuItem>
            <DropdownMenuItem onClick={() => (table.options.meta as any)?.onDelete(colaborador.colaborador_id)}>
              Excluir Colaborador 
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export const getColaboradorColumns = (
    isGerente: boolean, 
): ColumnDef<Collaborador>[] => {
    
    // 1. Gera o array COMPLETO de colunas, passando os handlers
    const allColumns = columns(isGerente);

   if (isGerente) {

       return allColumns;
 }

   return allColumns.filter(column => column.id !== 'actions');
};