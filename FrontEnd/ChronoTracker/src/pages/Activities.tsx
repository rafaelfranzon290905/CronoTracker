import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { type Atividades } from "@/lib/activities";
import { columns } from "@/components/activities/collumnsActivities";
import { DataTable } from "@/components/activities/data-table-activities";
import { AddActivitiesDialog } from "@/components/activities/addActivitiesDialog";
import { useState, useEffect } from "react"; // ⬅️ useEffect JÁ ESTÁ IMPORTADO
import { EditActivitiesDialog } from "@/components/activities/EditActivitiesDialog";

interface Atividade {
    atividade_id: number;
    nome_atividade: string; 
    descr_atividade: string; 
    data_prevista_inicio: string; 
    data_prevista_fim: string;
    status: boolean;
    projetos: any; 
    lancamentos_de_horas: any; 
}

// Base da API (MANTENHA O MESMO OU VERIFIQUE SUA PORTA)
const API_BASE_URL = 'http://localhost:3001';

function Atividades() {
    // ESTADOS PARA O MODAL (Adicionar/Editar)
    const [aberto, setAberto] = useState(false);
    const [tipo, setTipo] = useState<"add" | "edit" | null>(null)

    const [atividadeEmEdicaoId, setAtividadeEmEdicaoId] = useState<number | null>(null)
    
    // Função para abrir o modal e definir o tipo (add ou edit)
    const openModal = (type: "add" | "edit", atividadeId: number | null = null) => {
        setAtividadeEmEdicaoId(atividadeId);
        setTipo(type)
        setAberto(true)
    }

    // Função que será passada para as colunas
    const handleEditActivity = (atividadeId: number) => {
        // 🎯 AÇÃO: Abre o modal de edição passando o ID da atividade
        openModal("edit", atividadeId);
    };

    // Função para fechar e resetar o estado (será usada dentro do modal)
    const handleCloseEdit = () => {
        setAberto(false);
        setTipo(null);
        setAtividadeEmEdicaoId(null);
    }

    // ESTADOS PARA OS DADOS DA ATIVIDADE
    const [atividades, setAtividades] = useState<Atividade[]>([]);
    const [loading, setLoading] = useState(true);
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
    
    // ⬅️ ADIÇÃO CRUCIAL: Chama fetchAtividades apenas uma vez ao montar o componente
    useEffect(() => {
        fetchAtividades();
    }, []); 

    // 💡 1. DEFINIR A FUNÇÃO DE SUCESSO: Recarrega os dados após o cadastro
    const handleAddSuccess = () => {
        // Recarrega a lista de atividades para mostrar a nova atividade
        fetchAtividades(); 
    };

    const handleDeleteActivity = async (atividadeId: number) => {
        if (!confirm(`Tem certeza que deseja deletar a atividade com ID ${atividadeId}?`)) {
            return; // Cancela se o usuário não confirmar
        }

        try {
            // 1. Chamada DELETE para a API
            const response = await fetch(`${API_BASE_URL}/atividades/${atividadeId}`, {
                method: 'DELETE',
            });

            // 2. Verifica se a exclusão foi bem-sucedida (status 204 No Content)
            if (response.status === 204) {
                window.alert(`Atividade ${atividadeId} deletada com sucesso`)
                console.log(`Atividade ${atividadeId} deletada com sucesso!`);
                
                // 3. Recarrega a lista para atualizar a tabela
                fetchAtividades(); 
            } else if (response.status === 404) {
                const errorData = await response.json();
                alert(`Erro ao deletar: ${errorData.error}`);
            } else {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
        } catch (err) {
            console.error("Erro ao deletar atividade:", err);
            alert("Erro ao deletar atividade. Verifique o console.");
        }
    };
  

  return (
    <div className="flex h-screen bg-background text-foreground">
      <SideBar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 ">
          <PageHeader
            title="Atividades"
            subtitle="Adicione, edite e visualize suas atividades."
          >
            {/* O AddActivitiesDialog foi mantido como um comentário, assumindo que você lidará com projetos separadamente. */}
            <AddActivitiesDialog onSuccess={handleAddSuccess}/>
          </PageHeader>

            {/* Opcional: Adicionar um loading state simples */}
            {loading ? (
                <div className="text-center py-12">Carregando atividades...</div>
            ) : (
                <DataTable<Atividades, unknown> columns={columns(handleDeleteActivity, handleEditActivity)} data={atividades} />
            )}
        </main>
      </div>

        {/* ✅ NOVO COMPONENTE: Modal de Edição */}
            {aberto && tipo === "edit" && atividadeEmEdicaoId !== null && (
                 <EditActivitiesDialog 
                    atividadeId={atividadeEmEdicaoId} // Passa o ID da atividade
                    open={aberto}
                    onOpenChange={handleCloseEdit} // Fecha o modal
                    onSuccess={fetchAtividades} // Recarrega os dados após a edição
                />
            )}
    </div>
  )
}

export default Atividades