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
import { Loader2 } from "lucide-react"
import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { usePermissions } from "@/hooks/usePermissions"
import { API_BASE_URL } from "@/apiConfig"
import { type Projeto } from "@/lib/projects"
import type { Atividades } from "@/lib/activities"

// const API = "http://localhost:3001"

export default function LancamentoPage() {
  const navigate = useNavigate()
  const { user } = usePermissions()

  // Estados para os dados do banco
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [atividades, setAtividades] = useState<Atividades[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados para o Relógio
  const [segundos, setSegundos] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [intervalId, setIntervalId] = useState<any>(null);

  const iniciarTimer = () => {
    if (ativo && !pausado) return;

    // Se for o primeiro início (segundos em 0), grava a hora de início real
    if (segundos === 0) {
      const agora = new Date();
      const h = agora.getHours().toString().padStart(2, '0');
      const m = agora.getMinutes().toString().padStart(2, '0');
      setFormData(prev => ({ ...prev, hora_inicio: `${h}:${m}`, tipo_lancamento: "relogio" }));
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
    data: new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date()),
    hora_inicio: "",
    hora_fim: "",
    descricao: "",
    tipo_lancamento: "manual"
  })

  useEffect(() => {
    // 1. Só executa se o user existir
    if (!user || !user.colaborador_id) return;

    setIsLoading(true);
    console.log("Buscando projetos para o colaborador ID:", user.colaborador_id);

    fetch(`${API_BASE_URL}/colaboradores`)
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

          // MEMÓRIA: Recuperar projeto e atividade do localStorage após carregar a lista de projetos
          const lastProj = localStorage.getItem('last_projeto_id');
          const lastAtiv = localStorage.getItem('last_atividade_id');

          if (lastProj) {
            const projetoEncontrado = meusProjetos.find((p: any) => p.projeto_id.toString() === lastProj);
            if (projetoEncontrado) {
              setFormData(prev => ({
                ...prev,
                projeto_id: lastProj,
                cliente_id: String(projetoEncontrado.cliente_id),
                cliente_nome: projetoEncontrado.clientes?.nome_cliente || "Cliente não encontrado",
                atividade_id: lastAtiv || ""
              }));
              setAtividades(projetoEncontrado.atividades as any || []);
            }
          }

        } else {
          console.warn("Colaborador encontrado, mas sem vínculos de projeto.");
          setProjetos([]);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Erro ao carregar projetos específicos");
      })
      .finally(() => {
        setIsLoading(false)
      });

  }, [user]); // Re-executa quando o objeto user (das permissões) carregar

  // Quando o projeto muda, preenche cliente e filtra atividades
  const handleProjetoChange = (id: string) => {
    const projeto = projetos.find(p => p.projeto_id.toString() === id)
    if (projeto) {
      setFormData(prev => ({
        ...prev,
        projeto_id: id,
        cliente_id: String(projeto.cliente_id),
        cliente_nome: projeto.clientes?.nome_cliente || "Cliente não encontrado",
        atividade_id: "" // Limpa a atividade ao trocar o projeto
      }))

      // Filtra as atividades que pertencem a este projeto
      setAtividades(projeto.atividades as any || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const idDoUsuario = user?.usuario_id || (user as any)?.id;
    if (!user || !idDoUsuario) {
      return toast.error("Usuário não autenticado ou sessão expirada.");
    }

    if (!formData.projeto_id || !formData.atividade_id || !formData.hora_inicio || !formData.hora_fim) {
      return toast.warning("Preencha todos os campos obrigatórios")
    }
    if (formData.hora_inicio >= formData.hora_fim) {
      return toast.error("A hora de término deve ser após a hora de início");
    }

    // Nova validação de data futura
    const dataSelecionada = new Date(formData.data + "T00:00:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataSelecionada > hoje) {
      return toast.error("A data de lançamento não pode ser uma data futura.");
    }

    try {
      // Criamos um objeto para envio excluindo o campo que causa erro no Prisma
      const { tipo_lancamento, ...dadosParaEnvio } = formData;

      const response = await fetch(`${API_BASE_URL}/lancamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dadosParaEnvio,
          usuario_id: idDoUsuario,
          projeto_id: Number(formData.projeto_id),
          atividade_id: Number(formData.atividade_id),
          cliente_id: formData.cliente_id
        })
      })

      if (response.ok) {
        // MEMÓRIA: Salvar no localStorage antes de navegar
        localStorage.setItem('last_projeto_id', formData.projeto_id);
        localStorage.setItem('last_atividade_id', formData.atividade_id);

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

          <Tabs defaultValue="manual" onValueChange={(value) => {
            if (value === "manual") {
              setFormData(prev => ({ ...prev, tipo_lancamento: "manual" }));
            } else {
              if (segundos > 0) {
                setFormData(prev => ({ ...prev, tipo_lancamento: "relogio" }));
              }
            }
          }}>
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
                        <Select value={formData.projeto_id} onValueChange={handleProjetoChange}>
                          <SelectTrigger>
                            {isLoading ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Carregando projetos...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Selecione" />
                            )}
                          </SelectTrigger>
                          <SelectContent className="max-h-60 overflow-y-auto">
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
                      <Select value={formData.atividade_id} onValueChange={(v) => setFormData({ ...formData, atividade_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Selecione a atividade" /></SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
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
                        <Input type="date" value={formData.data} max={new Intl.DateTimeFormat('fr-CA').format(new Date())} onChange={e => setFormData({ ...formData, data: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input type="time" value={formData.hora_inicio} onChange={e => setFormData({ ...formData, hora_inicio: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input type="time" value={formData.hora_fim} onChange={e => setFormData({ ...formData, hora_fim: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição (Opcional)</Label>
                      <Textarea
                        placeholder="Descreva brevemente o que foi feito..."
                        value={formData.descricao}
                        onChange={e => setFormData({ ...formData, descricao: e.target.value })}
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
                      <Select value={formData.projeto_id} onValueChange={handleProjetoChange} disabled={ativo}>
                        <SelectTrigger className="border-none bg-slate-50 focus:ring-0">
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              <span className="text-muted-foreground">Buscando...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Selecione um Projeto" />
                          )}

                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
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
                      <Select value={formData.atividade_id} onValueChange={(v) => setFormData({ ...formData, atividade_id: v })} disabled={ativo}>
                        <SelectTrigger className="border-none bg-slate-50 focus:ring-0">
                          <SelectValue placeholder="Selecione uma Atividade" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
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
                        value={formData.descricao}
                        className="resize-none border-none bg-white shadow-sm focus-visible:ring-blue-500"
                        onChange={e => setFormData({ ...formData, descricao: e.target.value })}
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