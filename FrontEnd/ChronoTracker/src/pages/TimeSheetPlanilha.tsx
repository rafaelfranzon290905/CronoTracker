import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/componentes/Header"
import SideBar from "@/components/componentes/SideBar"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { DataTable } from "@/components/collaborators/data-table"; 
import { getTimesheetColumns } from "../components/Timesheets/collums";
import { usePermissions } from "@/hooks/usePermissions";
import { Users, User, Loader2 } from "lucide-react";
// import { AddTimeEntryDialog } from "../components/Timesheets/AddTimeEntryDialog"; // Criaremos a seguir
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { API_BASE_URL } from  "@/apiConfig"
// const API_BASE_URL = 'http://localhost:3001';

export default function TimesheetPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verEquipe, setVerEquipe] = useState(false);
  const { isGerente, user } = usePermissions();

  const fetchData = async () => {
    const idParaBusca = (user as any)?.id || user?.usuario_id;
    if (!idParaBusca) {
      return; 
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        usuario_id: idParaBusca.toString() || "",
        cargo: verEquipe ? "gerente" : "colaborador"
      });
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/lancamentos?${params}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error("Erro na requisição");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao buscar lancamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [verEquipe, user]);

  const handleStatusUpdate = async (id: number, novoStatus: 'aprovado' | 'rejeitado') => {
    await fetch(`${API_BASE_URL}/lancamentos/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: novoStatus, cargo: 'gerente' })
    });
    fetchData();
  };

  const colunaParaFiltrar = verEquipe ? "nome_colaborador" : "projetos_nome_projeto";

  return (
    <div className="flex h-screen w-full">
      <SideBar />
      <div className="flex-1 p-6 overflow-auto">
        <Header />
        <main className="mt-4">
          <PageHeader 
            title="Timesheet" 
            subtitle={verEquipe ? "Gestão de horas da equipe" : "Seus lançamentos de horas"}
          >
            <div className="flex gap-2">
              {isGerente && (
                <Button 
                  variant="outline" 
                  onClick={() => setVerEquipe(!verEquipe)}
                  className={verEquipe ? "bg-blue-50 border-blue-200" : ""}
                >
                  {verEquipe ? <User className="mr-2" size={18}/> : <Users className="mr-2" size={18}/>}
                  {verEquipe ? "Ver Minhas Horas" : "Ver Equipe"}
                </Button>
              )}
              <Link to="/TimeSheet/Lancamentos"><Button className="bg-botao-dark rounded-2xl text-white hover:bg-blue-800 mx-3">
                <PlusCircle className="mr-2 h-4 w-4" />
                Lançar horas</Button></Link>
            </div>
          </PageHeader>
            
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Carregando lançamentos...
              </p>
            </div>
          ) : (
          <DataTable 
            columns={getTimesheetColumns(isGerente, verEquipe)} 
            data={data}
            filterColumn={colunaParaFiltrar}
            filterPlaceholder={verEquipe ? "Filtrar por colaborador..." : "Filtrar por projeto..."}
            meta={{ 
              onApprove: (id: number) => handleStatusUpdate(id, 'aprovado'),
              onReject: (id: number) => handleStatusUpdate(id, 'rejeitado')
            }}
          />
          )}
        </main>
      </div>
    </div>
  );
}