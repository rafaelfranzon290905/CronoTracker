'use client'
import { useEffect, useState } from "react";
import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { PageHeader } from "@/components/componentes/TituloPagina";
import { type Collaborador } from "@/lib/types";
import { columns } from "@/components/collaborators/columns";
import { DataTable } from "@/components/collaborators/data-table";
import { AddCollaboratorDialog } from "@/components/collaborators/AddCollaboratorDialog";
import { ModalColaboradores } from "@/components/collaborators/modal-colaborador";
import { usePermissions } from "@/hooks/usePermissions";
import { getColaboradorColumns } from "@/components/collaborators/columns";
import { API_BASE_URL } from  "@/apiConfig";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


// const API_BASE_URL = 'http://localhost:3001';

function Collaborators() {
  {/* armazena os colaboradores vindo da api */ }
  const [data, setData] = useState<Collaborador[]>([]);
  const [loading, setLoading] = useState(true);

  {/* controla as edições */ }
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborador | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [colabToInactivate, setColabToInactivate] = useState<Collaborador | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Permissões
  const {isGerente} = usePermissions()

  {/* busca e atualiza dados */ }
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/colaboradores`);
      if (!response.ok) throw new Error("Erro ao buscar dados");
      
      const result = await response.json();
      console.log("DADOS DOS COLABORADORES: ", result);
      setData(result); 
    } catch (error) {
      console.error("Erro no fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

{/* passa função via prop para o botao editar */ }
  const handleEdit = (colaborador: Collaborador) => {
    setEditingCollaborator(colaborador);
    setIsEditModalOpen(true);
  };

const handleDelete = async (id: number) => {
  const colab = data.find(c => c.colaborador_id === id);
  if (colab) {
      setColabToInactivate(colab);
      setIsConfirmOpen(true);
    }
};

const confirmInactivation = async () => {
  if (!colabToInactivate) return;
   try {
    const response = await fetch(`${API_BASE_URL}/colaboradores/${colabToInactivate.colaborador_id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      fetchData();
      alert("Colaborador excluído com sucesso!");
    } else {
      const errorData = await response.json();
      alert(errorData.error || "Erro ao excluir colaborador.");
    }
  } catch (error) {
    console.error("Erro na requisição de exclusão:", error);
    alert("Erro interno ao tentar excluir.");
  } finally {
    setIsConfirmOpen(false);
    setColabToInactivate(null);
  }
};

  return (
    <div className="flex h-screen w-full">
      <SideBar />
      <div className="flex-1 p-6 overflow-auto">
        <Header />
        <main className="mt-4">
          <PageHeader
            title="Gerenciar Colaboradores"
            subtitle="Adicione, edite e visualize os membros da sua equipe."
          >
            {/* {isGerente &&
              <AddCollaboratorDialog onSuccess={fetchData} />
            } */}
          </PageHeader>
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Carregando colaboradores...</div>
          ) : (
            <DataTable 
                columns={getColaboradorColumns(isGerente)} 
                data={data} 
                meta={{ onEdit: handleEdit, onDelete: handleDelete }} 
            />
          )}
        </main>
      </div>
      <ModalColaboradores 
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        colaboradorInicial={editingCollaborator}
        aoSalvar={fetchData} // Quando salvar, recarrega a tabela
      />
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Inativação</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja inativar <b>{colabToInactivate?.nome_colaborador}</b>? 
              Isso também afetará o acesso do usuário vinculado a este colaborador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmInactivation}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Collaborators
