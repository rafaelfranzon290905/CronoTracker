import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { type Atividades } from "@/lib/activities";
import { columns } from "@/components/activities/collumnsActivities";
import { DataTable } from "@/components/activities/data-table-activities";
import { AddProjectDialog } from "@/components/activities/addActivitieDialog";

// No futuro, estes dados virão da sua API ou base de dados
const MOCK_CLIENTES = [
  { id: "CLI-001", nome: "Empresa Alpha" },
  { id: "CLI-002", nome: "Tech Solutions" },
  { id: "CLI-003", nome: "Fitness Pro" },
];

const MOCK_DATA_ATIVIDADE: Atividades[] = [
  {
    idAtividade: "1",
    projeto_id: "Sistema ERP",
    nome_atividade: "Implementar login",
    descr_atividade: "Desenvolver autenticação de usuários.",
    dataInicioAtividade: "2025-11-01",
    dataFimAtividade: "2025-11-10",
    status: "em_andamento",
  },
  {
    idAtividade: "2",
    projeto_id: "App Financeiro",
    nome_atividade: "Criar dashboard",
    descr_atividade: "Montar tela de visualização de despesas.",
    dataInicioAtividade: "2025-11-05",
    dataFimAtividade: "2025-11-20",
    status: "a_fazer",
  },
];

function Atividade() {
  const dataProjetos = MOCK_DATA_ATIVIDADE;

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
            <AddProjectDialog projetos={MOCK_CLIENTES}/>
          </PageHeader>
          <DataTable<Atividades, unknown> columns={columns} data={dataProjetos} />
        </main>
      </div>
    </div>
  )
}

export default Atividade

