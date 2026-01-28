import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { useState, useEffect, useMemo } from "react";
import { type Projeto } from "@/lib/projects";
// import { getColumns } from "@/components/projects/collumnsProjects";
import { DataTable } from "@/components/projects/data-table-projects";
import { AddProjectDialog } from "@/components/projects/addProjectDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { getProjetosColumns } from "@/components/projects/collumnsProjects";
import { API_BASE_URL } from  "@/apiConfig"
import { Loader2 } from "lucide-react";


// export interface Projeto {
//     projeto_id: number;
//     cliente_id: number;
//     nome_projeto: string;
//     descricao?: string;
//     data_inicio: string;
//     data_fim: string;
//     status: boolean;
//     horas_previstas: number; // <-- Novo campo
//     clientes?: {
//         nome_cliente: string;
//     };
//     atividades?: {
//       atividade_id: number;
//         nome_atividade: string;
//         status: boolean;
//     }[];
//     projeto_colaboradores?: {
//       colaboradores: {
//         colaborador_id: number;
//         nome_colaborador: string;
//       }
//     }[];
// }

function Projetos() {
  const [data, setData] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {isGerente} = usePermissions()

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, cliRes] = await Promise.all([
        fetch(`${API_BASE_URL}/projetos`),
        fetch(`${API_BASE_URL}/clientes`)
      ]);
      
      const projetos = await projRes.json();
      const listaClientes = await cliRes.json();

      setData(projetos);
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //garante que as colunas só recriem se clientes mudarem
  const columns = useMemo(() => getProjetosColumns(clientes, isGerente, fetchData), [clientes, isGerente]);

  return (
    <div className="flex h-screen w-full">
      <SideBar />
      <div className="flex-1 p-6 overflow-auto">
        <Header />
        <main className="mt-4">
          <PageHeader
            title="Projetos"
            subtitle="Adicione, edite e visualize os seus projetos."
          >
            {isGerente && 
              <AddProjectDialog clientes={clientes} onSuccess={fetchData}/>
            }
          </PageHeader>
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Carregando projetos...
              </p>
            </div>
          ) : (
          <DataTable<Projeto, unknown> columns={columns} data={data} />
          )}
        </main>
      </div>
    </div>
  )
}

export default Projetos

