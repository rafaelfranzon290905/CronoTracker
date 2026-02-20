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
    User, Mail, Briefcase, Calendar, ArrowLeft, Edit,
    Loader2, AlertCircle, Layout, CheckCircle2, Clock
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { ModalColaboradores } from "@/components/collaborators/modal-colaborador";
import { type Collaborador } from "@/lib/types";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, BarChart3 } from "lucide-react";

export default function DetalhesColaborador() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isGerente } = usePermissions();
    const [colaborador, setColaborador] = useState<Collaborador | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [periodo, setPeriodo] = useState("mes");
    const [horasFiltradas, setHorasFiltradas] = useState(0);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/colaboradores/${id}`);
            if (!response.ok) throw new Error("Colaborador não encontrado");
            const data = await response.json();
            setColaborador(data);
        } catch (error) {
            console.error("Erro ao carregar colaborador:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        if (colaborador?.historico_lancamentos) {
            const total = calcularHorasPorPeriodo(colaborador.historico_lancamentos, periodo);
            setHorasFiltradas(total);
        }
    }, [periodo, colaborador?.historico_lancamentos]);

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
        </div>
    );


    const calcularHorasPorPeriodo = (lancamentos: any[], range: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); 

    let dataCorte = new Date(hoje);

    if (range === "semana") {
        dataCorte.setDate(hoje.getDate() - 7);
    } else if (range === "mes") {
        dataCorte.setMonth(hoje.getMonth() - 1);
    }

    return lancamentos
        .filter(l => {
            const dataLancamento = new Date(l.data_lancamento);
            dataLancamento.setHours(dataLancamento.getHours() + 3);
            dataLancamento.setHours(0, 0, 0, 0);
            
            return dataLancamento.getTime() >= dataCorte.getTime();
        })
        .reduce((acc, curr) => acc + Number(curr.duracao_total || 0), 0);
};

    const formatarHorasHHmm = (totalDecimal: number) => {
        const horas = Math.floor(totalDecimal);
        const minutos = Math.round((totalDecimal - horas) * 60);        
        const horasPad = String(horas).padStart(2, '0');
        const minutosPad = String(minutos).padStart(2, '0');
        
        return `${horasPad}:${minutosPad}`;
    };
    if (!colaborador) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">Colaborador não encontrado</h2>
            <Button onClick={() => navigate("/Collaborators")}>Voltar</Button>
        </div>
    );

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
                        title={colaborador.nome_colaborador}
                        subtitle={colaborador.cargo}
                    >
                        <div className="flex items-center gap-3">
                            <Badge className={colaborador.status ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
                                {colaborador.status ? "Ativo" : "Inativo"}
                            </Badge>
                            {isGerente && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-2"
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
                        {/* Coluna Esquerda */}
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="h-5 w-5 text-blue-600" /> Informações Pessoais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50/50">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">E-mail</p>
                                            <p className="text-sm font-medium">{colaborador.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50/50">
                                        <Calendar className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="text-xs font-bold text-slate-500 uppercase">Admissão</p>
                                            <p className="text-sm font-medium">
                                                {colaborador.data_admissao ? new Date(colaborador.data_admissao).toLocaleDateString("pt-BR") : "Não informada"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-blue-900 text-white shadow-lg border-none">
                                <CardContent>
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-blue-200 text-xs uppercase font-bold tracking-wider">Resumo de Atuação</p>
                                        <CheckCircle2 className="h-5 w-5 text-blue-400 opacity-70" />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-blue-200 text-[10px] uppercase font-semibold">Atividades</p>
                                            <p className="text-3xl font-bold mt-1">
                                                {colaborador.total_atividades || 0}
                                            </p>
                                        </div>
                                        <Separator orientation="vertical" className="h-10 bg-blue-800 mx-6" />

                                        <div className="flex-1">
                                            <p className="text-blue-200 text-[10px] uppercase font-semibold">Projetos</p>
                                            <p className="text-3xl font-bold mt-1">
                                                {colaborador.projeto_colaboradores?.length || 0}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-md flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" /> Atividades
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 overflow-y-auto pr-2">
                                        {colaborador.atividades && colaborador.atividades.length > 0 ? (
                                            colaborador.atividades.map((atv) => (
                                                <Link
                                                    key={atv.atividade_id}
                                                    to={`/atividades/${atv.atividade_id}`}
                                                    className="text-sm p-2 border-b last:border-0 flex justify-between items-center hover:bg-slate-50 transition-colors group"
                                                >
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="truncate font-medium group-hover:text-blue-600 transition-colors" title={atv.nome_atividade}>
                                                            {atv.nome_atividade}
                                                        </span>
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                            <Briefcase className="h-3 w-3" />
                                                            <span className="italic">
                                                                {atv.projetos?.nome_projeto || "Projeto não identificado"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge 
                                                        className={`${statusConfig[atv.status] || "bg-gray-400"} text-white border-none text-[10px] px-2 py-0`}
                                                    >
                                                        {atv.status || "Pendente"}
                                                    </Badge>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">Sem histórico de atividades.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Coluna Direita */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Layout className="h-5 w-5 text-blue-600" /> Projetos Vinculados
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-3 sm:grid-cols-1">
                                        {colaborador.projeto_colaboradores && colaborador.projeto_colaboradores.length > 0 ? (
                                            colaborador.projeto_colaboradores.map((item, idx) => (
                                                <Link
                                                    key={idx}
                                                    to={`/projetos/${item.projetos?.projeto_id}`}
                                                    className="flex items-center gap-2 p-3 border rounded-md shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-all group"
                                                >
                                                    <Briefcase className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform" />
                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">
                                                        {item.projetos?.nome_projeto}
                                                    </span>
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="text-sm text-muted-foreground italic col-span-2">Nenhum projeto vinculado.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white border-blue-100 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-bold text-slate-600 uppercase">Horas Trabalhadas</CardTitle>
                                    <Select value={periodo} onValueChange={(v) => setPeriodo(v)}>
                                        <SelectTrigger className="w-[110px] h-8 text-xs">
                                            <SelectValue placeholder="Período" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dia">Hoje</SelectItem>
                                            <SelectItem value="semana">Últ. Semana</SelectItem>
                                            <SelectItem value="mes">Últ. Mês</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-blue-950">
                                            {formatarHorasHHmm(horasFiltradas)}h
                                        </span>
                                        <BarChart3 className="h-4 w-4 text-blue-500 opacity-50" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">Total acumulado: {formatarHorasHHmm(colaborador?.total_horas || 0)}h</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border-red-100 shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                    <CardTitle className="text-sm font-bold text-slate-600 uppercase">Reembolsos / Despesas</CardTitle>
                                    <DollarSign className="h-4 w-4 text-red-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-tight">Aprovadas</p>
                                        <p className="text-xl font-bold text-green-700">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(colaborador?.valor_despesas_aprovadas || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-tight">Pendentes</p>
                                        <p className="text-xl font-bold text-amber-700">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(colaborador?.valor_despesas_pendentes || 0)}
                                        </p>
                                    </div>
                                    </div>
                                    <Separator className="my-2 opacity-50" />
                                    <p className="text-[10px] text-muted-foreground italic">
                                    Total Geral: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((colaborador?.valor_despesas_aprovadas || 0) + (colaborador?.valor_despesas_pendentes || 0))}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-red-600" /> Histórico de Despesas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {colaborador?.lista_despesas && colaborador.lista_despesas.length > 0 ? (
                                        colaborador.lista_despesas.map((desp: any) => (
                                        <div key={desp.despesa_id} className="flex justify-between items-center p-3 border-b last:border-0 text-sm hover:bg-slate-50 transition-colors">
                                            <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-slate-700">{desp.tipo_despesa}</span>
                                                {/* BADGE DE STATUS DA DESPESA */}
                                                <Badge 
                                                variant="outline" 
                                                className={`text-[9px] uppercase px-1 py-0 h-4 ${
                                                    desp.status_aprovacao === 'Aprovada' ? 'bg-green-50 text-green-700 border-green-200' : 
                                                    desp.status_aprovacao === 'Reprovada' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                    'bg-amber-50 text-amber-700 border-amber-200'
                                                }`}
                                                >
                                                {desp.status_aprovacao}
                                                </Badge>
                                            </div>
                                            <span className="text-slate-500 text-xs italic">{desp.projeto?.nome_projeto || "Sem projeto"}</span>
                                            </div>
                                            
                                            <div className="flex flex-col items-end">
                                            <span className="font-bold text-slate-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(desp.valor)}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                {new Date(desp.data_despesa).toLocaleDateString("pt-BR")}
                                            </span>
                                            </div>
                                        </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic text-center py-4">Nenhum histórico financeiro encontrado.</p>
                                    )}
                                    </div>
                                </CardContent>
                            </Card>


                        </div>
                    </div>
                </main>
            </div>

            <ModalColaboradores
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                colaboradorInicial={colaborador}
                aoSalvar={loadData}
            />
        </div>
    );
}