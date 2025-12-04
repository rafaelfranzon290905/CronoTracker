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

const API_BASE_URL = 'http://localhost:3001';

function Collaborators() {
  const [data, setData] = useState<Collaborador[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingCollaborator, setEditingCollaborator] = useState<Collaborador | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/colaboradores`);
      if (!response.ok) throw new Error("Erro ao buscar dados");
      
      const result = await response.json();
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

  const deleteColaborador = async (colaborador_id: number) => {
    try {
      if (!window.confirm(`Tem certeza que deseja excluir o colaborador com ID ${colaborador_id}?`)) {
        return; 
      }

      const response = await fetch(`${API_BASE_URL}/colaboradores/${colaborador_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      alert('Colaborador excluído com sucesso!');
      fetchData(); // Atualiza a lista após excluir

    } catch (error: any) {
      console.error('Erro na exclusão:', error);
      alert(error.message || 'Ocorreu um erro ao tentar excluir o colaborador.');
    }
  };

  const handleEdit = (colaborador: Collaborador) => {
    setEditingCollaborator(colaborador);
    setIsEditModalOpen(true);
  };

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
            <AddCollaboratorDialog onSuccess={fetchData} />
          </PageHeader>
          
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Carregando colaboradores...</div>
          ) : (
            /* --- CORREÇÃO AQUI --- */
            <DataTable 
                columns={columns} 
                data={data} 
                meta={{ 
                    onEdit: handleEdit, 
                    onDelete: deleteColaborador  // Passamos a função delete aqui
                }} 
            />
          )}
        </main>
      </div>
      <ModalColaboradores 
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        colaboradorInicial={editingCollaborator}
        aoSalvar={fetchData}
      />
    </div>
  )
}

export default Collaborators