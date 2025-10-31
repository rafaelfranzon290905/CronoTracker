
import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { type Collaborador } from "@/lib/types";
import { columns } from "@/components/collaborators/columns";
import { DataTable } from "@/components/collaborators/data-table";
import { AddCollaboratorDialog } from "@/components/collaborators/AddCollaboratorDialog";

// No futuro, estes dados virão da sua API ou base de dados
const MOCK_DATA: Collaborador[] = [
  {
    id: "COL-001",
    name: "Ana Silva",
    cpf: "12345678901",
    role: "Desenvolvedora Frontend",
    email: "ana.silva@chronotracker.com",
    dataEntrada: "10/05/2022", 
    projects: ["ChronoTracker V2", "Internal Dashboard"],
  },
  {
    id: "COL-002",
    name: "Bruno Costa",
    cpf: "23456789012",
    role: "Desenvolvedor Backend",
    email: "bruno.costa@chronotracker.com",
    dataEntrada: "07/04/2024", 
    projects: ["ChronoTracker V2", "API Gateway"],
  },
  {
    id: "COL-003",
    name: "Carla Mendes",
    cpf: "34567890123",
    role: "UI/UX Designer",
    email: "carla.mendes@chronotracker.com",
    dataEntrada: "09/07/2019", 
    projects: ["ChronoTracker V2"],
  },
  {
    id: "COL-004",
    name: "Diego Santos",
    cpf: "45678901234",
    role: "Gerentee Projetos",
    email: "diego.santos@chronotracker.com",
    dataEntrada: "20/08/2020", 
    projects: ["ChronoTracker V2", "Internal Dashboard", "API Gateway"],
  },
];


function Collaborators() {
  
  const data = MOCK_DATA;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <SideBar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 ">
          <PageHeader
            title="Gerenciar Colaboradores"
            subtitle="Adicione, edite e visualize os membros da sua equipe."
          >
            <AddCollaboratorDialog />
          </PageHeader>
          <DataTable columns={columns} data={data} />
        </main>
      </div>
    </div>
  )
}

export default Collaborators
