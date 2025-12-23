import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { useState, useEffect, useMemo } from "react";
import { type Projeto } from "@/lib/projects";
import { getColumns } from "@/components/projects/collumnsProjects";
import { DataTable } from "@/components/projects/data-table-projects";
import { AddProjectDialog } from "@/components/projects/addProjectDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { getProjetosColumns } from "@/components/projects/collumnsProjects";

export interface Projeto {
    projeto_id: number;
    cliente_id: number;
    nome_projeto: string;
    descricao?: string;
    data_inicio: string;
    data_fim: string;
    status: boolean;
    horas_previstas: number; // <-- Novo campo
    clientes?: {
        nome_cliente: string;
    };
}

function Projetos() {
  const [data, setData] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);

  const {isGerente} = usePermissions()

  const fetchData = async () => {
    try {
      const [projRes, cliRes] = await Promise.all([
        fetch('http://localhost:3001/projetos'),
        fetch('http://localhost:3001/clientes')
      ]);
      
      const projetos = await projRes.json();
      const listaClientes = await cliRes.json();

      setData(projetos);
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //garante que as colunas só recriem se clientes mudarem
  const columns = useMemo(() => getProjetosColumns(clientes, isGerente, fetchData), [clientes, isGerente]);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <SideBar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 ">
          <PageHeader
            title="Projetos"
            subtitle="Adicione, edite e visualize os seus projetos."
          >
            {isGerente && 
              <AddProjectDialog clientes={clientes} onSuccess={fetchData}/>
            }
          </PageHeader>
          <DataTable<Projeto, unknown> columns={columns} data={data} />
        </main>
      </div>
    </div>
  )
}

export default Projetos

