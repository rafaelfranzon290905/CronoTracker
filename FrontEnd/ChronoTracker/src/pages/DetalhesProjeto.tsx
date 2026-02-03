import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/apiConfig";
import { type Projeto } from "@/lib/projects";
import SideBar from "@/components/componentes/SideBar";
import Header from "@/components/componentes/Header";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
    CalendarDays,
    Users,
    CheckCircle2,
    ArrowLeft,
    Clock,
    Loader2,
    AlertCircle,
    Receipt
} from "lucide-react";
import { AddProjectDialog } from "@/components/projects/addProjectDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { AddExpenseDialog } from "@/components/projects/AddExpenseDialog";
import { ListaDespesasProjeto } from "@/components/projects/ListaDespesasProjeto";
import { Link } from "react-router-dom";

export default function DetalhesProjeto() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isGerente } = usePermissions();
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");

    const [projeto, setProjeto] = useState<Projeto | null>(null);
    const [clientes, setClientes] = useState<any[]>([])
    const [loading, setLoading] = useState(true);
    const loadData = async () => {
        try {
            setLoading(true);
            const [projRes, cliRes] = await Promise.all([
                fetch(`${API_BASE_URL}/projetos/${id}`),
                fetch(`${API_BASE_URL}/clientes`)
            ]);

            if (!projRes.ok) throw new Error("Projeto não encontrado");

            const projData = await projRes.json();
            const cliData = await cliRes.json();

            setProjeto(projData);
            setClientes(cliData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const progressoConsumido = useMemo(() => {
        if (!projeto || !projeto.horas_previstas || projeto.horas_previstas === 0) return 0;
        const consumidas = projeto.horas_gastas ?? 0;
        const calculo = (consumidas / projeto.horas_previstas) * 100;

        return Math.min(Math.round(calculo), 120);
    }, [projeto]);

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
        </div>
    );

    return (
        <div className="flex h-screen w-full">
            <SideBar />
            <div className="flex-1 p-6 overflow-auto bg-slate-50/30">
                <Header />
                <main className="mt-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
                            <p className="text-sm text-muted-foreground animate-pulse">Carregando detalhes do projeto...</p>
                        </div>
                    ) : !projeto ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <h2 className="text-xl font-bold">Projeto não encontrado</h2>
                            <Button onClick={() => navigate("/projetos")}>Voltar para a lista</Button>
                        </div>
                    ) : (
                        <>
                            <PageHeader
                                title={projeto.nome_projeto}
                                subtitle={`Cliente: ${projeto.clientes?.nome_cliente || "Não informado"}`}
                            >
                                <div className="flex items-center gap-3">
                                    <Badge className={projeto.status ? "bg-green-600" : "bg-red-600"}>
                                        {projeto.status ? "Ativo" : "Inativo"}
                                    </Badge>
                                    {projeto.status && user.colaborador_id && (
                                        <AddExpenseDialog
                                            projetoId={projeto.projeto_id}
                                            colaboradorId={user.colaborador_id}
                                            onSuccess={loadData}
                                        />
                                    )}
                                    {isGerente && (
                                        <AddProjectDialog
                                            clientes={clientes}
                                            projectToEdit={projeto}
                                            onSuccess={loadData}
                                            variant="button"
                                        />
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                                    </Button>
                                </div>
                            </PageHeader>

                            <div className="grid gap-6 md:grid-cols-3 mt-6">
                                <div className="md:col-span-2 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-blue-600" /> Descrição do Projeto
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-slate-600 leading-relaxed">
                                                {projeto.descricao || "Nenhuma descrição detalhada fornecida."}
                                            </p>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 p-4 bg-slate-50 rounded-lg border">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <CalendarDays className="h-4 w-4 text-blue-600" />
                                                    <span className="font-semibold">Início:</span>
                                                    {new Date(projeto.data_inicio).toLocaleDateString("pt-BR")}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-red-600" />
                                                    <span className="font-semibold">Prazo Final:</span>
                                                    {new Date(projeto.data_fim).toLocaleDateString("pt-BR")}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg font-bold">Checklist de Atividades</CardTitle>
                                            <CardDescription>Status atual de execução das tarefas</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {projeto.atividades && projeto.atividades.length > 0 ? (
                                                projeto.atividades.map((atv) => (
                                                    <Link key={atv.atividade_id} to={`/atividades/${atv.atividade_id}`} className="block group">
                                                        <div className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm hover:border-blue-200 transition-all">
                                                            <span className="text-sm font-medium">{atv.nome_atividade}</span>
                                                            <Badge
                                                                variant={atv.status ? "default" : "secondary"}
                                                                className={!atv.status
                                                                    ? "bg-red-600 hover:bg-red-700 text-white"
                                                                    : "bg-green-600 hover:bg-green-700 text-white"
                                                                }
                                                            >
                                                                {atv.status ? "Ativa" : "Inativa"}
                                                            </Badge>
                                                        </div>
                                                    </Link>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic text-center py-4">Nenhuma atividade vinculada.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                    <ListaDespesasProjeto despesas={projeto.despesas || []} />
                                </div>

                                <div className="space-y-6">
                                    <Card className="border-blue-100">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Users className="h-5 w-5 text-blue-600" /> Equipe do Projeto
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {projeto.projeto_colaboradores && projeto.projeto_colaboradores.length > 0 ? (
                                                projeto.projeto_colaboradores.map((pc, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                                        <div className="h-9 w-9 rounded-full bg-blue-950 flex items-center justify-center text-xs text-white font-bold ring-2 ring-blue-100">
                                                            {pc.colaboradores.nome_colaborador.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-semibold">{pc.colaboradores.nome_colaborador}</span>
                                                            <span className="text-[10px] text-muted-foreground">Colaborador</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">Nenhum colaborador alocado.</p>
                                            )}

                                            <Separator className="my-4" />

                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground italic">Consumo de Horas</span>
                                                    <span className="font-bold text-blue-900">
                                                        {projeto.horas_gastas?.toFixed(1) || 0}h / {projeto.horas_previstas || 0}h
                                                    </span>
                                                </div>

                                                <Progress
                                                    value={progressoConsumido > 100 ? 100 : progressoConsumido}
                                                    className={`h-2 ${progressoConsumido > 100
                                                            ? "bg-red-200 [&>div]:bg-red-600" 
                                                            : ""
                                                        }`}
                                                />

                                                <div className="flex justify-between items-center">
                                                    <p className={`text-[10px] font-medium uppercase tracking-wider ${progressoConsumido > 100 ? "text-red-600 animate-pulse" : "text-muted-foreground"}`}>
                                                        {progressoConsumido}% do tempo previsto consumido
                                                    </p>

                                                    {progressoConsumido > 100 && (
                                                        <Badge className="text-[8px] h-4 bg-red-600 hover:bg-red-700 text-white">Horas ultrapassadas</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Despesas Aprovadas
                                            </CardTitle>
                                            <Receipt className="h-4 w-4 text-blue-500" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-blue-700">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(projeto.total_despesas ?? 0)}
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-1 underline decoration-blue-200">
                                                Custo direto vinculado ao projeto
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}