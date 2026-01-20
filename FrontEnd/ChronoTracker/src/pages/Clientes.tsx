import { useState, useEffect, useMemo } from "react";
import Header from "@/components/componentes/Header";
import SideBar from "@/components/componentes/SideBar";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { DataTable } from "@/components/clientes/data-table-clients";
import { getColumns } from "@/components/clientes/collumnsClients";
import { ModalCliente } from "@/components/clientes/ModalClientes";
import { ModalProjetos } from "@/components/clientes/ModalVerProjetos";
import DialogClientes from "@/components/componentes/DialogClientes"; // Modal de Adição
import { usePermissions } from "@/hooks/usePermissions";
import { type Cliente } from "@/lib/clients";
import { API_BASE_URL } from "@/apiConfig";
import { toast } from "sonner";
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

function Clientes() {
  const [data, setData] = useState<Cliente[]>([]);
  const [addModalAberto, setAddModalAberto] = useState(false);
  const [editModalAberto, setEditModalAberto] = useState(false);
  const [projetoModalAberto, setProjetoModalAberto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [clienteParaProjetos, setClienteParaProjetos] = useState<{ id: number; nome: string } | null>(null);
  const [confirmExclusaoAberta, setConfirmExclusaoAberta] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  
  const { isGerente } = usePermissions();

  const fetchClientes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`);
      const data = await response.json();
      setData(data);
    } catch (err) {
      toast.error("Erro ao carregar clientes.");
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleDelete = async (id: number) => {
    if (!idParaExcluir) return;

    try {
      const res = await fetch(`${API_BASE_URL}/clientes/${idParaExcluir}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success("Cliente removido com sucesso.");
        fetchClientes();
      } else {
        toast.error(data.error || "Não foi possível excluir o cliente pois ele possui projetos ativos.");
      }
    } catch (error) {
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setConfirmExclusaoAberta(false); 
      setIdParaExcluir(null); 
    }
  };

  const columns = useMemo(() => getColumns(
    isGerente,
    (cli) => { setClienteEditando(cli); setEditModalAberto(true); },
    (id) => { setIdParaExcluir(id); setConfirmExclusaoAberta(true);},
    (id, nome) => { setClienteParaProjetos({ id, nome }); setProjetoModalAberto(true); }
  ), [isGerente]);

  return (
    <div className="flex h-screen w-full">
      <SideBar />
      <div className="flex-1 p-6 overflow-auto">
        <Header />
        <main className="mt-4">
          <PageHeader title="Clientes" subtitle="Gerencie sua base de clientes.">
            {isGerente && <DialogClientes open={addModalAberto} onOpenChange={setAddModalAberto} aoSalvar={fetchClientes} />}
          </PageHeader>

          <DataTable columns={columns} data={data} />
        </main>
      </div>

      <AlertDialog open={confirmExclusaoAberta} onOpenChange={setConfirmExclusaoAberta}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você deseja excluir este cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIdParaExcluir(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(idParaExcluir || 0)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ModalCliente 
        open={editModalAberto} 
        onOpenChange={setEditModalAberto} 
        clienteInicial={clienteEditando} 
        aoSalvar={fetchClientes} 
        type="edit" 
      />
      
      <ModalProjetos 
        open={projetoModalAberto} 
        onOpenChange={setProjetoModalAberto} 
        cliente={clienteParaProjetos} 
      />
    </div>
  );
}
export default Clientes
