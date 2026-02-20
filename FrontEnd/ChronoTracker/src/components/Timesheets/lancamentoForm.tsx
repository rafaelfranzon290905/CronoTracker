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
import { Link } from "react-router-dom"
import { MoreHorizontal, Edit, Trash2, Clock, FileText, Play, Pause, Square, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import SideBar from "@/components/componentes/SideBar"
import Header from "@/components/componentes/Header"
import { usePermissions } from "@/hooks/usePermissions"
import { API_BASE_URL } from "@/apiConfig"
import { type Projeto } from "@/lib/projects"
import type { Atividades } from "@/lib/activities"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditTimeEntryModal } from "@/components/Timesheets/EditTimeEntryModal" 
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";


export default function LancamentoPage() {
  // const navigate = useNavigate()
  const { user } = usePermissions()
  const [recentes, setRecentes] = useState<any[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<any>(null);
  const [isDelAlertOpen, setIsDelAlertOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

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
    cliente_nome: "", 
    cliente_id: "",   
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
    if (!user || !user.colaborador_id) return;

    setIsLoading(true);
    // console.log("Buscando projetos para o colaborador ID:", user.colaborador_id);

    fetch(`${API_BASE_URL}/colaboradores`)
      .then(res => res.json())
      .then(data => {
        const eu = data.find((c: any) => Number(c.colaborador_id) === Number(user.colaborador_id));

        // console.log("Colaborador encontrado no banco:", eu);

        if (eu && eu.projeto_colaboradores) {
          const meusProjetos = eu.projeto_colaboradores
            .map((pc: any) => pc.projetos)
            .filter((p: any) => p !== null);

          setProjetos(meusProjetos);
          console.log("Meus projetos carregados:", meusProjetos);

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

  }, [user]); 

  const handleProjetoChange = (id: string) => {
    const projeto = projetos.find(p => p.projeto_id.toString() === id)
    if (projeto) {
      setFormData(prev => ({
        ...prev,
        projeto_id: id,
        cliente_id: String(projeto.cliente_id),
        cliente_nome: projeto.clientes?.nome_cliente || "Cliente não encontrado",
        atividade_id: "" 
      }))

      setAtividades(projeto.atividades as any || [])
    }
  }

  
  const fetchRecentes = async () => {
    const idParaBusca = user?.usuario_id || (user as any)?.id;
    if (!idParaBusca) return;
    try {
      const response = await fetch(`${API_BASE_URL}/lancamentos?usuario_id=${idParaBusca}`);
      if (response.ok) {
        const result = await response.json();
        setRecentes(result.slice(0, 10));
      }
    } catch (error) {
      console.error("Erro ao buscar recentes", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRecentes();
    }
  }, [user]);

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

    const dataSelecionada = new Date(formData.data + "T00:00:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataSelecionada > hoje) {
      return toast.error("A data de lançamento não pode ser uma data futura.");
    }

    try {
      const { tipo_lancamento, ...dadosParaEnvio } = formData;

      const response = await fetch(`${API_BASE_URL}/lancamentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...dadosParaEnvio, 
          usuario_id: user?.usuario_id || idDoUsuario, 
          projeto_id: Number(formData.projeto_id),
          atividade_id: Number(formData.atividade_id),
          cliente_id: Number(formData.cliente_id), 
          data: formData.data,
          hora_inicio: formData.hora_inicio,
          hora_fim: formData.hora_fim,
          descricao: formData.descricao,
        })
      })

      if (response.ok) {
        localStorage.setItem('last_projeto_id', formData.projeto_id);
        localStorage.setItem('last_atividade_id', formData.atividade_id);

        toast.success("Horas registradas!")
        if (typeof fetchRecentes === 'function') {
          await fetchRecentes(); 
        }
        // navigate("/TimeSheet")
      } else {
        const err = await response.json()
        toast.error(err.error || "Erro ao salvar")
      }
    } catch (error) {
      toast.error("Erro na conexão com o servidor")
    }
  }

const handleDelete = (id: number) => {
  setIdToDelete(id);   
  setIsDelAlertOpen(true); 
};

const handleEdit = (item: any) => {
  setSelectedLancamento(item);
  setIsEditModalOpen(true);
};

const confirmDeletion = async () => {
    if (!idToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/lancamentos/${idToDelete}`, { method: 'DELETE' });
      if (response.ok) {
        toast.success("Lançamento excluído com sucesso");
        fetchRecentes();
      } else {
        toast.error("Erro ao excluir.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
    } finally {
      setIsDelAlertOpen(false);
      setIdToDelete(null);
    }
  };

  return (
    <div className="flex h-screen w-full">
      <SideBar />
      <div className="flex-1 p-6 overflow-auto">
        <Header />

        <main className="mt-4 mx-auto">
          <Link
            to="/TimeSheet"
            className="flex items-center text-muted-foreground hover:text-blue-950 mb-6 w-fit"
          >
            <ChevronLeft size={20} />
            Voltar para planilha
          </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
          <div className="lg:col-span-1">
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
                <Card>
                  <CardContent className="pt-6 space-y-8">

                    {/* Área Central do Timer */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-8xl font-medium text-botao-dark">
                        {formatarTempo(segundos)}
                      </div>

                      <div className="flex gap-3">
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
                        <Label>Projeto</Label>
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
                        <Label>Cliente</Label>
                        <div className="h-10 flex items-center px-3 bg-slate-100/50 rounded-md text-sm text-slate-500 font-medium">
                          {formData.cliente_nome || "Aguardando projeto..."}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label>Atividade</Label>
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
                      <div className="space-y-1 md:col-span-3 w-full">
                        <Label>Descrição (Opcional)</Label>
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
          </div>

          {/* listagem de horas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="text-blue-700" size={20} /> 
              Últimos Lançamentos
            </h3>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentes.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">Nenhum lançamento hoje.</p>
                  ) : (
                    recentes.map((item) => {
                      const dataBruta = item.data || item.data_lancamento;

                      const dataParaExibir = dataBruta 
                        ? (typeof dataBruta === 'string' ? dataBruta : dataBruta.toISOString()).split('T')[0].split('-').reverse().join('/')
                        : "--/--/--";

                      const formatarHora = (valor: any) => {
                        if (!valor) return "--:--";
                        const d = new Date(valor);
                        return isNaN(d.getTime()) ? "--:--" : d.getUTCHours().toString().padStart(2, "0") + ":" + d.getUTCMinutes().toString().padStart(2, "0");
                      };

                      return (
                        <div key={item.lancamento_id} className="p-4 hover:bg-slate-50 transition-colors group">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm truncate block">
                                {item.projetos?.nome_projeto || "Sem Projeto"}
                              </span>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.atividades?.nome_atividade || "Sem Atividade"}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[12px] bg-blue-900 text-blue-50">
                                {item.duracao_total ? `${item.duracao_total.toFixed(1)}h` : "--h"}
                              </Badge>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal size={14} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(item)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 focus:bg-red-50 focus:text-red-700"
                                    onClick={() => handleDelete(item.lancamento_id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[14px] text-blue-600">
                            <span className="font-semibold text-slate-500">
                              {dataParaExibir}
                            </span>
                            <div className="flex items-center gap-1">
                              <Clock size={10} />
                              {formatarHora(item.hora_inicio)} - {formatarHora(item.hora_fim)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
            <Link to="/TimeSheet" className="text-xs text-blue-700 hover:underline block text-center">
              Ver todos os lançamentos
            </Link>
          </div>

          </div>

        </main>
      </div>
      <EditTimeEntryModal 
        open={isEditModalOpen} 
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setSelectedLancamento(null);
        }} 
        entry={selectedLancamento}
        onSave={async (id, data) => {
          try {
            const response = await fetch(`${API_BASE_URL}/lancamentos/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });

            if (response.ok) {
              toast.success("Lançamento atualizado com sucesso!");
              fetchRecentes(); 
              setIsEditModalOpen(false);
            } else {
              const error = await response.json();
              toast.error(error.error || "Erro ao atualizar");
            }
          } catch (error) {
            toast.error("Erro na conexão");
          }
        }}
      />

      <AlertDialog open={isDelAlertOpen} onOpenChange={setIsDelAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Lançamento</AlertDialogTitle>
            <AlertDialogDescription>Deseja remover este registro? Esta ação é permanente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIdToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); 
                confirmDeletion();
              }} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}