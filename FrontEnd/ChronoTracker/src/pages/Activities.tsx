import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { type Atividades } from "@/lib/activities";
import { columns } from "@/components/activities/collumnsActivities";
import { DataTable } from "@/components/activities/data-table-activities";
import { AddProjectDialog } from "@/components/activities/addActivitieDialog";
import { useState, useEffect } from "react"; // ⬅️ useEffect JÁ ESTÁ IMPORTADO

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
    
    // Função para abrir o modal e definir o tipo (add ou edit)
    const openModal = (type: "add" | "edit") => {
        setTipo(type)
        setAberto(true)
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
            {/* O AddProjectDialog foi mantido como um comentário, assumindo que você lidará com projetos separadamente. */}
            <AddProjectDialog/>
          </PageHeader>

            {/* Opcional: Adicionar um loading state simples */}
            {loading ? (
                <div className="text-center py-12">Carregando atividades...</div>
            ) : (
                <DataTable<Atividades, unknown> columns={columns} data={atividades} />
            )}
        </main>
      </div>
    </div>
  )
}

export default Atividades