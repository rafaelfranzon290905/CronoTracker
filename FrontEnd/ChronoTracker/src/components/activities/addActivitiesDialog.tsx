import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2 } from "lucide-react";

// --- AutoResizeTextarea --- //
function AutoResizeTextarea({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Digite a descrição..."}
      className="w-full p-2 border rounded-md"
      style={{ overflow: "hidden", resize: "none" }}
    />
  );
}

// --- Componentes UI --- //
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "../ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { API_BASE_URL } from  "@/apiConfig";

// --- Schema Zod --- //
const activitySchema = z.object({
    nome_atividade: z.string().min(1, { message: "O nome é obrigatório." }),
    projeto_id: z.string().min(1, { message: "Selecione um projeto" }),
    colaborador_id: z.string().optional().nullable(),
    descr_atividade: z.string().optional().nullable(),
    data_prevista_inicio: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de início inválida." }),
    data_prevista_fim: z.string().refine((val) => val === "" || !isNaN(Date.parse(val)), { message: "Data de fim inválida." }).or(z.literal("")),
    status: z.boolean({ required_error: "é obrigatório colocar um status" }),
}).refine((data) => {
    if (!data.data_prevista_inicio || data.data_prevista_fim === "") return true;
    return new Date(data.data_prevista_inicio) <= new Date(data.data_prevista_fim);
}, {
    message: "A data de início não pode ser posterior à data de fim.",
    path: ["data_prevista_fim"],
});

type ActivityFormValues = z.infer<typeof activitySchema>;

type ProjetoSelect = {
    projeto_id: number;
    nome_projeto: string;
    data_inicio: string;
    projeto_colaboradores?: Array<{
        colaboradores: {
            colaborador_id: number;
            nome_colaborador: string;
        };
    }>;
};

// --- Componente AddActivitiesDialog --- //
export function AddActivitiesDialog({ projetos, onSuccess }: { projetos: ProjetoSelect[]; onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const formActivities = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            nome_atividade: "",
            descr_atividade: "",
            data_prevista_inicio: new Date().toISOString().split('T')[0],
            data_prevista_fim: "",
            status: true,
            projeto_id: "",
            colaborador_id: "",
        },
    });

    const selectedProjetoId = formActivities.watch("projeto_id");
    const projetoSelecionado = projetos.find(p => String(p.projeto_id) === selectedProjetoId);
    const equipeDisponivel = projetoSelecionado?.projeto_colaboradores || [];

    useEffect(() => {
        if (!open) {
            formActivities.reset({
                nome_atividade: "",
                descr_atividade: "",
                data_prevista_inicio: new Date().toISOString().split('T')[0],
                data_prevista_fim: "",
                status: true,
                projeto_id: "",
            });
            formActivities.clearErrors();
            setApiError(null);
        }
    }, [open, formActivities.reset]);

    async function onSubmit(data: ActivityFormValues) {
        setIsSubmitting(true);
        setApiError(null);

        const projetoSelecionado = projetos.find(p => String(p.projeto_id) === data.projeto_id);

        if (projetoSelecionado && data.data_prevista_inicio) {
            const dataInicioProjeto = projetoSelecionado.data_inicio.split('T')[0];
            const dataInicioAtividade = data.data_prevista_inicio;

            if (dataInicioAtividade < dataInicioProjeto) {
                formActivities.setError("data_prevista_inicio", {
                    type: "manual",
                    message: `A atividade não pode iniciar antes do projeto (${dataInicioProjeto})`,
                });
                setIsSubmitting(false);
                return;
            }
        }

        const payload = {
            ...data,
            projeto_id: parseInt(data.projeto_id, 10),
            colaborador_id: data.colaborador_id ? parseInt(data.colaborador_id, 10) : null,
            descr_atividade: data.descr_atividade || null,
            data_prevista_fim: data.data_prevista_fim || null,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/atividades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                setApiError(result.error || `Erro ao cadastrar: ${response.statusText}`);
                return;
            }

            setOpen(false);
            formActivities.reset();
            onSuccess();
        } catch (error) {
            setApiError("Não foi possível conectar ao servidor.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800 mx-3">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Atividade
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Atividade</DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para cadastrar uma nova atividade.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-4">
                    <Form {...formActivities}>
                        <form onSubmit={formActivities.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Nome da atividade */}
                            <FormField control={formActivities.control} name="nome_atividade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da atividade</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Implementar login" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Descrição com AutoResizeTextarea */}
                            <FormField control={formActivities.control} name="descr_atividade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <AutoResizeTextarea
                                                value={field.value || ''}
                                                onChange={field.onChange}
                                                placeholder="Descreva brevemente a atividade"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Projeto */}
                            <FormField control={formActivities.control} name="projeto_id" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Projeto vinculado</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione um projeto"/>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {projetos.map((projeto) => (
                                                <SelectItem
                                                    key={projeto.projeto_id}
                                                    value={String(projeto.projeto_id)}>
                                                    ({projeto.projeto_id}) - {projeto.nome_projeto}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            {/* Colaborador */}
                            <FormField control={formActivities.control} name="colaborador_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Responsável</FormLabel>
                                    <Select 
                                        onValueChange={field.onChange} 
                                        value={field.value || ""} 
                                        disabled={!selectedProjetoId || equipeDisponivel.length === 0}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={
                                                    !selectedProjetoId 
                                                    ? "Selecione um projeto primeiro" 
                                                    : equipeDisponivel.length > 0 
                                                        ? "Selecione o responsável" 
                                                        : "Este projeto não tem equipe"
                                                } />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {equipeDisponivel.map((vinc) => (
                                                <SelectItem 
                                                    key={vinc.colaboradores.colaborador_id} 
                                                    value={String(vinc.colaboradores.colaborador_id)}
                                                >
                                                    {vinc.colaboradores.nome_colaborador}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {/* Datas e status */}
                            <FormField control={formActivities.control} name="data_prevista_inicio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data Prevista de Início</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField control={formActivities.control} name="data_prevista_fim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data Prevista de Fim</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField control={formActivities.control} name="status"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <Switch 
                                                className="w-10 h-5"
                                                id="status"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <p>{field.value ? "Ativa" : "Inativa"}</p>
                                    </FormItem>
                                )}
                            />

                            {apiError && (<p className="text-sm font-medium text-red-500 mt-2">{apiError}</p>)}

                        </form>
                    </Form>
                </ScrollArea>

                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={formActivities.handleSubmit(onSubmit)}
                        className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800"
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Atividade
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
