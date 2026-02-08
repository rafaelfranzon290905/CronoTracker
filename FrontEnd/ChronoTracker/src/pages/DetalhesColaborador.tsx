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

export default function DetalhesColaborador() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isGerente } = usePermissions();
    const [colaborador, setColaborador] = useState<Collaborador | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    useEffect(() => { loadData(); }, [id]);

    if (loading) return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
        </div>
    );

    if (!colaborador) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">Colaborador não encontrado</h2>
            <Button onClick={() => navigate("/Collaborators")}>Voltar</Button>
        </div>
    );

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
                            <Badge className={colaborador.status ? "bg-green-600" : "bg-red-600"}>
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
                        {/* Coluna Esquerda: Informações e Projetos */}
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
                                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
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
                                                    <Badge variant="outline" className="text-[10px] group-hover:border-blue-300">
                                                        {atv.status ? "Ativa" : "Concluída"}
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

                        {/* Coluna Direita: Resumo e Atividades */}
                        <div className="space-y-6">
                            <Card className="bg-blue-900 text-white">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-blue-200 text-xs uppercase font-bold tracking-wider">Total Atividades</p>
                                            <p className="text-3xl font-bold mt-1">{colaborador.total_atividades || 0}</p>
                                        </div>
                                        <CheckCircle2 className="h-8 w-8 text-blue-400 opacity-50" />
                                    </div>
                                </CardContent>
                            </Card>

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