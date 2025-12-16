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
  {/* armazena os colaboradores vindo da api */ }
  const [data, setData] = useState<Collaborador[]>([]);
  const [loading, setLoading] = useState(true);

  {/* controla as edições */ }
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborador | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  {/* busca e atualiza dados */ }
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

{/* passa função via prop para o botao editar */ }
  const handleEdit = (colaborador: Collaborador) => {
    setEditingCollaborator(colaborador);
    setIsEditModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <SideBar />
      {/* Conteúdo */}
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
            <DataTable 
                columns={columns} 
                data={data} 
                meta={{ onEdit: handleEdit }} 
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
