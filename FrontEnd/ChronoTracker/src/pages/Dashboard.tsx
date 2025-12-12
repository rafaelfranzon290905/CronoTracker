import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Home, Users, FileText, DollarSign, Clock, Rocket, Activity } from "lucide-react"
import CronosAzul from "../imagens/ChronosAzul.png"
import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { useState } from "react"
import { useEffect } from "react"

const data = [
  { dia: "Seg", horas: 8 },
  { dia: "Ter", horas: 7 },
  { dia: "Qua", horas: 9 },
  { dia: "Qui", horas: 6 },
  { dia: "Sex", horas: 5 },
  { dia: "Sáb", horas: 7 },
  { dia: "Dom", horas: 0 },
]

interface CurrentUser {
    id: number;
    username: string; // O nome que você quer exibir
    cargo: string;
}

function Dashboard() {
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
        // 1. Tenta buscar a informação salva no localStorage
        const userJson = localStorage.getItem('currentUser');
        
        if (userJson) {
            try {
                // 2. Faz o parse do JSON
                const user: CurrentUser = JSON.parse(userJson);
                
                // 3. Atualiza o estado com o nome de usuário
                // Usamos o 'username' que foi salvo no localStorage
                setUserName(user.username); 
                
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
                // Se der erro ao fazer o parse, podemos redirecionar para o login
                // router.push('/login');
            }
        } else {
            // Se não houver dados, o usuário não está logado
            // router.push('/login');
            console.log("Usuário não logado. Redirecionar para /login.");
        }
        
        setIsLoading(false);
    }, []); // O array vazio [] garante que isso só roda uma vez (ao montar o componente)

    if (isLoading) {
        // Exibe um loading enquanto busca os dados
        return <div className="p-8">Carregando dashboard...</div>;
    }
    
    // Define a primeira letra maiúscula para a saudação
    const saudacao = (userName.charAt(0).toUpperCase() + userName.slice(1)) || 'usuário';

  return (
    <div className="flex h-screen">
      
      <SideBar/>


      {/* Conteúdo */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Header com Searchbar */}
        <Header/>
        <header className="flex items-center justify-between mb-6 mt-2">
          <div>
            <h1 className="text-xl font-bold">Bem-vindo(a), {saudacao}!</h1>
            <p className="text-gray-500">Aqui você encontra tudo o que precisa saber sobre suas tarefas e as do seu time!</p>
          </div>
          <Button className="bg-botao-light text-white">+ Criar</Button>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card aria-label="Card de horas de trabalho hoje">
            <CardHeader>
              <CardTitle>Horas Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">6.5h</p>
              <p className="text-green-600 text-sm">+12% vs ontem</p>
            </CardContent>
          </Card>
          <Card aria-label="Card de número de projetos Ativos">
            <CardHeader>
              <CardTitle>Projetos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">8</p>
            </CardContent>
          </Card>
          <Card aria-label="Card de porcentagem de produtividade">
            <CardHeader>
              <CardTitle>Produtividade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">89%</p>
              <p className="text-green-600 text-sm">Excelente!</p>
            </CardContent>
          </Card>
          <Card aria-label="Card de receita mensal ">
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
          <Card aria-label="Gráfico de horas trabalhadas na última semana">
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

          <Card aria-label="Card de Atividades recentes">
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
