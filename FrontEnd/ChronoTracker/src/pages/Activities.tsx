import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { type Atividades as AtividadeType } from "@/lib/activities";
import { DataTable } from "@/components/activities/data-table-activities";
import { AddActivitiesDialog } from "@/components/activities/addActivitiesDialog";
import { useState, useEffect } from "react"; // ⬅️ useEffect JÁ ESTÁ IMPORTADO
import { EditActivitiesDialog, type AtividadesInitialData } from "@/components/activities/EditActivitiesDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { getAtividadesColumns } from "@/components/activities/collumnsActivities";

// Base da API (MANTENHA O MESMO OU VERIFIQUE SUA PORTA)
const API_BASE_URL = 'http://localhost:3001';

type ProjetoSelect = {
    projeto_id: number;
    nome_projeto: string;
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

    const {isGerente} = usePermissions()
    // const [error, setError] = useState(null);

    // ----------------------------------------------------------------------
    // 2. Função para buscar os dados da API (GET /atividades)
    const fetchAtividades = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/atividades`);

            if (!response.ok){
                throw new Error(`Erro HTTP: ${response.status}`)
            }
            const data = await response.json();
            setAtividades(data);
            // Opcional: Para debugar, veja o que a API retornou
            console.log("Atividades carregadas:", data.length);

        } catch (err) {
            console.error("Erro ao buscar atividades:", err);
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
                projeto_colaboradores: p.projeto_colaboradores || [],
            }));
            
            setProjetos(projetosMapeados);
            console.log("Projetos carregados:", projetosMapeados.length);

        } catch (err) {
            console.error("Erro ao buscar projetos:", err);
        }
    };
    
    // ⬅️ ADIÇÃO CRUCIAL: Chama fetchAtividades apenas uma vez ao montar o componente
    useEffect(() => {
        fetchAtividades();
        fetchProjetos();
    }, []); 

    // 💡 1. DEFINIR A FUNÇÃO DE SUCESSO: Recarrega os dados após o cadastro
    const handleAddSuccess = () => {
        // Recarrega a lista de atividades para mostrar a nova atividade
        fetchAtividades(); 
    };

    const handleDeleteActivity = async (atividadeId: number) => {
        if(!confirm(`Tem certeza que deseja deletar a atividade ${atividadeId}`)){
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/atividades/${atividadeId}`, {
                method: 'DELETE',
            });
            if(response.status === 204) {
                window.alert(`Atividade ${atividadeId} deletada com sucesso`);
                console.log(`Atividade ${atividadeId} deletada com sucesso`);
                fetchAtividades()
            } else if (response.status === 404) {
                const errorData = await response.json();
                alert(`Erro ao deletar: ${errorData.error}`);
            } else {
                throw new Error(`Erro HTTP: ${response.status}`);
            } 
        } catch (err) {
                console.log("Erro ao deletar atividade:", err);
                alert("Erro ao deletar atividade. Verifique o console.");
            }
        };

        const handleEditActivity = (activity: AtividadesInitialData) => {
        // Converte a data_prevista_inicio/fim para string 'YYYY-MM-DD'
        const dataInicio = activity.data_prevista_inicio ? new Date(activity.data_prevista_inicio).toISOString().split('T')[0] : '';
        const dataFim = activity.data_prevista_fim ? new Date(activity.data_prevista_fim).toISOString().split('T')[0] : '';
        
        // Define os dados iniciais, garantindo o formato de data correto
        setActivityToEdit({
            ...activity,
            data_prevista_inicio: dataInicio,
            data_prevista_fim: dataFim,
        });
        setIsEditModalOpen(true);
    };

    // Função de sucesso após a edição
    const handleEditSuccess = () => {
        setIsEditModalOpen(false); // Fecha o modal
        fetchAtividades(); // Recarrega a lista
    };

    const tableColumns = getAtividadesColumns(
        isGerente,
        handleDeleteActivity,
        handleEditActivity,
    );



  return (
    <div className="flex h-screen bg-background text-foreground">
      <SideBar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-0 md:p-0 ">
          <PageHeader
            title="Atividades"
            subtitle="Adicione, edite e visualize suas atividades."
          >
            {isGerente && (
            <AddActivitiesDialog projetos={projetos} onSuccess={handleAddSuccess}/>
            )}

{/* O AddActivitiesDialog foi mantido como um comentário, assumindo que você lidará com projetos separadamente. */}
            
          </PageHeader>

            {/* Opcional: Adicionar um loading state simples */}
            {loading ? (
                <div className="text-center py-12">Carregando atividades...</div>
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
                    initialData={activityToEdit}
                    projetos={projetos}
                    onSuccess={handleEditSuccess}
                />
            )}
    </div>
  )
}

export default Atividades