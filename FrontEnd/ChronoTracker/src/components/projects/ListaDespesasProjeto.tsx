import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSearch, AlertCircle, Eye } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface Props {
  despesas: any[];
}

export function ListaDespesasProjeto({ despesas }: Props) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprovada":
        return <Badge className="bg-green-600 hover:bg-green-700">Aprovada</Badge>;
      case "Reprovada":
        return <Badge className="bg-red-600 hover:bg-red-700 text-white">Reprovada</Badge>;
      default:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendente</Badge>;
    }
  };

  return (
    <Card className="mt-6 shadow-sm border-slate-200">
      <CardHeader>
        <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-blue-600" />
            <div>
                <CardTitle className="text-lg">Histórico de Despesas</CardTitle>
                <CardDescription>Acompanhe o fluxo de aprovação dos gastos vinculados.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {despesas.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground italic">Nenhuma despesa lançada para este projeto.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[100px]">Data</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Comprovante</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesas.map((d) => (
                <TableRow key={d.despesa_id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium">
                    {new Date(d.data_despesa).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </TableCell>
                  <TableCell className="text-xs">
                    {d.colaborador?.nome_colaborador}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-full">
                        {d.tipo_despesa}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold text-blue-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(d.status_aprovacao)}
                        
                        {d.status_aprovacao === "Reprovada" && d.motivo_reprovacao && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <AlertCircle className="h-4 w-4 text-red-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="bg-white border shadow-lg p-2 max-w-[200px]">
                                <p className="text-[10px] text-red-600 font-bold uppercase mb-1">Motivo da Reprovação:</p>
                                <p className="text-xs text-slate-700">{d.motivo_reprovacao}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <button 
                        className="p-2 hover:bg-blue-50 rounded-full text-blue-600 transition-colors"
                        title="Ver Comprovante"
                        onClick={() => {
                            const win = window.open();
                            win?.document.write(`<iframe src="${d.anexo}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                        }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}