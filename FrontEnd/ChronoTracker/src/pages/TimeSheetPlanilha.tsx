import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Header from "@/components/componentes/Header"
import SideBar from "@/components/componentes/SideBar"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { DataTable } from "@/components/collaborators/data-table"; 
import { getTimesheetColumns } from "../components/Timesheets/collums";
import { usePermissions } from "@/hooks/usePermissions";
import { Users, User, Loader2, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from  "@/apiConfig"
import { EditTimeEntryModal } from "@/components/Timesheets/EditTimeEntryModal";
import { toast } from "sonner";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

export default function TimesheetPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verEquipe, setVerEquipe] = useState(false);
  const { isGerente, user } = usePermissions();

  // Estados para Modal de Edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  // Estados para Alerta de Exclusão (Substituindo o confirm nativo)
  const [isDelAlertOpen, setIsDelAlertOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const fetchData = async () => {
    const idParaBusca = (user as any)?.id || user?.usuario_id;
    if (!idParaBusca) return; 

    setLoading(true);
    try {
      const params = new URLSearchParams({
        usuario_id: idParaBusca.toString(),
        cargo: verEquipe ? "gerente" : "colaborador"
      });
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/lancamentos?${params}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      if (!response.ok) throw new Error("Erro na requisição");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Erro ao buscar lancamentos:", error);
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [verEquipe, user]);

  const handleStatusUpdate = async (id: number, novoStatus: 'aprovado' | 'rejeitado') => {
    try {
      const response = await fetch(`${API_BASE_URL}/lancamentos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus, cargo: 'gerente' })
      });
      if (response.ok) {
        toast.success(`Lançamento ${novoStatus} com sucesso!`);
        fetchData();
      }
    } catch (error) {
      toast.error("Erro ao atualizar status.");
    }
  };

  const handleEdit = (lancamento: any) => {
    setSelectedEntry(lancamento);
    setEditModalOpen(true);
  };

  // Abre o alerta de confirmação em vez do confirm() do navegador
  const handleDelete = (id: number) => {
    setIdToDelete(id);
    setIsDelAlertOpen(true);
  };

  // Função que realmente executa o DELETE
  const confirmDeletion = async () => {
    if (!idToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/lancamentos/${idToDelete}`, { 
        method: 'DELETE' 
      });

      if (response.ok) {
        toast.success("Lançamento excluído com sucesso");
        fetchData();
      } else {
        toast.error("Erro ao excluir lançamento.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setIsDelAlertOpen(false);
      setIdToDelete(null);
    }
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
              <Link to="/TimeSheet/Lancamentos">
                <Button className="bg-botao-dark rounded-2xl text-white hover:bg-blue-800 mx-3">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Lançar horas
                </Button>
              </Link>
            </div>
          </PageHeader>
            
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
              <p className="text-sm text-muted-foreground animate-pulse">Carregando lançamentos...</p>
            </div>
          ) : (
            <DataTable 
              columns={getTimesheetColumns(isGerente, verEquipe)} 
              data={data}
              filterColumn={colunaParaFiltrar}
              filterPlaceholder={verEquipe ? "Filtrar por colaborador..." : "Filtrar por projeto..."}
              meta={{ 
                onEdit: handleEdit, 
                onDelete: handleDelete,
                onApprove: (id: number) => handleStatusUpdate(id, 'aprovado'),
                onReject: (id: number) => handleStatusUpdate(id, 'rejeitado')
              }}
            />
          )}

          {/* Modal de Edição */}
          <EditTimeEntryModal 
  open={editModalOpen} 
  onOpenChange={setEditModalOpen}
  entry={selectedEntry}
  onSave={async (id: number, updatedData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/lancamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // O updatedData agora vem completo do modal
          projeto_id: updatedData.projeto_id,
          atividade_id: updatedData.atividade_id,
          cliente_id: updatedData.cliente_id,
          data_lancamento: updatedData.data_lancamento,
          hora_inicio: updatedData.hora_inicio,
          hora_fim: updatedData.hora_fim,
          descricao: updatedData.descricao,
          motivo_edicao: updatedData.motivo_edicao,
        })
      });

                if (response.ok) {
                  toast.success("Lançamento atualizado!");
                  fetchData();
                  setEditModalOpen(false);
                } else {
                  const errorData = await response.json();
                  toast.error(errorData.error || "Erro ao atualizar");
                }
              } catch (error) {
                toast.error("Erro de conexão.");
              }
            }}
          />

          {/* Alerta de Exclusão Shadcn */}
          <AlertDialog open={isDelAlertOpen} onOpenChange={setIsDelAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Lançamento</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja remover este registro de horas? 
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIdToDelete(null)}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDeletion}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Excluir Permanentemente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
}