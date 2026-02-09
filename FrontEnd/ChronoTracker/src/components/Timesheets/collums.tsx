import { type ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, FileText, MoreHorizontal, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const getTimesheetColumns = (
  isGerente: boolean,
  verEquipe: boolean
): ColumnDef<any>[] => {
  const cols: ColumnDef<any>[] = [
    {
      accessorKey: "data_lancamento",
      header: "Data",
      cell: ({ row }) => {
        const data = new Date(row.getValue("data_lancamento"))
        return data.toLocaleDateString("pt-BR", { timeZone: "UTC" })
      },
    },

    ...(verEquipe
      ? [
          {
            accessorKey: "colaboradores.nome_colaborador",
            id: "nome_colaborador",
            header: "Colaborador",
          },
        ]
      : []),

    {
      accessorKey: "projetos.nome_projeto",
      header: "Projeto",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original?.projetos?.nome_projeto || "Projeto s/ nome"}
        </span>
      ),
    },

    {
      accessorKey: "atividades.nome_atividade",
      header: "Atividade",
    },

    {
      accessorKey: "periodo",
      header: "Período",
      cell: ({ row }) => {
        const inicio = row.original.hora_inicio
        const fim = row.original.hora_fim

        const format = (v: string) => {
          if (!v) return "--:--"
          const d = new Date(v)
          return `${d.getUTCHours().toString().padStart(2, "0")}:${d
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")}`
        }

        return (
          <span className="font-mono text-sm">
            {format(inicio)} - {format(fim)}
          </span>
        )
      },
    },

    {
      id: "duracao",
      header: "Duração",
      cell: ({ row }) => {
        const i = new Date(row.original.hora_inicio)
        const f = new Date(row.original.hora_fim)
        const diff = f.getTime() - i.getTime()
        if (diff <= 0) return "0h"

        const h = Math.floor(diff / 36e5)
        const m = Math.round((diff % 36e5) / 6e4)

        return `${h}h${m > 0 ? ` ${m}min` : ""}`
      },
    },

    {
      accessorKey: "tipo_lancamento",
      header: "Origem",
      cell: ({ row }) =>
        row.original.tipo_lancamento === "relogio" ? (
          <Badge variant="outline" className="text-blue-700 border-blue-300 gap-1">
            <Clock size={12} /> Relógio
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1">
            <FileText size={12} /> Manual
          </Badge>
        ),
    },

    {
      accessorKey: "status_aprovacao",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status_aprovacao
        const map: any = {
          aprovado: "bg-green-600 hover:bg-green-700",
          pendente: "bg-yellow-500 hover:bg-yellow-600",
          rejeitado: "bg-red-600 hover:bg-red-700",
        }
        return (
          <Badge className={`${map[s] || "bg-gray-500"} text-white capitalize`}>
            {s}
          </Badge>
        )
      },
    },

    {
      id: "acoes",
      header: "Ações",
      cell: ({ table, row }) => {
        const lancamento = row.original
        const meta = table.options.meta as any

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Ações do Lançamento</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => meta?.onEdit(lancamento)}>
                <Edit className="mr-2 h-4 w-4" /> Editar
              </DropdownMenuItem>

              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-700"
                onClick={() => meta?.onDelete(lancamento.lancamento_id)}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </DropdownMenuItem>

              {/* Seção de Gestão (Aprovar/Rejeitar) */}
              {isGerente && verEquipe && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase text-muted-foreground">Gestão de Equipe</DropdownMenuLabel>
                  <DropdownMenuItem 
                    onClick={() => meta?.onApprove(lancamento.lancamento_id)}
                    className="text-green-600 focus:text-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => meta?.onReject(lancamento.lancamento_id)}
                    className="text-orange-600 focus:text-orange-700"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Rejeitar
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return cols
}