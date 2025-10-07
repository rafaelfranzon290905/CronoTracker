import React from "react";
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Home, Users, FileText, DollarSign, Clock, Rocket, Activity } from "lucide-react"
import CronosAzul from "../imagens/ChronosAzul.png"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/Table";
import { columns } from "../components/table/columns";



function Collaborators() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-50 shadow-md flex flex-col">
        <div className="p-6 flex items-center space-x-2 font-bold text-lg">
          <img src={CronosAzul} className="h-12 w-12" />
          <span>CHRONO TRACKER</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 text-sm">
          <Button variant="ghost" className="w-full justify-start"><Home className="mr-2 h-4 w-4" /> Dashboard</Button>
          <Button variant="ghost" className="w-full justify-start"><Clock className="mr-2 h-4 w-4" /> TimeSheet</Button>
          <Link to="/collaborators"><Button variant="ghost" className="w-full justify-start bg-blue-900 text-white"><Users className="mr-2 h-4 w-4" /> Colaboradores</Button></Link>
          <Link to="/clientes"><Button variant="ghost" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Clientes</Button></Link>
          <Link to="/projetos"><Button variant="ghost" className="w-full justify-start"><Rocket className="mr-2 h-4 w-4" /> Projetos</Button></Link>
          <Button variant="ghost" className="w-full justify-start"><Activity className="mr-2 h-4 w-4" /> Atividades</Button>
          <Button variant="ghost" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Relatórios</Button>
          <Button variant="ghost" className="w-full justify-start"><DollarSign className="mr-2 h-4 w-4" /> Despesas</Button>
        </nav>
        <div className="p-4">
          <Button variant="destructive" className="w-full">Log Out</Button>
        </div>
      </aside>

      {/* Conteúdo */}
      <main className="flex-1 p-6 overflow-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Bem-vinda, Rafaela!</h1>
            <p className="text-gray-500">Aqui você encontra tudo o que precisa saber sobre suas tarefas e as do seu time!</p>
          </div>
          <Button className="bg-blue-600 text-white">+ Criar</Button>
        </header>
        <section>
            <div className="p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                            <TableHead key={col.accessor}>{col.header}</TableHead>
                            ))}
                        </TableRow>
                        </TableHeader>
                    <TableBody>
                        {paymentsData.map((payment) => (
                            <TableRow key={payment.id}>
                            {columns.map((col) => (
                                <TableCell key={col.accessor}>{payment[col.accessor]}</TableCell>
                            ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </section>
      </main>
    </div>
  )
}

export default Collaborators
