'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import { toast } from "sonner"
import { useNavigate, Link } from "react-router-dom"
import { ChevronLeft, Clock, FileText, Play, Pause, Square } from "lucide-react"

import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { usePermissions } from "@/hooks/usePermissions"

const API = "http://localhost:3001"

export default function LancamentoPage() {
  const navigate = useNavigate()
  const { user } = usePermissions()

  // Estados para os dados do banco
  const [projetos, setProjetos] = useState([])
  const [atividades, setAtividades] = useState([])

  // Estados para o Relógio
  const [segundos, setSegundos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const iniciarTimer = () => {
  if (ativo && !pausado) return;
  
  // Se for o primeiro início (segundos em 0), grava a hora de início real
  if (segundos === 0) {
    const agora = new Date();
    const h = agora.getHours().toString().padStart(2, '0');
    const m = agora.getMinutes().toString().padStart(2, '0');
    setFormData(prev => ({ ...prev, hora_inicio: `${h}:${m}` }));
  }

  setAtivo(true);
  setPausado(false);
  const id = setInterval(() => {
    setSegundos((prev) => prev + 1);
  }, 1000);
  setIntervalId(id);
};

const pausarTimer = () => {
  if (intervalId) clearInterval(intervalId);
  setPausado(true);
};

const encerrarTimer = () => {
  if (intervalId) clearInterval(intervalId);
  
  // Grava a hora de término real
  const agora = new Date();
  const h = agora.getHours().toString().padStart(2, '0');
  const m = agora.getMinutes().toString().padStart(2, '0');
  
  setAtivo(false);
  setPausado(false);
  setFormData(prev => ({ ...prev, hora_fim: `${h}:${m}` }));
  
  toast.success("Tempo finalizado! Clique em Confirmar Lançamento para salvar.");
};

const formatarTempo = (totalSegundos: number) => {
  const h = Math.floor(totalSegundos / 3600);
  const m = Math.floor((totalSegundos % 3600) / 60);
  const s = totalSegundos % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

  // Estados do Formulário
  const [formData, setFormData] = useState({
    projeto_id: "",
    atividade_id: "",
    cliente_nome: "", // Visual apenas
    cliente_id: "",   // Para o banco
    data: new Date().toISOString().split('T')[0],
    hora_inicio: "",
    hora_fim: "",
    descricao: ""
  })

  useEffect(() => {
  // 1. Só executa se o user existir
  if (!user || !user.colaborador_id) return;

  console.log("Buscando projetos para o colaborador ID:", user.colaborador_id);

  fetch(`${API}/colaboradores`)
    .then(res => res.json())
    .then(data => {
      // 2. Usar Number() para garantir que a comparação não falhe por tipo
      const eu = data.find((c: any) => Number(c.colaborador_id) === Number(user.colaborador_id));
      
      // console.log("Colaborador encontrado no banco:", eu);

      if (eu && eu.projeto_colaboradores) {
        // 3. Extrair os projetos e filtrar nulos
        const meusProjetos = eu.projeto_colaboradores
          .map((pc: any) => pc.projetos)
          .filter((p: any) => p !== null);
          
        setProjetos(meusProjetos);
        console.log("Meus projetos carregados:", meusProjetos);
      } else {
        console.warn("Colaborador encontrado, mas sem vínculos de projeto.");
        setProjetos([]);
      }
    })
    .catch((err) => {
      console.error(err);
      toast.error("Erro ao carregar projetos específicos");
    });
}, [user]); // Re-executa quando o objeto user (das permissões) carregar

  // Quando o projeto muda, preenche cliente e filtra atividades
  const handleProjetoChange = (id: string) => {
    const projeto = projetos.find(p => p.projeto_id.toString() === id)
    if (projeto) {
      setFormData(prev => ({ 
        ...prev, 
        projeto_id: id,
        cliente_id: projeto.cliente_id,
        cliente_nome: projeto.clientes?.nome_cliente ||  "Cliente não encontrado"
      }))
      
      // Filtra as atividades que pertencem a este projeto
      // Se sua API não tiver rota de filtro, usamos os dados que vieram no 'include' do projeto
      setAtividades(projeto.atividades || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projeto_id || !formData.atividade_id || !formData.hora_inicio || !formData.hora_fim) {
      return toast.warning("Preencha todos os campos obrigatórios")
    }
    if (formData.hora_inicio >= formData.hora_fim) {
        return toast.error("A hora de término deve ser após a hora de início");
    }

    try {
      const response = await fetch(`${API}/lancamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          usuario_id: user?.id
        })
      })

      if (response.ok) {
        toast.success("Horas registradas!")
        navigate("/TimeSheet")
      } else {
        const err = await response.json()
        toast.error(err.error || "Erro ao salvar")
      }
    } catch (error) {
      toast.error("Erro na conexão com o servidor")
    }
  }

  return (
    <div className="flex h-screen w-full">
      <SideBar />
      <div className="flex-1 p-6 overflow-auto">
        <Header />

        <main className="mt-4 max-w-4xl mx-auto">
          <Link
            to="/TimeSheet"
            className="flex items-center text-muted-foreground hover:text-blue-950 mb-6 w-fit"
          >
            <ChevronLeft size={20} />
            Voltar para planilha
          </Link>

          <Tabs defaultValue="manual">
            <TabsList className="grid grid-cols-2 rounded-full mb-8">
              <TabsTrigger value="manual">
                <FileText size={16} /> Formulário
              </TabsTrigger>
              <TabsTrigger value="relogio">
                <Clock size={16} /> Relógio
              </TabsTrigger>
            </TabsList>

            {/* ---------- FORMULÁRIO ---------- */}
            <TabsContent value="manual">
              <Card>
                <CardContent className="pt-6">
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Projeto</Label>
                        <Select onValueChange={handleProjetoChange}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {projetos.map(p => (
                              <SelectItem key={p.projeto_id} value={p.projeto_id.toString()}>
                                {p.nome_projeto}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Input value={formData.cliente_nome} readOnly className="bg-slate-100 opacity-70" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Atividade</Label>
                      <Select onValueChange={(v) => setFormData({...formData, atividade_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione a atividade" /></SelectTrigger>
                        <SelectContent>
                          {atividades.map(a => (
                            <SelectItem key={a.atividade_id} value={a.atividade_id.toString()}>
                              {a.nome_atividade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input type="time" onChange={e => setFormData({...formData, hora_inicio: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input type="time" onChange={e => setFormData({...formData, hora_fim: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição (Opcional)</Label>
                      <Textarea 
                        placeholder="Descreva brevemente o que foi feito..." 
                        onChange={e => setFormData({...formData, descricao: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-6 rounded-xl">
                      Confirmar Lançamento
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            {/* --------------Relógio------------------ */}
            <TabsContent value="relogio" className="mt-0">
  <Card className="border-none shadow-none bg-slate-50/50">
    <CardContent className="pt-6 space-y-8">

      {/* Área Central do Timer */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-8xl font-medium text-botao-dark">
          {formatarTempo(segundos)}
        </div>

        <div className="flex gap-3">
          {/* Botão Play / Pause */}
          {!ativo || pausado ? (
            <Button 
              onClick={iniciarTimer}
              disabled={!formData.projeto_id || !formData.atividade_id}
              className="px-8 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex gap-2 items-center"
            >
              <Play size={18} fill="currentColor" /> {pausado ? "Retomar" : "Iniciar"}
            </Button>
          ) : (
            <Button 
              onClick={pausarTimer}
              variant="outline"
              className="px-8 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-full flex gap-2 items-center"
            >
              <Pause size={18} fill="currentColor" /> Pausar
            </Button>
          )}

          {/* Botão Encerrar */}
          {ativo && (
            <Button 
              onClick={encerrarTimer}
              variant="destructive"
              className="px-8 rounded-full flex gap-2 items-center"
            >
              <Square size={16} fill="currentColor" /> Encerrar
            </Button>
          )}
        </div>
      </div>
      
      {/* Seletores Superiores (Obrigatórios para o Play) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border">
        <div className="space-y-1">
          <Label className="text-xs uppercase text-muted-foreground">Projeto</Label>
          <Select onValueChange={handleProjetoChange} disabled={ativo}>
            <SelectTrigger className="border-none bg-slate-50 focus:ring-0">
              <SelectValue placeholder="Selecione um Projeto" />
            </SelectTrigger>
            <SelectContent>
              {projetos.map(p => (
                <SelectItem key={p.projeto_id} value={p.projeto_id.toString()}>{p.nome_projeto}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
        </div>
        <div className="space-y-1">
          <Label className="text-xs uppercase text-muted-foreground">Cliente</Label>
          <div className="h-10 flex items-center px-3 bg-slate-100/50 rounded-md text-sm text-slate-500 font-medium">
            {formData.cliente_nome || "Aguardando projeto..."}
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase text-muted-foreground">Atividade</Label>
          <Select onValueChange={(v) => setFormData({...formData, atividade_id: v})} disabled={ativo}>
            <SelectTrigger className="border-none bg-slate-50 focus:ring-0">
              <SelectValue placeholder="Selecione uma Atividade" />
            </SelectTrigger>
            <SelectContent>
              {atividades.map(a => (
                <SelectItem key={a.atividade_id} value={a.atividade_id.toString()}>{a.nome_atividade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
            <div className="space-y-1">
          <Label className="text-xs uppercase text-muted-foreground">O que você está fazendo? (Opcional)</Label>
          <Textarea 
            placeholder="Descreva sua tarefa..." 
            className="resize-none border-none bg-white shadow-sm focus-visible:ring-blue-500"
            onChange={e => setFormData({...formData, descricao: e.target.value})}
          />
        </div>
        
      </div>

      

      {/* Descrição e Confirmação Final */}
      <div className="space-y-4">
        

        {!ativo && segundos > 0 && (
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-green-100"
          >
            Confirmar Lançamento de {formatarTempo(segundos)}
          </Button>
        )}
      </div>

    </CardContent>
  </Card>
</TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
