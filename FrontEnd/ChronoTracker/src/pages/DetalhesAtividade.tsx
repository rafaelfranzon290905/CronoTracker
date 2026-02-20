import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/apiConfig";
import SideBar from "@/components/componentes/SideBar";
import Header from "@/components/componentes/Header";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    CalendarDays,
    ArrowLeft,
    Clock,
    Loader2,
    AlertCircle,
    ClipboardList,
    User,
    Edit,
    History,
    Timer, 
    Flag
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { EditActivitiesDialog } from "@/components/activities/EditActivitiesDialog";
import { Link } from "react-router-dom";

export default function DetalhesAtividade() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isGerente } = usePermissions();
    const [atividade, setAtividade] = useState<any>(null);
    const [projetos, setProjetos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [atvRes, projRes] = await Promise.all([
                fetch(`${API_BASE_URL}/atividades/${id}`),
                fetch(`${API_BASE_URL}/projetos`)
            ]);

            if (!atvRes.ok) throw new Error("Atividade não encontrada");

            const atvData = await atvRes.json();
            const projData = await projRes.json();

            setAtividade(atvData);
            setProjetos(projData);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleEditSuccess = () => {
        setIsEditModalOpen(false);
        loadData(); 
    };

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
        </div>
    );

    if (!atividade) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">Atividade não encontrada</h2>
            <Button onClick={() => navigate("/atividades")}>Voltar</Button>
        </div>
    );

    const formatarHorasDecimais = (totalDecimal: number) => {
        const horas = Math.floor(totalDecimal);
        const minutos = Math.round((totalDecimal - horas) * 60);
        
        const horasPad = String(horas).padStart(2, '0');
        const minutosPad = String(minutos).padStart(2, '0');
        
        return `${horasPad}:${minutosPad}`;
    };

    const totalDecimal = atividade?.lancamentos_de_horas?.reduce(
        (acc: number, lanc: any) => acc + (Number(lanc.duracao_total) || 0), 
        0
    ) || 0;

    const priorityConfig: any = {
        "muito alta": { color: "bg-red-600", label: "Muito Alta" },
        "alta": { color: "bg-orange-500", label: "Alta" },
        "normal": { color: "bg-blue-500", label: "Normal" },
        "baixa": { color: "bg-slate-500", label: "Baixa" },
    };
    const statusConfig: any = {
        "Pendente": "bg-slate-500",
        "Em Andamento": "bg-blue-600",
        "Concluída": "bg-green-600",
        "Cancelado": "bg-red-600",
    };

    return (
        <div className="flex h-screen w-full">
            <SideBar />
            <div className="flex-1 p-6 overflow-auto bg-slate-50/30">
                <Header />
                <main className="mt-4">
                    <PageHeader
                        title={atividade.nome_atividade}
                        subtitle={
                            <div className="flex items-center gap-1">
                                <span>Projeto: </span>
                                {atividade.projeto_id ? (
                                    <Link 
                                        to={`/projetos/${atividade.projeto_id}`} 
                                        className="text-blue-850 hover:underline hover:text-blue-800 transition-colors font-medium"
                                    >
                                        {atividade.projetos?.nome_projeto || "Ver Detalhes"}
                                    </Link>
                                ) : (
                                    <span className="text-slate-500">Não vinculado</span>
                                )}
                            </div>
                        }
                    >
                        <div className="flex items-center gap-3">
                            <Badge className={`${statusConfig[atividade.status] || "bg-gray-400"} text-white border-none`}>
                                {atividade.status}
                            </Badge>
                            {isGerente && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2 border-slate-200 hover:bg-slate-100"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <Edit className="h-4 w-4 text-blue-900" /> Editar
                                </Button>
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
                                        <ClipboardList className="h-5 w-5 text-blue-600" /> Descrição
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 leading-relaxed">
                                        {atividade.descr_atividade || "Sem descrição informada."}
                                    </p>

                                    <Separator className="my-6" />

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <CalendarDays className="h-4 w-4 text-blue-600" />
                                            <span className="font-semibold">Início Previsto:</span>
                                            {new Date(atividade.data_prevista_inicio).toLocaleDateString("pt-BR")}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-red-600" />
                                            <span className="font-semibold">Fim Previsto:</span>
                                            {atividade.data_prevista_fim ? new Date(atividade.data_prevista_fim).toLocaleDateString("pt-BR") : "N/A"}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                                <Timer className="h-4 w-4 text-purple-600" />
                                                <span className="font-semibold">Horas Previstas:</span>
                                                <span className="font-medium">{atividade.horas_previstas || 0}h</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Flag className="h-4 w-4 text-yellow-600" />
                                            <span className="font-semibold">Prioridade:</span>
                                            <span className={`${priorityConfig[atividade.prioridade]?.color || "bg-gray-500"} text-white px-2 py-0.5 rounded-full text-xs`}>
                                                {priorityConfig[atividade.prioridade]?.label || "Normal"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>                             
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <History className="h-5 w-5 text-blue-600" /> Histórico de Horas
                                    </CardTitle>
            
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {console.log("Dados da atividade recebidos:", atividade)}
                                        {atividade.lancamentos_de_horas && atividade.lancamentos_de_horas.length > 0 ? (
                                            atividade.lancamentos_de_horas.map((lanc: any) => (
                                                <div key={lanc.lancamento_id} className="flex flex-col p-3 border rounded-lg bg-white shadow-sm hover:bg-slate-50 transition-colors">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                <Timer className="h-3 w-3 mr-1" />
                                                                {formatarHorasDecimais(Number(lanc.duracao_total))}h
                                                            </Badge>
                                                            <span className="text-xs font-semibold text-slate-500">
                                                                {new Date(lanc.data_lancamento).toLocaleDateString("pt-BR")}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] uppercase font-bold text-slate-400">
                                                            {lanc.colaboradores?.nome_colaborador}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 italic">
                                                        "{lanc.descricao || "Sem observações"}"
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                                <p className="text-sm text-muted-foreground italic">Nenhum registro de horas encontrado para esta atividade.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-blue-100">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-600" /> Responsável
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {atividade.colaboradores_atividades && atividade.colaboradores_atividades.length > 0 ? (
                                        atividade.colaboradores_atividades.map((item: any) => (
                                            <Link 
                                                key={item.colaboradores.colaborador_id}
                                                to={`/Collaborators/${item.colaboradores.colaborador_id}`}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-all group border border-transparent hover:border-blue-100"
                                            >
                                                <div className="h-10 w-10 rounded-full bg-blue-950 flex items-center justify-center text-white font-bold ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all">
                                                    {item.colaboradores.nome_colaborador.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold group-hover:text-blue-700 transition-colors">
                                                        {item.colaboradores.nome_colaborador}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {item.colaboradores.cargo || "Colaborador"}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Sem responsáveis alocados.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className={`${totalDecimal > (atividade.horas_previstas || 0) ? "bg-red-900" : "bg-blue-900"} text-white transition-colors duration-500`}>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-white-200 text-[10px] uppercase font-bold tracking-wider">Horas Previstas</p>
                                            <p className="text-2xl font-bold">{atividade.horas_previstas || 0}h</p>
                                        </div>
                                        
                                        <Separator className="bg-white/20" />

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-white-200 text-[10px] uppercase font-bold tracking-wider">Total Gasto</p>
                                                <p className="text-3xl font-bold mt-1">
                                                    {formatarHorasDecimais(totalDecimal)}h
                                                </p>
                                            </div>
                                            <Timer className="h-8 w-8 text-white-400 opacity-50" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-[10px] uppercase font-bold text-white-200">
                                                <span>Progresso</span>
                                                <span>{atividade.horas_previstas ? Math.round((totalDecimal / atividade.horas_previstas) * 100) : 0}%</span>
                                            </div>
                                            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${totalDecimal > (atividade.horas_previstas || 0) ? "bg-red-400" : "bg-green-400"}`}
                                                    style={{ width: `${Math.min((totalDecimal / (atividade.horas_previstas || 1)) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
            {atividade && (
                <EditActivitiesDialog
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    initialData={{
                        ...atividade,
                        projeto_id: atividade.projeto_id
                    }}
                    projetos={projetos}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
}