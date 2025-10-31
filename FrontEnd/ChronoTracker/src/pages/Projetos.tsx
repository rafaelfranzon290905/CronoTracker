import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { type Projeto } from "@/lib/projects";
import { columns } from "@/components/projects/collumnsProjects";
import { DataTable } from "@/components/projects/data-table-projects";
import { AddProjectDialog } from "@/components/projects/addProjectDialog";

// No futuro, estes dados virão da sua API ou base de dados
const MOCK_CLIENTES = [
  { id: "CLI-001", nome: "Empresa Alpha" },
  { id: "CLI-002", nome: "Tech Solutions" },
  { id: "CLI-003", nome: "Fitness Pro" },
];

const MOCK_DATA: Projeto[] = [
  {
    idProjeto: "PROJ-001",
    cliente: "Empresa Alpha",
    name: "Sistema de Gestão Comercial",
    Descricao: "Desenvolvimento de um sistema ERP para controle de vendas e estoque.",
    dataEntrada: "01/10/2025",
    dataFim: "15/12/2025",
    status: true,
  },
  {
    idProjeto: "PROJ-002",
    name: "Portal Clientes",
    cliente: "Tech Solutions",
    Descricao: "Criação de um portal online para autoatendimento de clientes.",
    dataEntrada: "20/09/2025",
    dataFim: "30/11/2025",
    status: true,
  },
  {
    idProjeto: "PROJ-003",
    name: "Aplicativo Mobile",
    cliente: "Fitness Pro",
    Descricao: "Desenvolvimento de um aplicativo mobile para Android e iOS.",
    dataEntrada: "10/08/2025",
    dataFim: "01/12/2025",
    status: true,
  }
];

function Projetos() {
  const dataProjetos = MOCK_DATA;

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
            <AddProjectDialog clientes={MOCK_CLIENTES}/>
          </PageHeader>
          <DataTable<Projeto, unknown> columns={columns} data={dataProjetos} />
        </main>
      </div>
    </div>
  )
}

export default Projetos

