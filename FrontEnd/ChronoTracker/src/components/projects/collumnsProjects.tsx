import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Trash2 } from "lucide-react";
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
import { AddProjectDialog } from "./addProjectDialog";
import { toast } from "sonner";
import { ListChecks, ClipboardList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { API_BASE_URL } from  "@/apiConfig"


const deleteProject = async (id: number) => {
  if (confirm("Tem certeza que deseja excluir este projeto? Essa ação não pode ser desfeita.")) {
    try {
      const response = await fetch(`${API_BASE_URL}/projetos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Projeto excluído com sucesso!");
        window.location.reload();
      } else {
        toast.error("Erro ao excluir projeto.");
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      toast.error("Erro ao conectar com o servidor.");
    }
  }
};


export const getColumns = (
  clientes: { cliente_id: number; nome_cliente: string }[],
  isGerente,
  onSuccess: () => void
): ColumnDef<Projeto>[] => [
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
      cell: ({ row }) => <span className="" title={row.getValue("descricao")}>{row.getValue("descricao")}</span>,
    },
    {
      accessorKey: "equipe",
      header: "Equipe",
      cell: ({ row }) => {
        // 1. Pegamos os dados da linha
        const projeto = row.original;
        
        // 2. Acessamos a lista de vínculos
        const equipe = projeto.projeto_colaboradores || [];

        console.log(`Projeto ${projeto.nome_projeto}`, equipe);

        if (equipe.length === 0) {
          return <span className="text-muted-foreground text-xs italic">Sem equipe</span>;
        }

        return (
          <div className="flex -space-x-2 overflow-hidden">
            {equipe.map((item, index) => (
              <div 
                key={index}
                title={item.colaboradores?.nome_colaborador || "Colaborador"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-blue-900 text-[10px] font-bold text-white uppercase"
              >
                {item.colaboradores?.nome_colaborador?.substring(0, 2) || "??"}
              </div>
            ))}
          </div>
        );
      }
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
      accessorKey: "horas_previstas",
      header: "Horas Previstas",
      cell: ({ row }) => {
          const horas = row.getValue("horas_previstas") as number;
          return <span>{horas ? `${horas}h` : "0h"}</span>;
      },
  },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as boolean;
        return (
          <Badge variant={status ? "default" : "destructive"}
            className={!status ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}>
            {status ? "Ativo" : "Inativo"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center w-full">Ações</div>,
      cell: ({ row }) => {
        const projeto = row.original;
        const atividades = projeto.atividades || [];

        return (
          <div className="flex justify-center items-center w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 justify-center items-center">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border shadow-lg z-50 min-w-[160px] rounded-md p-1">
                <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-center">Ações</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100 h-px my-1" />
                <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => e.preventDefault()} // Impede o dropdown de fechar antes do modal abrir
                  className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer rounded-sm hover:bg-slate-100 transition-colors"
                >
                  <ListChecks className="mr-2 h-4 w-4 text-blue-600" /> Ver Atividades
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-blue-600" />
                    Atividades: {projeto.nome_projeto}
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  {atividades.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      Este projeto ainda não possui atividades vinculadas.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {atividades.map((atv) => (
                        <div key={atv.atividade_id} className="flex items-center justify-between p-2 border rounded-lg bg-slate-50">
                          <span className="text-sm font-medium">{atv.nome_atividade}</span>
                          <Badge variant={atv.status ? "default" : "secondary"} className="text-[10px]">
                            {atv.status ? "Ativa" : "Pendente"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

                <AddProjectDialog
                  clientes={clientes}
                  onSuccess={onSuccess}
                  projectToEdit={projeto} // Passamos o projeto da linha
                />

                <DropdownMenuItem
                  onClick={() => deleteProject(projeto.projeto_id)}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none hover:bg-red-50 cursor-pointer rounded-sm text-red-600 focus:text-red-600 transition-colors"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

export const getProjetosColumns = (
  clientes: {cliente_id: number; nome_cliente: string}[],  
  isGerente: boolean,
  onSuccess: () => void
): ColumnDef<Projeto>[] => {
    
    // 1. Gera o array COMPLETO de colunas, passando os handlers
    const allColumns = getColumns(clientes ,isGerente, onSuccess);

    if (isGerente) {
        // Se for gerente, retorna todas as colunas
        return allColumns;
    }
    
    // 2. Se não for gerente, filtra a coluna 'actions' (pelo id: "actions")
    // ATENÇÃO: O ID da coluna Ações é 'actions', não 'acoes'.
    return allColumns.filter(column => column.id !== 'actions');
}