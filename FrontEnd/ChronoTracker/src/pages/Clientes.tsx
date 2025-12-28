import { useState, useEffect } from "react";

import Header from "@/components/componentes/Header"
import SideBar from "@/components/componentes/SideBar"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Search, Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/componentes/TituloPagina";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { ModalCliente } from "@/components/clientes/ModalClientes";
import  DialogClientes  from "@/components/componentes/DialogClientes";
import { usePermissions } from "@/hooks/usePermissions";

interface Cliente {
    cliente_id: number;
    cnpj: string;
    nome_cliente: string;
    nome_contato: string;
    cep: string;
    endereco: string;
    cidade: string;
    estado: string;
    status: boolean; // Corrigido para boolean, como está no banco
}

// Base da API
const API_BASE_URL = 'http://localhost:3001';

function Clientes() {
  const [addModalAberto, setAddModalAberto] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<"add" | "edit" | null>(null);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const openModal = (type: "add" | "edit", cliente?: Cliente ) => {
    setTipo(type);
    setClienteEditando(type === 'edit' ? cliente || null : null);
    setAberto(true);
  }

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {isGerente} = usePermissions()

  // Função para buscar os dados da API
  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/clientes`);

      if (!response.ok){
        throw new Error(`Erro HTTP: ${response.status}`)
      }
      const data = await response.json();
      setClientes(data);

    } catch (err) {
      console.log("Erro ao buscar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (status: boolean) => {
        // Define classe e texto baseado no valor booleano
        const className = status ? "bg-green-500" : "bg-red-500";
        const text = status ? "Ativo" : "Inativo";
        
        return <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full text-white ${className}`}>{text}</span>;
    };

  useEffect(() => {
    fetchClientes();
  }, [])

  const deleteCliente = async (cliente_id: number) => {
    try {
      // Confirmação
      if (!window.confirm(`Tem certeza que deseja excluir o cliente com ID ${cliente_id}?`)) {
        return; //Cancela a exclusão se o usuário não confirmar
      }

      // Chamada DELETE
      const response = await fetch(`${API_BASE_URL}/clientes/${cliente_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Mensagem de erro do backend
        const errorData = await response.json().catch(() => ({error: 'Erro desconhecido'}));
        throw new Error(errorData.error || `Erro HTTP ${response.status}`);
      }

      // Atualiza a lista de clientes
      alert(`Cliente ID ${cliente_id} excluido com sucesso!`);
      fetchClientes(); //Rebusca a lista completa
    } catch (err) {
      console.error("Erro ao deletar cliente:", err);
      alert(`Falha ao excluir cliente: ${err instanceof Error ? err.message : 'Erro desconhecido' }`);
    }
  };

  return (
    <div className="flex h-screen">
      
                <SideBar/>
        {/* Conteúdo */}
        <main className="flex-1 p-6 overflow-auto">
            {/* Header com Searchbar */}
            <Header/>
            <PageHeader 
            title="Clientes"
            subtitle="Adicione, edite e visualize os clientes">
              {isGerente && <DialogClientes 
                              open={addModalAberto}
                              onOpenChange={setAddModalAberto}
                              aoSalvar={fetchClientes}/>}
            </PageHeader>
            
            <Card>
              <CardContent>
                <div className="relative mb-4">
                    <Input type="text" placeholder="Buscar" className="w-full rounded-2xl" />
                    <Search className="text-white absolute h-8 w-8 right-1 top-0.5 bg-botao-dark p-1 rounded-2xl" />
                </div>
                <div className="mb-4">
                    
                </div>
                
                <Table className="w-full">
                  <TableHeader className="border-b-2">
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Nome do contato</TableHead>
                      <TableHead>CEP</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Status</TableHead>
                      {isGerente && <TableHead>Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((c) => (
                      <TableRow key={c.cliente_id} className="text-center odd:bg-sidebar even:bg-card">
                        <TableCell className="py-1">{c.cliente_id}</TableCell>
                        <TableCell>{c.nome_cliente}</TableCell>
                        <TableCell>{c.nome_contato}</TableCell>
                        <TableCell>{c.cep}</TableCell>
                        <TableCell>{c.endereco}</TableCell>
                        <TableCell>{c.cidade}</TableCell>
                        <TableCell>{c.estado}</TableCell>
                        <TableCell>{c.cnpj}</TableCell>
                        <TableCell>{getStatusDisplay(c.status)}</TableCell>
                        {isGerente &&
                          <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="hover:cursor-pointer"><Ellipsis/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-background border-2 rounded-md border-botao-config p-2 " side="top">
                              <DropdownMenuItem onClick={() => openModal("edit", c)}>Editar Cliente</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => deleteCliente(c.cliente_id)}>Excluir cliente</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          </TableCell>
                        }
                        
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <ModalCliente open={aberto} onOpenChange={setAberto} type={tipo} clienteInicial={clienteEditando} aoSalvar={fetchClientes}/>
        </main>
         
      </div>

     
  )
}

export default Clientes
