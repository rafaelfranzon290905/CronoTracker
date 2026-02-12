import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { type Atividades as AtividadeType } from "@/lib/activities";
import { DataTable } from "@/components/activities/data-table-activities";
import { AddActivitiesDialog } from "@/components/activities/addActivitiesDialog";
import { useState, useEffect } from "react";
import { EditActivitiesDialog, type AtividadesInitialData } from "@/components/activities/EditActivitiesDialog";
import { getAtividadesColumns } from "@/components/activities/collumnsActivities";
import { API_BASE_URL } from  "@/apiConfig";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";



// Base da API (MANTENHA O MESMO OU VERIFIQUE SUA PORTA)
// const API_BASE_URL = 'http://localhost:3001';

type ProjetoSelect = {
    projeto_id: number;
    nome_projeto: string;
    status: boolean;
    data_inicio: string;
    projeto_colaboradores?: any[];
}

function Atividades() {
    // ESTADOS PARA O MODAL (Adicionar/Editar)
    //     const [aberto, setAberto] = useState(false);
    //     const [tipo, setTipo] = useState<"add" | "edit" | null>(null);

    // Função para abrir o modal e definir o tipo (add ou edit)
    //     const openModal = (type: "add" | "edit") => {
    //         setTipo(type)
    //         setAberto(true)
    //     }

    // ESTADOS PARA OS DADOS DA ATIVIDADE
    const [atividades, setAtividades] = useState<AtividadeType[]>([]);
    const [loading, setLoading] = useState(true);

    const [projetos, setProjetos] = useState<ProjetoSelect[]>([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [activityToEdit, setActivityToEdit] = useState<AtividadesInitialData | null>(null);

    // Função para buscar os dados da API (GET /atividades)
    const fetchAtividades = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/atividades`);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`)
            }
            const data = await response.json();
            setAtividades(data);
            console.log("Atividades carregadas:", data.length);

        } catch (err) {
            console.error("Erro ao buscar atividades:", err);
            toast.error("Erro ao carregar a lista de atividades.");
        } finally {
            setLoading(false);
        }
    };

    const fetchProjetos = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/projetos`);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const data = await response.json();

            // Mapeia os dados para a interface mais simples
            const projetosMapeados: ProjetoSelect[] = data.map((p: any) => ({
                projeto_id: p.projeto_id,
                nome_projeto: p.nome_projeto,
                status: p.status,
                data_inicio: p.data_inicio,
                projeto_colaboradores: p.projeto_colaboradores || [],
            }));

            setProjetos(projetosMapeados);
            console.log("Projetos carregados:", projetosMapeados.length);

        } catch (err) {
            console.error("Erro ao buscar projetos:", err);
        }
    };

    const projetosAtivos = projetos.filter(p => p.status === true);

    useEffect(() => {
        fetchAtividades();
        fetchProjetos();
    }, []);

    // Recarrega os dados após o cadastro
    const handleAddSuccess = () => {
        toast.success("Atividade criada com sucesso!");
        fetchAtividades();
    };

    // const handleDeleteActivity = async (atividadeId: number) => {
    //     if (!confirm(`Tem certeza que deseja deletar a atividade ${atividadeId}`)) {
    //         return;
    //     }
    //     try {
    //         const response = await fetch(`${API_BASE_URL}/atividades/${atividadeId}`, {
    //             method: 'DELETE',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //         });
    //         if (response.ok) {
    //             toast.success("Atividade excluída com sucesso!");
    //             // window.alert(`Atividade ${atividadeId} deletada com sucesso`);
    //             // console.log(`Atividade ${atividadeId} deletada com sucesso`);
    //             fetchAtividades()
    //         } else {
    //            let errorMessage = "Erro desconhecido";
    //             try {
    //                 const errorData = await response.json();
    //                 errorMessage = errorData.error || errorData.message || response.statusText;
    //             } catch {
    //                 errorMessage = `Erro HTTP: ${response.status}`;
    //             }
                
    //             toast.error(errorMessage);
    //         } 
    //     } catch (err) {
    //         // console.log("Erro ao deletar atividade:", err);
    //         // alert("Erro ao deletar atividade. Verifique o console.");
    //         toast.error("Erro de conexão ao tentar excluir.");
    //     }
    // };

    const handleEditActivity = (activity: AtividadesInitialData) => {
        // Converte a data_prevista_inicio/fim para string 'YYYY-MM-DD'
        const dataInicio = activity.data_prevista_inicio ? new Date(activity.data_prevista_inicio).toISOString().split('T')[0] : '';
        const dataFim = activity.data_prevista_fim ? new Date(activity.data_prevista_fim).toISOString().split('T')[0] : '';
        const prioridadeValida = activity.prioridade || "normal";

        // Define os dados iniciais, garantindo o formato de data correto
        setActivityToEdit({
            ...activity,
            prioridade: prioridadeValida,
            data_prevista_inicio: dataInicio,
            data_prevista_fim: dataFim,
        } as AtividadesInitialData );
        setIsEditModalOpen(true);
    };

    // Função de sucesso após a edição
    const handleEditSuccess = () => {
        toast.success("Atividade atualizada com sucesso!");
        setIsEditModalOpen(false); // Fecha o modal
        fetchAtividades(); // Recarrega a lista
    };

    const tableColumns = getAtividadesColumns(
        fetchAtividades,
        handleEditActivity,
    );



    return (
        <div className="flex h-screen w-full">
            <SideBar />
            <div className="flex-1 p-6 overflow-auto">
                <Header />
                <main className="mt-4">
                    <PageHeader
                        title="Atividades"
                        subtitle="Adicione, edite e visualize suas atividades."
                    >

                    <AddActivitiesDialog projetos={projetosAtivos} onSuccess={handleAddSuccess} />

                    </PageHeader>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
                            <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
                            <p className="text-sm text-muted-foreground animate-pulse">
                                Carregando atividades...
                            </p>
                        </div>
                    ) : (
                        <DataTable<AtividadeType, unknown> columns={tableColumns} data={atividades} />
                    )}
                </main>
            </div>
            {/* NOVO: Componente de Edição */}
            {activityToEdit && (
                <EditActivitiesDialog
                    open={isEditModalOpen}
                    onOpenChange={setIsEditModalOpen}
                    initialData={{
                                ...activityToEdit,
                                prioridade: activityToEdit.prioridade || "normal" 
                            }}                    
                    projetos={projetosAtivos}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    )
}

export default Atividades