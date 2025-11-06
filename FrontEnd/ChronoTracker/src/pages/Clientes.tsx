import Header from "@/components/componentes/Header"
import SideBar from "@/components/componentes/SideBar"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input";
import { Search, Ellipsis, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PageHeader } from "@/components/componentes/TituloPagina";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { ModalCliente } from "@/components/clientes/ModalClientes";

function Clientes() {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<"add" | "edit" | null>(null)
  
  const openModal = (type: "add" | "edit") => {
    setTipo(type)
    setAberto(true)
  }

  const clientes = [
    {
      id: "01",
      empresa: "Comercial Alfa Ltda",
      nome: "Marcos Silva",
      cep: "01001-000",
      endereco: "Rua das flores, 120",
      cidade: "São Paulo",
      estado: "SP",
      cnpj: "12.345.678/0001-90",
      status: "Aprovado",
    },
    {
      id: "02",
      empresa: "Mercado Beta EIRELI",
      nome: "Ana Paula Rocha",
      cep: "30140-070",
      endereco: "Av. Afonso Pena, 850",
      cidade: "Belo Horizonte",
      estado: "MG",
      cnpj: "98.765.432/0001-55",
      status: "Aprovado",
    },
  ];

  return (
    <div className="flex h-screen">
      
                <SideBar/>
        {/* Conteúdo */}
        <main className="flex-1 p-6 overflow-auto">
            {/* Header com Searchbar */}
            <Header/>
            <PageHeader 
            title="Clientes"
            subtitle="Adicione, edite e visualize os clientes"/>
            
            <Card>
              <CardContent>
                <div className="relative mb-4">
                    <Input type="text" placeholder="Buscar" className="w-full rounded-2xl" />
                    <Search className="text-white absolute h-8 w-8 right-1 top-0.5 bg-botao-dark p-1 rounded-2xl" />
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
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientes.map((c) => (
                      <TableRow key={c.id} className="text-center odd:bg-sidebar even: bg-card">
                        <TableCell className="py-1">{c.id}</TableCell>
                        <TableCell>{c.empresa}</TableCell>
                        <TableCell>{c.nome}</TableCell>
                        <TableCell>{c.cep}</TableCell>
                        <TableCell>{c.endereco}</TableCell>
                        <TableCell>{c.cidade}</TableCell>
                        <TableCell>{c.estado}</TableCell>
                        <TableCell>{c.cnpj}</TableCell>
                        <TableCell className="bg-green-500 rounded-2xl text-white">{c.status}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="none" className="hover:cursor-pointer"><Ellipsis/></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-background border-2 rounded-md border-botao-config p-2 " side="top">
                              <DropdownMenuItem onClick={() => openModal("add")}>Adicionar Cliente</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openModal("edit")}>Editar Cliente</DropdownMenuItem>
                              <DropdownMenuItem>Excluir cliente</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          
                          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <ModalCliente open={aberto} onOpenChange={setAberto} type={tipo}/>
        </main>
         
      </div>

     
  )
}

export default Clientes
