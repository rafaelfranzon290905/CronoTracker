import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Home, Users, FileText, DollarSign, Clock, Rocket, Activity } from "lucide-react"
import CronosAzul from "../imagens/ChronosAzul.png"
import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"

const data = [
  { dia: "Seg", horas: 8 },
  { dia: "Ter", horas: 7 },
  { dia: "Qua", horas: 9 },
  { dia: "Qui", horas: 6 },
  { dia: "Sex", horas: 5 },
  { dia: "Sáb", horas: 7 },
  { dia: "Dom", horas: 0 },
]

function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
<<<<<<< HEAD
      {/* Sidebar */}
      <aside className="w-64 bg-blue-50 shadow-md flex flex-col">
        <div className="p-6 flex items-center space-x-2 font-bold text-lg">
          <img src={CronosAzul} className="h-12 w-12" />
          <span>CHRONO TRACKER</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 text-sm">
          <Button variant="ghost" className="w-full justify-start bg-blue-900 text-white"><Home className="mr-2 h-4 w-4" /> Dashboard</Button>
          <Button variant="ghost" className="w-full justify-start"><Clock className="mr-2 h-4 w-4" /> TimeSheet</Button>
          <Link to="/collaborators"><Button variant="ghost" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> Colaboradores</Button></Link>
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
=======
      <SideBar/>
>>>>>>> origin/develop

      {/* Conteúdo */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Header com Searchbar */}
        <Header/>
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Bem-vinda, Rafaela!</h1>
            <p className="text-gray-500">Aqui você encontra tudo o que precisa saber sobre suas tarefas e as do seu time!</p>
          </div>
          <Button className="bg-blue-600 text-white">+ Criar</Button>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Horas Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">6.5h</p>
              <p className="text-green-600 text-sm">+12% vs ontem</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Projetos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">8</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Produtividade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">89%</p>
              <p className="text-green-600 text-sm">Excelente!</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">R$ 24.5k</p>
              <p className="text-green-600 text-sm">+9% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico + Atividades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Horas Trabalhadas - Última Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="horas" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Implementação de novo módulo - Cliente A</p>
              <p>Design e UX - Cliente A</p>
              <p>Correção de Bugs - Cliente B</p>
              <p>Reunião com cliente - Cliente B</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
