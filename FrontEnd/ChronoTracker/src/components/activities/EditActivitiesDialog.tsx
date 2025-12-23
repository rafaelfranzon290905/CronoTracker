import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"

// Importações dos componentes UI (Ajuste os caminhos se necessário)
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


// Supondo que você use o mesmo URL base
const API_BASE_URL = 'http://localhost:3001';

// ... (Coloque editActivitySchema e EditActivityFormValues aqui ou no arquivo de schemas) ...
// No arquivo de definição dos schemas (ou no topo do componente EditActivitiesDialog)

type ProjetoSelect = {
    projeto_id: number;
    nome_projeto: string;
}

// 1. Defina o Status como Booleano no Schema de Edição
const editActivitySchema = z.object({
    nome_atividade: z.string().min(1, { message: "O nome é obrigatório." }),
    projeto_id: z.string().min(1, {message: "Selecione um projeto"}),
    descr_atividade: z.string().optional().nullable(),
    data_prevista_inicio: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de início inválida." }),
    data_prevista_fim: z.string().refine((val) => val === "" || !isNaN(Date.parse(val)), { message: "Data de fim inválida." }).or(z.literal("")),
    // ✅ NOVO: O status é um booleano (true/false)
    status: z.boolean({ required_error: "O status é obrigatório." }), 
}).refine((data) => {
    if (!data.data_prevista_inicio || data.data_prevista_fim === "") return true;
    return new Date(data.data_prevista_inicio) <= new Date(data.data_prevista_fim)
}, {
    message: "A data de início não pode ser posterior à data de fim.",
    path: ["data_prevista_fim"],
});

type EditActivityFormValues = z.infer<typeof editActivitySchema>

// 2. Defina a Interface dos Dados Iniciais (Atividades)
// Use a interface 'Atividades' que você já tem, mas com status: boolean
// Se você não tem acesso à interface, defina-a aqui:
export type AtividadesInitialData = {
    atividade_id: number;
    nome_atividade: string;
    descr_atividade: string | null;
    data_prevista_inicio: string; // Esperamos uma string 'YYYY-MM-DD'
    data_prevista_fim: string | null; // Esperamos uma string 'YYYY-MM-DD' ou null
    status: boolean; // ✅ Status como boolean
    projeto_id: number;
};

interface EditActivitiesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void; // Para fechar o modal
    initialData: AtividadesInitialData; // Os dados da atividade a ser editada
    projetos: ProjetoSelect;
    onSuccess: () => void; // Recarrega os dados na tabela
}

export function EditActivitiesDialog({ open, onOpenChange, initialData, projetos, onSuccess }: EditActivitiesDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // Inicializa o formulário com os dados da atividade
    const formActivities = useForm<EditActivityFormValues>({
        resolver: zodResolver(editActivitySchema),
        defaultValues: {
            nome_atividade: initialData.nome_atividade,
            projeto_id: String(initialData.projeto_id),
            descr_atividade: initialData.descr_atividade || "", // Garante string vazia se null
            data_prevista_inicio: initialData.data_prevista_inicio ? new Date(initialData.data_prevista_inicio).toISOString().split('T')[0] : "",
            data_prevista_fim: initialData.data_prevista_fim ? new Date(initialData.data_prevista_fim).toISOString().split('T')[0] : "",
            status: initialData.status, // ✅ Passando o booleano
        },
    });

    // Resetar o formulário quando os dados iniciais mudarem (garante que os dados da atividade correta sejam carregados)
    useEffect(() => {
        if (open) {
            formActivities.reset({
                nome_atividade: initialData.nome_atividade,
                descr_atividade: initialData.descr_atividade || "",
                data_prevista_inicio: initialData.data_prevista_inicio ? new Date(initialData.data_prevista_inicio).toISOString().split('T')[0] : "",
                data_prevista_fim: initialData.data_prevista_fim ? new Date(initialData.data_prevista_fim).toISOString().split('T')[0] : "",
                status: initialData.status,
                projeto_id: String(initialData.projeto_id),
            });
            setApiError(null);
        }
    }, [initialData, open, formActivities, projetos]);


    async function onSubmit(data: EditActivityFormValues) {
        setIsSubmitting(true);
        setApiError(null);

        const projetoIdNumerico = parseInt(data.projeto_id, 10)

        const payload = {
            ...data,
            // A rota PUT do backend já foi ajustada para aceitar status boolean, 
            // então data.status já está correto (true/false)
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
            {/* O DialogTrigger não é necessário aqui pois o modal será aberto por uma função */}
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
                                render={({ field }) => (<FormItem><FormLabel>Nome da Atividade</FormLabel><FormControl><Input placeholder="Ex: Implementar login" {...field} /></FormControl><FormMessage /></FormItem>)}/>

                            {/* Descrição */}
                            <FormField control={formActivities.control} name="descr_atividade"
                                render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Descreva brevemente a atividade" {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>)}/>

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
                            )}
                            />

                            {/* Data Prevista de Início */}
                            <FormField control={formActivities.control} name="data_prevista_inicio"
                                render={({ field }) => (<FormItem><FormLabel>Data Prevista de Início</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>

                            {/* Data Prevista de Fim */}
                            <FormField control={formActivities.control} name="data_prevista_fim"
                                render={({ field }) => (<FormItem><FormLabel>Data Prevista de Fim</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>

                            {/* Status (Checkbox) */}
                            <FormField
                                control={formActivities.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="">
                                    
                                            <FormLabel>
                                                Status (Ativa/Inativa)
                                            </FormLabel>
                                        <FormControl>
                                           
                                            <Switch 
                                                className="w-10 h-5"
                                                id="status"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                            />
                                        </FormControl>
                                            <DialogDescription className="text-sm text-muted-foreground pt-1">
                                                {field.value ? "Atividade marcada como Ativa." : "Atividade marcada como Inativa."}
                                            </DialogDescription>
                                        
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