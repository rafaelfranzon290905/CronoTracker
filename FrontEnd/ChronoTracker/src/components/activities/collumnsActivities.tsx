import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Flag, Edit } from "lucide-react";
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
import { Link } from "react-router-dom";
import { type AtividadesInitialData } from "./EditActivitiesDialog";
import { DeleteActivityDialog } from "./DeleteActivityDialog";



// import { usePermissions } from "@/hooks/usePermissions";

const formatarData = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString("pt-BR", { timeZone: 'UTC' });
  } catch {
    return dateString; // Retorna a string original em caso de erro
  }
};


const formatarHorasDecimais = (totalDecimal: number | null | undefined): string => {
  const valor = totalDecimal || 0;
  const horas = Math.floor(valor);
  const minutos = Math.round((valor - horas) * 60);
  
  const horasPad = String(horas).padStart(2, '0');
  const minutosPad = String(minutos).padStart(2, '0');
  
  return `${horasPad}:${minutosPad}`;
};

const priorityConfig = {
  "muito alta": { color: "bg-red-600 hover:bg-red-700", label: "Muito Alta" },
  "alta": { color: "bg-orange-500 hover:bg-orange-600", label: "Alta" },
  "normal": { color: "bg-blue-500 hover:bg-blue-600", label: "Normal" },
  "baixa": { color: "bg-slate-500 hover:bg-slate-600", label: "Baixa" },
};

const priorityOrder: Record<string, number> = {
  "muito alta": 4,
  "alta": 3,
  "normal": 2,
  "baixa": 1,
};


// --- Definição das Colunas ---

type DeleteActivityHandler = (atividadeId: number) => Promise<void>;
type EditActivityHandler = (activity: AtividadesInitialData) => void;

export const columns = (handleDeleteActivity: DeleteActivityHandler, handleEditActivity: EditActivityHandler): ColumnDef<Atividades>[] => [

  // COLUNA: Projeto Vinculado 
  {
    accessorKey: "projetos.nome_projeto",
    enableGlobalFilter: true,
    header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="px-0 py-0 h-auto font-bold hover:bg-transparent text-blue-950"
    >
      Projeto Vinculado
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
    cell: ({ row }) => {
      const atividade = row.original;
      // console.log("Dados da linha", atividade);
      const projeto = atividade.projetos?.nome_projeto;

      return (
        <Badge variant="outline" className="bg-blue-900 text-white" >
          {projeto || "Sem Projeto"}
        </Badge>
      );
    },
  },
  // COLUNA: Nome da Atividade (Com Ordenação)
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
    cell: ({ row }) => {
      const atividade = row.original;
      return (
        <Link
          to={`/atividades/${atividade.atividade_id}`}
          className="font-medium text-blue-950 hover:text-blue-800 hover:underline transition-all decoration-2 underline-offset-4 flex items-center justify-center gap-1"
        >
          {atividade.nome_atividade}
        </Link>
      );
    },
    enableHiding: false,
    enableGlobalFilter: true,
  },
  {
    accessorKey: "colaboradores_atividades",
    header: "Responsáveis",
    enableGlobalFilter: true,
    cell: ({ row }) => {
      const equipe = row.original.colaboradores_atividades || [];
      if (equipe.length === 0) {
        return <span className="text-muted-foreground text-xs italic">Sem responsável</span>;
      }

      return (
        <div className="flex justify-center">
        <div className="flex -space-x-2 overflow-hidden">
          {equipe.map((item, index) => {
            const nomeColaborador = item?.colaboradores?.nome_colaborador;
            const iniciais = nomeColaborador 
              ? nomeColaborador.substring(0, 2).toUpperCase() 
              : "??";
              
            return (
              <div
                key={item.colaborador_id || index}
                title={nomeColaborador || "Colaborador"}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-blue-900 text-[10px] font-bold text-white uppercase shadow-sm"
              >
                {iniciais}
              </div>
            );
          })}
        </div>
      </div>
      );
    }
  },

  // 3. COLUNA: Descrição
  // {
  //   accessorKey: "descr_atividade",
  //   header: "Descrição",
  //   cell: ({ row }) => <span className="text-sm">{row.getValue("descr_atividade")}</span>,
  // },

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
        {formatarHorasDecimais(horas)}h
      </div>
    );
  },
},

{
  accessorKey: "prioridade",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="px-0 py-0 h-auto font-bold"
    >
      Prioridade
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => {
    const prioridade = row.getValue("prioridade") as keyof typeof priorityConfig || "normal";
    const config = priorityConfig[prioridade] || priorityConfig["normal"];

    return (
      <Badge className={`${config.color} text-white items-center gap-1 w-fit border-none shadow-sm`}>
        <Flag className="h-3 w-3 fill-current" />
        <span className="capitalize">{config.label}</span>
      </Badge>
    );
  },

  sortingFn: (rowA, rowB, columnId) => {
    const valA = priorityOrder[rowA.getValue(columnId) as string] || 0;
    const valB = priorityOrder[rowB.getValue(columnId) as string] || 0;
    return valA < valB ? -1 : valA > valB ? 1 : 0;
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
        <>
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
              onClick={() => {
                const atividadeConvertida: AtividadesInitialData = {
                  atividade_id: atividade.atividade_id,
                  nome_atividade: atividade.nome_atividade,
                  descr_atividade: atividade.descr_atividade,
                  data_prevista_inicio: atividade.data_prevista_inicio,
                  data_prevista_fim: atividade.data_prevista_fim,
                  status: atividade.status,
                  projeto_id: atividade.projeto_id,
                  prioridade: atividade.prioridade || "normal",

                  colaboradores_atividades: atividade.colaboradores_atividades?.map(item => ({
                    colaborador_id: item.colaboradores.colaborador_id,
                    colaboradores: {
                      nome_colaborador: item.colaboradores.nome_colaborador
                    }
                  })),
                };
                handleEditActivity(atividadeConvertida);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>

            <DeleteActivityDialog 
            activityId={atividadeId}
            onSuccess={() => handleDeleteActivity(atividadeId)}
          />
          </DropdownMenuContent>
        </DropdownMenu>

        
        </>
      );
    },
  },
];

export const getAtividadesColumns = (
  handleDeleteActivity: DeleteActivityHandler,
  handleEditActivity: EditActivityHandler
): ColumnDef<Atividades>[] => {

  return columns(handleDeleteActivity, handleEditActivity);
}