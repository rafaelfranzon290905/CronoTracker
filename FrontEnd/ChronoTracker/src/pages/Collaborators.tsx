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
import { API_BASE_URL } from  "@/apiConfig"


// const API_BASE_URL = 'http://localhost:3001';

function Collaborators() {
  {/* armazena os colaboradores vindo da api */ }
  const [data, setData] = useState<Collaborador[]>([]);
  const [loading, setLoading] = useState(true);

  {/* controla as edições */ }
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborador | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
  if (!confirm("Tem certeza que deseja excluir este colaborador?")) return;

  try {
    const response = await fetch(`${API_BASE_URL}/colaboradores/${id}`, {
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
            {isGerente &&
              <AddCollaboratorDialog onSuccess={fetchData} />
            }
            
  
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
    </div>
  )
}

export default Collaborators
