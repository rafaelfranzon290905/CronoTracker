import { Link, Navigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Home, Users, FileText, DollarSign, Clock, Rocket, Activity } from "lucide-react"
import CronosAzul from "../imagens/ChronosAzul.png"
import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { useState } from "react"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { Badge } from "lucide-react";
import { API_BASE_URL } from  "@/apiConfig";
import { type Atividades } from "@/lib/activities";
import { Loader2 } from "lucide-react"
import { Value } from "@radix-ui/react-select"

interface CurrentUser {
    id: number;
    colaborador_id: number;
    username: string; // O nome que você quer exibir
    cargo: string;
    nomeCompleto: string;
}

function Dashboard() {
  const [userDisplayName, setUserDisplayName] = useState<string>('');
  const [userData, setUserData] = useState<CurrentUser | null>(null);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [projetosCount, setProjetosCount] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const [horasHoje, setHorasHoje] = useState(0);
  const [porcentagem, setPorcentagem] = useState(0);
  const [dadosGrafico, setDadosGrafico] = useState<{dia: string, horas: number}[]>([]);
  const [produtividade, setProdutividade] = useState(0);

  useEffect(() => {
        // 1. Tenta buscar a informação salva no localStorage
        const userJson = localStorage.getItem('currentUser');
        
        if (!userJson) {
          navigate('/login');
          return;
        }
            try {
                // 2. Faz o parse do JSON
                const user: CurrentUser = JSON.parse(userJson);
                setUserData(user)
                // 3. Atualiza o estado com o nome de usuário
                // Usamos o 'username' que foi salvo no localStorage
                const nameToDisplay = user.nomeCompleto || user.username;
                setUserDisplayName(nameToDisplay);

                // Função para buscar dados reais do Backend
                  const fetchDashboardData = async () => {
                      try {
                          // 1. Buscar Projetos do Cliente/Colaborador
                          // Usando sua rota: GET /projetos
                          const resProj = await fetch(`${API_BASE_URL}/projetos`);
                          const dataProj = await resProj.json();

                          const targetId = user.colaborador_id;
                          
                          // Filtra projetos onde o colaborador logado está inserido
                          const meusProjetos = dataProj.filter((p: any) => 
                              p.projeto_colaboradores.some((pc: any) => pc.colaborador_id === targetId)
                          );
                          setProjetosCount(meusProjetos.length);

                          // 2. Buscar Atividades
                          // Usando sua rota: GET /atividades
                          const resAtiv = await fetch(`${API_BASE_URL}/atividades`);
                          const dataAtiv = await resAtiv.json();
                          
                          // Filtra apenas atividades atribuídas a este colaborador (ID que vem do Login)
                          const minhasAtividades = dataAtiv.filter((a: any) => a.colaborador_id === targetId);
                          setAtividades(minhasAtividades.sort((a: any, b: any) => b.atividade_id - a.atividade_id).slice(0, 5));
                            
                          // Busca Estatísticas (Horas Hoje e Gráfico)
                          const url = `${API_BASE_URL}/dashboard/stats/${user.id}`;
                          console.log("Chamando URL:", url); // <--- DEBUG

                          const resStats = await fetch(`${API_BASE_URL}/dashboard/stats/${user.id}`);
                          
                          if (!resStats.ok) {
                              console.warn(`Servidor respondeu com erro ${resStats.status}. A rota pode não estar publicada.`);
                              setHorasHoje(0);
                              setDadosGrafico([]);
                              return;
                          }

                          const stats = await resStats.json();
                          
                          setHorasHoje(stats.totalHoje);
                          setPorcentagem(stats.percentual);
                          setProdutividade(stats.produtividade);
                          setDadosGrafico(stats.grafico || []);
                          
                          if (stats.grafico && stats.grafico.length > 0) {
                              setDadosGrafico(stats.grafico);
                          } else {
                              // Caso não tenha nada, podemos setar um array vazio ou mockado
                              setDadosGrafico([]); 
                          }

                      } catch (err) {
                          console.error("Erro ao carregar dados do dashboard", err);
                      } finally {
                          setIsLoading(false);
                      }
                  };

                  fetchDashboardData();
                
            } catch (error) {
                console.error("Erro ao carregar dados do usuário:", error);
                navigate('/login');
                // Se der erro ao fazer o parse, podemos redirecionar para o login
                // router.push('/login');
            }
      }, [navigate]);
     
    const formatarHoras = (decimal: number) => {
      const horas = Math.floor(decimal);
      const minutos = Math.round((decimal - horas) * 60);
      
      if (horas === 0 && minutos === 0) return "0h";
      if (horas === 0) return `${minutos}min`;
      if (minutos === 0) return `${horas}h`;
      
      return `${horas}h ${minutos}min`;
    };

    const saudacao = (userDisplayName.charAt(0).toUpperCase() + userDisplayName.slice(1)) || 'usuário';
    if (isLoading) {
        // Exibe um loading enquanto busca os dados
        return (

          <div className="p-8 flex justify-center w-full mt-20">
            <div>
              <h1 className="text-xl font-bold text-center">Carregando Dashboard...</h1>
              <h1 className="text-xl font-bold text-center">Seja bem vindo(a), {saudacao}</h1>
              <h1 className="text-xl font-bold text-center">Cargo: {userData?.cargo}</h1>
              <Loader2 className="h-10 w-2xl animate-spin text-botao-dark flex justify-center mt-10"></Loader2>
            </div>
          </div>
        )
    }
    

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
              <p className="text-2xl font-bold">{formatarHoras(horasHoje)}</p>
              <p className={porcentagem >= 0 ? "text-green-600 text-sm" : "text-gray-500 text-sm"}>
                {porcentagem >= 0 ? `+${porcentagem}%` : `${porcentagem}%`} vs ontem
              </p>
            </CardContent>
          </Card>
          <Card aria-label="Card de número de projetos Ativos">
            <CardHeader>
              <CardTitle>Projetos Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{projetosCount}</p>
            </CardContent>
          </Card>
          <Card aria-label="Card de porcentagem de produtividade">
            <CardHeader>
              <CardTitle>Produtividade</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{produtividade}%</p>
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
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [formatarHoras(value), "Duraçãoo"]}/>
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
              {atividades.length > 0 ? (
                atividades.map((ativ) => (
                  <div key={ativ.atividade_id} className="border-b pb-1">
                    <div>
                      <p className="font-semibold">{ativ.nome_atividade} - {ativ.projetos?.nome_projeto}</p>
                      {/* <p className="text-xs text-slate-400">{ativ.projetos?.nome_projeto}</p> */}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Nenhuma atividade atribuída.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
