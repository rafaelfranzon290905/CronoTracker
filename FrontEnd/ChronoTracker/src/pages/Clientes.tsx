import { useState, useEffect, useMemo } from "react";
import Header from "@/components/componentes/Header";
import SideBar from "@/components/componentes/SideBar";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { DataTable } from "@/components/clientes/data-table-clients";
import { getColumns } from "@/components/clientes/collumnsClients";
import { ModalCliente } from "@/components/clientes/ModalClientes"; // Usaremos apenas este modal
import { ModalProjetos } from "@/components/clientes/ModalVerProjetos";
// REMOVIDO: import DialogClientes from "@/components/componentes/DialogClientes"; <--- Não usamos mais esse
import { usePermissions } from "@/hooks/usePermissions";
import { type Cliente } from "@/lib/clients";
import { API_BASE_URL } from "@/apiConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Importar Button
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
import { Loader2, PlusCircle } from "lucide-react"; // Importar PlusCircle para o botão

function Clientes() {
  const [data, setData] = useState<Cliente[]>([]);
  
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);


  const [projetoModalAberto, setProjetoModalAberto] = useState(false);
  const [clienteParaProjetos, setClienteParaProjetos] = useState<{ id: number; nome: string } | null>(null);
  const [confirmExclusaoAberta, setConfirmExclusaoAberta] = useState(false);
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { isGerente } = usePermissions();

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`);
      const data = await response.json();
      setData(data);
    } catch (err) {
      toast.error("Erro ao carregar clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleNovoCliente = () => {
    setClienteSelecionado(null); 
    setModalAberto(true);
  };

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

  const clientesFiltrados = useMemo(() => {
    if (isGerente) return data; 
    return data.filter(cliente => cliente.status === true); 
  }, [data, isGerente]);

  const columns = useMemo(() => getColumns(
    isGerente,
    // --- ALTERAÇÃO: Ao editar, passamos o cliente para o state unificado ---
    (cli) => { 
        setClienteSelecionado(cli); 
        setModalAberto(true); 
    },
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
            {/* --- ALTERAÇÃO: Botão direto em vez do DialogClientes antigo --- */}
            {isGerente && (
                <Button onClick={handleNovoCliente} className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Novo Cliente
                </Button>
            )}
          </PageHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-2">
              <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
              <p className="text-sm text-muted-foreground animate-pulse">
                Carregando clientes...
              </p>
            </div>
          ) : (
            <DataTable columns={columns} data={clientesFiltrados} />
          )}
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
        open={modalAberto} 
        onOpenChange={setModalAberto} 
        clienteInicial={clienteSelecionado} // Se for null, o modal sabe que é "Novo"
        aoSalvar={fetchClientes} 
      />
      
      <ModalProjetos 
        open={projetoModalAberto} 
        onOpenChange={setProjetoModalAberto} 
        cliente={clienteParaProjetos} 
      />
    </div>
  );
}
export default Clientes;