import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PlusCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";    
import { Checkbox } from "@/components/ui/checkbox";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { API_BASE_URL } from  "@/apiConfig";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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


// --- Schema Zod --- //
const activitySchema = z.object({
    nome_atividade: z.string().min(1, { message: "O nome é obrigatório." }),
    projeto_id: z.string().min(1, { message: "Selecione um projeto" }),
    prioridade: z.enum(["muito alta", "alta", "normal", "baixa"]).default("normal"),
    colaborador_ids:z.array(z.number()).default([]),
    descr_atividade: z.string().optional().nullable(),
    horas_previstas: z.preprocess(
        (val) => (val === "" ? 0 : Number(val)), 
        z.number().min(0, "As horas não podem ser negativas")
    ),
    data_prevista_inicio: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de início inválida." }),
    data_prevista_fim: z.string().refine((val) => val === "" || !isNaN(Date.parse(val)), { message: "Data de fim inválida." }).or(z.literal("")),
    status: z.string().default("Pendente"),
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
    const [selectedColaboradores, setSelectedColaboradores] = useState<number[]>([]);
    const [popoverOpen, setPopoverOpen] = useState(false);


    const formActivities = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        defaultValues: {
            nome_atividade: "",
            prioridade: "normal",
            descr_atividade: "",
            data_prevista_inicio: new Date().toISOString().split('T')[0],
            data_prevista_fim: "",
            horas_previstas: 0,
            status: "Pendente",
            projeto_id: "",
            colaborador_ids: []
        },
    });

    useEffect(() => {
        formActivities.setValue("colaborador_ids", selectedColaboradores);
    }, [selectedColaboradores, formActivities]);

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
                status: "Pendente",
                projeto_id: "",
                colaborador_ids: []
            });
            setSelectedColaboradores([]);
            setPopoverOpen(false);
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
            horas_previstas: Number(data.horas_previstas) || 0,
            colaborador_ids: selectedColaboradores,
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

                            {/* Descrição */}
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
                                    <Select onValueChange={(value) => {
                                            field.onChange(value);
                                            setSelectedColaboradores([]); 
                                            setPopoverOpen(false); 
                                            }}  
                                            defaultValue={field.value}>
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
                            <FormField
                                control={formActivities.control}
                                name="colaborador_ids"
                                render={() => (
                                    <FormItem >
                                        <FormLabel>Responsáveis pela Atividade</FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between font-normal"
                                                        disabled={equipeDisponivel.length === 0}
                                                    >
                                                        {selectedColaboradores.length > 0
                                                            ? `${selectedColaboradores.length} selecionado(s)`
                                                            : "Selecionar responsáveis..."}
                                                        <PlusCircle className="ml-2 h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0" align="start" onWheel={(e) => e.stopPropagation()}>
                                                    <ScrollArea className="h-60">
                                                        <div className="p-2">
                                                            {equipeDisponivel.map((v) => (
                                                                <div key={v.colaboradores.colaborador_id} className="flex items-center space-x-2 p-2 hover:bg-slate-100 rounded-md">
                                                                    <Checkbox
                                                                        id={`colab-edit-${v.colaboradores.colaborador_id}`}
                                                                        checked={selectedColaboradores.includes(v.colaboradores.colaborador_id)}
                                                                        onCheckedChange={(checked) => {
                                                                            if (checked) {
                                                                                setSelectedColaboradores([...selectedColaboradores, v.colaboradores.colaborador_id]);
                                                                            } else {
                                                                                setSelectedColaboradores(selectedColaboradores.filter(id => id !== v.colaboradores.colaborador_id));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label htmlFor={`colab-edit-${v.colaboradores.colaborador_id}`} className="text-sm cursor-pointer flex-1">
                                                                        {v.colaboradores.nome_colaborador}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedColaboradores.map(id => {
                                                const colab = equipeDisponivel.find(v => v.colaboradores.colaborador_id === id);
                                                return (
                                                    <Badge key={id} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">
                                                        {colab?.colaboradores.nome_colaborador.split(' ')[0]}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField control={formActivities.control} name="prioridade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prioridade</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione a prioridade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="muito alta">🔴 Muito Alta</SelectItem>
                                                <SelectItem value="alta">🟠 Alta</SelectItem>
                                                <SelectItem value="normal">🔵 Normal</SelectItem>
                                                <SelectItem value="baixa">⚪ Baixa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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

                            <FormField
                                control={formActivities.control}
                                name="horas_previstas"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Horas Previstas para a Atividade</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Ex: 10" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField control={formActivities.control} name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-white">
                                                <SelectItem value="Pendente">Pendente</SelectItem>
                                                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                                                <SelectItem value="Concluída">Concluída</SelectItem>
                                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Status */}
                            {/* <FormField control={formActivities.control} name="status"
                                render={({ field }) => (<FormItem><FormLabel>Status</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="a_fazer">A fazer</SelectItem>
                                                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                                                    <SelectItem value="concluido">Concluído</SelectItem>
                                                </SelectContent>
                                            </Select><FormMessage /></FormItem>)}/> */}

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
