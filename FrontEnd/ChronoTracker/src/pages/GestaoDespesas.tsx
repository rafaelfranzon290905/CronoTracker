import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/apiConfig";
import SideBar from "@/components/componentes/SideBar";
import Header from "@/components/componentes/Header";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function GestaoDespesas() {
    const [despesas, setDespesas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { isGerente, user } = usePermissions();

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedDespesaId, setSelectedDespesaId] = useState<number | null>(null);
    const [motivo, setMotivo] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const getStatusBadge = (status: string) => {
        const baseClass = "w-24 justify-center text-white border-none shadow-none";
        switch (status) {
            case "Aprovada":
                return <Badge className={`bg-green-600 hover:bg-green-700 ${baseClass}`}>Aprovada</Badge>;
            case "Reprovada":
                return <Badge className={`bg-red-600 hover:bg-red-700 text-white ${baseClass}`}>Reprovada</Badge>;
            default:
                return <Badge className={`bg-yellow-500 hover:bg-yellow-600 ${baseClass}`}>Pendente</Badge>;
        }
    };

    const fetchDespesas = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/despesas?status=Pendente`);
            const data = await response.json();
            setDespesas(data);
        } catch (error) {
            toast.error("Erro ao carregar despesas pendentes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDespesas(); }, []);

    const handleAprovar = async (id: number) => {
        if (!user) {
            toast.error("Sessão expirada. Faça login novamente.");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/despesas/${id}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Aprovada", cargo: user.cargo })
            });
            if (res.ok) {
                toast.success("Despesa aprovada!");
                fetchDespesas();
            }
        } catch (error) {
            toast.error("Erro ao processar aprovação.");
        }
    };

    const openRejectModal = (id: number) => {
        setSelectedDespesaId(id);
        setMotivo("");
        setIsRejectModalOpen(true);
    };

    const confirmReprovar = async () => {
        if (!user || !selectedDespesaId) return;
        if (!motivo.trim()) return toast.warning("O motivo é obrigatório.");

        try {
            setSubmitting(true);
            const res = await fetch(`${API_BASE_URL}/despesas/${selectedDespesaId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "Reprovada",
                    motivo_reprovacao: motivo,
                    cargo: user.cargo
                })
            });

            if (res.ok) {
                toast.error("Despesa reprovada.");
                setIsRejectModalOpen(false);
                fetchDespesas();
            }
        } catch (error) {
            toast.error("Erro ao processar reprovação.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50/30">
            <SideBar />
            <div className="flex-1 p-6 overflow-auto">
                <Header />
                <main className="mt-4">
                    <PageHeader
                        title="Gestão de Despesas"
                        subtitle="Aprovação de reembolsos e custos operacionais"
                    />

                    <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-200">
                        {loading ? (
                            <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>
                        ) : despesas.length === 0 ? (
                            <div className="p-20 text-center text-muted-foreground italic">
                                Nenhuma despesa pendente de análise.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="text-center">
                                    <TableRow>
                                        <TableHead>Colaborador</TableHead>
                                        <TableHead>Projeto</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Valor</TableHead>
                                        {isGerente && <TableHead className="text-center">Ações</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {despesas.map((d) => (
                                        <TableRow key={d.despesa_id}>
                                            <TableCell className="font-medium">{d.colaborador?.nome_colaborador}</TableCell>
                                            <TableCell className="text-xs text-blue-600 font-semibold">{d.projeto?.nome_projeto}</TableCell>
                                            <TableCell>{new Date(d.data_despesa).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-bold">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(d.valor)}
                                            </TableCell>
                                            <TableCell className="text-center">{getStatusBadge(d.status_aprovacao)}</TableCell>
                                            {isGerente && (
                                                <TableCell className="flex  gap-2">
                                                    {d.status_aprovacao === "Pendente" ? (
                                                        <>
                                                            <Button
                                                                size="icon"
                                                                className="bg-green-600 h-8 w-8 hover:bg-green-700"
                                                                onClick={() => handleAprovar(d.despesa_id)}
                                                            >
                                                                <Check className="h-4 w-4 text-white" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="destructive"
                                                                className="h-8 w-8"
                                                                onClick={() => openRejectModal(d.despesa_id)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <span className="text-[10px] text-muted-foreground italic">Processada</span>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </main>
                <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Reprovar Despesa</DialogTitle>
                            <DialogDescription>
                                Informe o motivo pelo qual esta despesa está sendo recusada. O colaborador poderá visualizar esta justificativa.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Textarea
                                placeholder="Digite aqui o motivo da reprovação..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancelar</Button>
                            <Button 
                                variant="destructive" 
                                onClick={confirmReprovar}
                                disabled={submitting || !motivo.trim()}
                            >
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar Reprovação"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}