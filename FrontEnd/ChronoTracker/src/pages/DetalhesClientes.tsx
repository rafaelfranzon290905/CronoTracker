import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "@/apiConfig";

import SideBar from "@/components/componentes/SideBar";
import Header from "@/components/componentes/Header";
import { PageHeader } from "@/components/componentes/TituloPagina";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FolderKanban,
} from "lucide-react";

export default function DetalhesCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/clientes/${id}`);

      if (!res.ok) {
        setCliente(null);
        return;
      }

      const data = await res.json();
      setCliente(data);
    } catch (error) {
      console.error("Erro ao carregar cliente:", error);
      setCliente(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-950" />
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Cliente não encontrado</h2>
        <Button onClick={() => navigate("/clientes")}>
          Voltar para lista
        </Button>
      </div>
    );
  }

  // ===== CÁLCULOS ESTRATÉGICOS =====

  const totalProjetos = cliente?.projetos?.length || 0;

  const projetosAtivos =
    cliente?.projetos?.filter((p: any) => p.status)?.length || 0;

  const totalHoras =
    cliente?.projetos?.reduce((acc: number, projeto: any) => {
      const somaDoProjeto =
        projeto.lancamentos_de_horas?.reduce(
          (total: number, lancamento: any) => total + Number(lancamento.duracao_total || 0),
          0
        ) || 0;
      return acc + somaDoProjeto;
    }, 0) || 0;

  const totalDespesas =
    cliente?.projetos?.reduce((acc: number, p: any) => {
      const somaProjeto =
        p.despesas
          ?.filter((d: any) => d.status_aprovacao === "Aprovada")
          ?.reduce((s: number, d: any) => s + Number(d.valor), 0) || 0;
      return acc + somaProjeto;
    }, 0) || 0;

  const hoje = new Date();

  const projetosAtrasados =
    cliente?.projetos?.filter((p: any) => {
      if (!p.status || !p.data_fim) return false;
      return new Date(p.data_fim) < hoje;
    })?.length || 0;

  const projetosEstourados =
    cliente?.projetos?.filter((p: any) => {
      if (!p.horas_previstas) return false;
      return (p.horas_gastas || 0) > p.horas_previstas;
    })?.length || 0;

    const projectStatusConfig: any = {
        "Orçando": "bg-amber-500",
        "Em Andamento": "bg-blue-600",
        "Concluído": "bg-green-600",
        "Cancelado": "bg-red-600",
    };

  return (
    <div className="flex h-screen w-full">
      <SideBar />

      <div className="flex-1 p-6 overflow-auto bg-slate-50/30">
        <Header />

        <main className="mt-4">
          <PageHeader
            title={cliente.nome_cliente}
            subtitle="Cliente cadastrado no sistema"
          >
            <div className="flex items-center gap-3">
              <Badge
                className={
                  cliente.status ? "bg-green-600" : "bg-red-600"
                }
              >
                {cliente.status ? "Ativo" : "Inativo"}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </PageHeader>

          <div className="grid gap-6 md:grid-cols-3 mt-6">
            
            {/* COLUNA PRINCIPAL */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">
                    Projetos do Cliente
                  </CardTitle>
                  <CardDescription>
                    Projetos vinculados a este cliente
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {cliente.projetos && cliente.projetos.length > 0 ? (
                    cliente.projetos.map((proj: any) => (
                      <div
                        key={proj.projeto_id}
                        className="flex items-center justify-between p-3 border rounded-md bg-white shadow-sm hover:border-blue-200 transition-all"
                      >
                        <span
                          onClick={() =>
                            navigate(`/projetos/${proj.projeto_id}`)
                          }
                          className="text-sm font-medium text-blue-900 hover:underline cursor-pointer"
                        >
                          {proj.nome_projeto}
                        </span>

                        <Badge className={`${projectStatusConfig[proj.status] || "bg-slate-400"} text-white border-none`}>
                            {proj.status || "Orçando"}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic text-center py-4">
                      Nenhum projeto vinculado.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* COLUNA LATERAL - RESUMO */}
            <div className="space-y-6">
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FolderKanban className="h-5 w-5 text-blue-600" />
                    Resumo do Cliente
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total de Projetos</span>
                    <span className="font-bold text-blue-900">
                      {totalProjetos}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projetos Ativos</span>
                    <span className="font-medium">
                      {projetosAtivos}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Horas Consumidas</span>
                    <span className="font-medium">
                      {totalHoras.toFixed(1)}h
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Despesas Aprovadas</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(totalDespesas)}
                    </span>
                  </div>

                  {projetosAtrasados > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Projetos Atrasados
                        </span>
                        <span className="font-bold text-red-600">
                          {projetosAtrasados}
                        </span>
                      </div>
                    </>
                  )}

                  {projetosEstourados > 0 && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Projetos com Horas Excedidas
                        </span>
                        <span className="font-bold text-orange-600">
                          {projetosEstourados}
                        </span>
                      </div>
                    </>
                  )}

                  <Separator />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpenModal(true)}
                  >
                    Ver Dados Cadastrais
                  </Button>

                </CardContent>
              </Card>
            </div>
          </div>

          {/* MODAL PADRÃO PROJETOS */}
          <Dialog open={openModal} onOpenChange={setOpenModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dados Cadastrais</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 text-sm mt-2">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">CNPJ</p>
                    <p className="font-medium">
                      {cliente.cnpj || "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">CEP</p>
                    <p className="font-medium">
                      {cliente.cep || "Não informado"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-muted-foreground text-xs">Endereço</p>
                  <p className="font-medium">
                    {cliente.endereco || "Não informado"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Cidade</p>
                    <p className="font-medium">
                      {cliente.cidade || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">Estado</p>
                    <p className="font-medium">
                      {cliente.estado || "-"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-muted-foreground text-xs">ID Interno</p>
                  <p className="font-medium text-blue-900">
                    #{cliente.cliente_id}
                  </p>
                </div>

              </div>
            </DialogContent>
          </Dialog>

        </main>
      </div>
    </div>
  );
}
