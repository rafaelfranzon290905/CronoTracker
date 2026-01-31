import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// Componentes UI
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { API_BASE_URL } from  "@/apiConfig"

// --- Auto-growing textarea ---
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
      placeholder={placeholder || "Descreva brevemente a atividade"}
      className="w-full p-2 border rounded-md"
      style={{ overflow: "hidden", resize: "none" }}
    />
  );
}

// --- Zod Schema ---
const editActivitySchema = z.object({
    nome_atividade: z.string().min(1, { message: "O nome é obrigatório." }),
    projeto_id: z.string().min(1, {message: "Selecione um projeto"}),
    colaborador_id: z.string().optional().nullable(),
    descr_atividade: z.string().optional().nullable(),
    data_prevista_inicio: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de início inválida." }),
    data_prevista_fim: z.string().refine((val) => val === "" || !isNaN(Date.parse(val)), { message: "Data de fim inválida." }).or(z.literal("")),
    status: z.boolean({ required_error: "O status é obrigatório." }), 
}).refine((data) => {
    if (!data.data_prevista_inicio || data.data_prevista_fim === "") return true;
    return new Date(data.data_prevista_inicio) <= new Date(data.data_prevista_fim)
}, {
    message: "A data de início não pode ser posterior à data de fim.",
    path: ["data_prevista_fim"],
});

type EditActivityFormValues = z.infer<typeof editActivitySchema>

export type AtividadesInitialData = {
    atividade_id: number;
    nome_atividade: string;
    descr_atividade: string | null;
    data_prevista_inicio: string | null;
    data_prevista_fim: string | null; 
    status: boolean; 
    projeto_id: number;
    colaborador_id?: number | null;
};

type ProjetoSelect = {
    projeto_id: number;
    nome_projeto: string;
    projeto_colaboradores?: Array<{
        colaboradores: {
            colaborador_id: number;
            nome_colaborador: string;
        };
    }>;
};

interface EditActivitiesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: AtividadesInitialData;
    projetos: ProjetoSelect[];
    onSuccess: () => void;
}

export function EditActivitiesDialog({ open, onOpenChange, initialData, projetos, onSuccess }: EditActivitiesDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const formActivities = useForm<EditActivityFormValues>({
        resolver: zodResolver(editActivitySchema),
        defaultValues: {
            nome_atividade: initialData.nome_atividade,
            projeto_id: String(initialData.projeto_id),
            colaborador_id: initialData.colaborador_id ? String(initialData.colaborador_id) : "",
            descr_atividade: initialData.descr_atividade || "",
            data_prevista_inicio: initialData.data_prevista_inicio ? new Date(initialData.data_prevista_inicio).toISOString().split('T')[0] : "",
            data_prevista_fim: initialData.data_prevista_fim ? new Date(initialData.data_prevista_fim).toISOString().split('T')[0] : "",
            status: initialData.status,
        },
    });

    const selectedProjetoId = formActivities.watch("projeto_id");
    const projetoSelecionado = projetos.find(p => String(p.projeto_id) === selectedProjetoId);
    const equipeDisponivel = projetoSelecionado?.projeto_colaboradores || [];

    useEffect(() => {
        if (open) {
            formActivities.reset({
                nome_atividade: initialData.nome_atividade,
                projeto_id: String(initialData.projeto_id),
                colaborador_id: initialData.colaborador_id ? String(initialData.colaborador_id) : "",
                descr_atividade: initialData.descr_atividade || "",
                data_prevista_inicio: initialData.data_prevista_inicio ? new Date(initialData.data_prevista_inicio).toISOString().split('T')[0] : "",
                data_prevista_fim: initialData.data_prevista_fim ? new Date(initialData.data_prevista_fim).toISOString().split('T')[0] : "",
                status: initialData.status,
            });
            setApiError(null);
        }
    }, [initialData, open, formActivities]);

    async function onSubmit(data: EditActivityFormValues) {
        setIsSubmitting(true);
        setApiError(null);

        const projetoIdNumerico = parseInt(data.projeto_id, 10);

        const payload = {
            ...data,
            descr_atividade: data.descr_atividade || null,
            data_prevista_fim: data.data_prevista_fim || null,
            projeto_id: projetoIdNumerico,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/atividades/${initialData.atividade_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                setApiError(result.error || `Erro ao editar: ${response.statusText}`);
                return;
            }

            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error(error);
            setApiError("Não foi possível conectar ao servidor.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">

                <DialogHeader>
                    <DialogTitle>Editar Atividade #{initialData.atividade_id}</DialogTitle>
                    <DialogDescription>
                        Ajuste os dados da atividade e defina o status (Ativo/Inativo).
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-4">
                    <Form {...formActivities}>
                        <form onSubmit={formActivities.handleSubmit(onSubmit)} className="space-y-4">

                            {/* Nome da atividade */}
                            <FormField control={formActivities.control} name="nome_atividade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Atividade</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Implementar login" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Projeto vinculado */}
                            <FormField control={formActivities.control} name="projeto_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Projeto vinculado</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione um projeto"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projetos.map((p) => (
                                                    <SelectItem key={p.projeto_id} value={String(p.projeto_id)}>
                                                        {p.nome_projeto}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Responsável */}
                            <FormField control={formActivities.control} name="colaborador_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Responsável</FormLabel>
                                        <Select 
                                            onValueChange={field.onChange} 
                                            value={field.value || ""} 
                                            disabled={equipeDisponivel.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={equipeDisponivel.length > 0 ? "Selecione o responsável" : "Projeto sem equipe"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {equipeDisponivel.map((v) => (
                                                    <SelectItem key={v.colaboradores.colaborador_id} value={String(v.colaboradores.colaborador_id)}>
                                                        {v.colaboradores.nome_colaborador}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Descrição (auto-growing textarea) */}
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

                            {/* Data Prevista de Início */}
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

                            {/* Data Prevista de Fim */}
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

                            {/* Status */}
                            <FormField control={formActivities.control} name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <div className="flex items-center gap-3 mt-2">
                                        <FormControl>
                                            <Switch 
                                                className="w-10 h-6 block"
                                                id="status"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <p className="font-medium">{field.value ? "Ativa" : "Inativa"}</p>
                                        </div>
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
                        Salvar Alterações
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}
