import SideBar from "@/components/componentes/SideBar";
import Header from "@/components/componentes/Header";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/components/projects/data-table-projects";
import { AddProjectDialog } from "@/components/projects/addProjectDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { getProjetosColumns } from "@/components/projects/collumnsProjects";
import { API_BASE_URL } from "@/apiConfig";

export interface Projeto {
  projeto_id: number;
  cliente_id: number;
  nome_projeto: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  status: boolean;
  horas_previstas: number;
  clientes?: {
    nome_cliente: string;
  };
}

function Projetos() {
  const [data, setData] = useState<Projeto[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const { isGerente } = usePermissions();

  const fetchData = async () => {
    try {
      const [projRes, cliRes] = await Promise.all([
        fetch(`${API_BASE_URL}/projetos`),
        fetch(`${API_BASE_URL}/clientes`)
      ]);

      const projetos: Projeto[] = await projRes.json();
      const listaClientes = await cliRes.json();

      projetos.sort((a, b) =>
        a.nome_projeto.localeCompare(b.nome_projeto, "pt-BR", {
          sensitivity: "base",
        })
      );

      setData(projetos);
      setClientes(listaClientes);
    } catch (error) {
      console.error("Erro ao carregar dados", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = useMemo(
    () => getProjetosColumns(clientes, isGerente, fetchData),
    [clientes, isGerente]
  );

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
            {isGerente && (
              <AddProjectDialog clientes={clientes} onSuccess={fetchData} />
            )}
          </PageHeader>

          <DataTable columns={columns} data={data} />
        </main>
      </div>
    </div>
  );
}

export default Projetos;
