import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, FileText } from "lucide-react";

export const getTimesheetColumns = (isGerente: boolean, verEquipe: boolean): ColumnDef<any>[] => {
  const cols: ColumnDef<any>[] = [
    {
      accessorKey: "data_lancamento",
      header: "Data",
      cell: ({ row }) => {
        const data = new Date(row.getValue("data_lancamento"));
        // Formata para DD/MM/AAAA e ignora o fuso horário para não mudar o dia
        return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
      },

    },
    // Coluna condicional: só aparece se o gerente estiver vendo a equipe
    ...(verEquipe ? [{
      accessorKey: "colaboradores.nome_colaborador",
      header: "Colaborador",
    }] : []),
    {
      accessorKey: "projetos.nome_projeto",
      header: "Projeto",
      cell: ({ row }) => (
        <span className="font-medium">{(row.original as any).projetos?.nome_projeto}</span>
      )
    },
    {
      accessorKey: "Cliente",
      header: "Cliente",
      cell: ({ row }) => (
        <span className="font-medium">{(row.original as any).clientes?.nome_cliente}</span>
      )
    },
    {
      accessorKey: "atividades.nome_atividade",
      header: "Atividade",
    },
    {
      accessorKey: "periodo", // ou como você chamou a combinação das horas
      header: "Período",
      cell: ({ row }) => {
        const inicio = row.original.hora_inicio;
        const fim = row.original.hora_fim;

        // Função interna para limpar a string "1970-01-01T12:00:00Z" -> "12:00"
        const formatTime = (isoString: string) => {
          if (!isoString) return "--:--";
          const date = new Date(isoString);
          // Usamos UTC para garantir que a hora salva não mude devido ao fuso local
          const h = date.getUTCHours().toString().padStart(2, '0');
          const m = date.getUTCMinutes().toString().padStart(2, '0');
          return `${h}:${m}`;
        };

        return (
          <div className="flex items-center gap-1 font-mono text-sm">
            {formatTime(inicio)} <span className="text-muted-foreground">-</span> {formatTime(fim)}
          </div>
        );
      },
    },
    {
      id: "duracao_total",
      header: "Duração",
      cell: ({ row }) => {
        const inicio = new Date(row.original.hora_inicio);
        const fim = new Date(row.original.hora_fim);

        // Cálculo em milissegundos
        const diffMs = fim.getTime() - inicio.getTime();
        if (isNaN(diffMs) || diffMs <= 0) return "0h";

        const totalHoras = diffMs / (1000 * 60 * 60);
        const horasInteiras = Math.floor(totalHoras);
        const minutos = Math.round((totalHoras - horasInteiras) * 60);

        // Formata bonitinho: "6h" ou "5h 30min"
        return (
          <span className="font-medium">
            {horasInteiras}h{minutos > 0 ? ` ${minutos}min` : ""}
          </span>
        );
      }
    },

    {
      accessorKey: "tipo_lancamento",
      header: "Origem",
      cell: ({ row }) => {
        const tipo = row.original.tipo_lancamento || "manual";

        return (
          <div className="flex items-center">
            {tipo === "relogio" ? (
              <Badge variant="outline" className="flex gap-1 items-center border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-50">
                <Clock size={12} className="text-blue-700" />
                <span className="text-[10px] font-semibold uppercase">Relógio</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex gap-1 items-center border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-50">
                <FileText size={12} className="text-slate-500" />
                <span className="text-[10px] font-semibold uppercase">Manual</span>
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "status_aprovacao",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.getValue("status_aprovacao") as string).toLowerCase();
        const variants: any = {
          aprovado: "bg-green-600",
          pendente: "bg-yellow-500",
          'aguardando aprovação': "bg-yellow-500",
          rejeitado: "bg-red-600",
          reprovado: "bg-red-600"
        };
        return <Badge className={`${variants[status] || "bg-gray-400"} text-white capitalize`}>{status}</Badge>;
      }
    }
  ];

  // Adiciona botões de aprovação para o Gerente na visão de Equipe
  if (isGerente && verEquipe) {
    cols.push({
      id: "acoes_gerente",
      header: "Ações de Aprovação",
      cell: ({ table, row }) => {
        const status = row.original.status_aprovacao.toLowerCase();

        return (
          <div className="flex gap-2 justify-center">
            {status !== 'aprovado' && (
              <Button
                size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => (table.options.meta as any)?.onApprove(row.original.lancamento_id)}
              >
                <Check size={16} />
              </Button>
            )}

            {status !== 'rejeitado' && status !== 'reprovado' && (
              <Button
                size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => (table.options.meta as any)?.onReject(row.original.lancamento_id)}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        );
      }
    });
  }

  return cols;
};