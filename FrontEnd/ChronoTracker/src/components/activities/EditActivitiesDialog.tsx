// components/activities/editActivitiesDialog.tsx

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

// Importações dos componentes UI (Ajuste os caminhos se necessário)
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogFooter,
    DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const API_BASE_URL = 'http://localhost:3001'

// --- Zod Schema e Tipagem (COPIE/IMPORTE DO SEU AddActivitiesDialog.tsx) ---
const activitySchema = z.object({
    nome_atividade: z.string().min(1, { message: "O nome é obrigatório." }),
    projeto_id: z.string().refine(val => {
        const num = Number(val);
        return !isNaN(num) && Number.isInteger(num) && num > 0;
    }, {
        message: "O ID do projeto deve ser um número inteiro e positivo.",
        path: ["projeto_id"],
    }),
    descr_atividade: z.string().optional().nullable(),
    data_prevista_inicio: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de início inválida." }),
    data_prevista_fim: z.string().refine((val) => val === "" || !isNaN(Date.parse(val)), { message: "Data de fim inválida." }).or(z.literal("")),
    status: z.enum(["a_fazer", "em_andamento", "concluido"]),
}).refine((data) => {
    if (!data.data_prevista_inicio || data.data_prevista_fim === "") return true;
    return new Date(data.data_prevista_inicio) <= new Date(data.data_prevista_fim)
}, {
    message: "A data de início não pode ser posterior à data de fim.",
    path: ["data_prevista_fim"],
});
type ActivityFormValues = z.infer<typeof activitySchema>


// --- Definição do Componente ---
interface EditActivitiesDialogProps {
    atividadeId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditActivitiesDialog({ 
    atividadeId, 
    open, 
    onOpenChange, 
    onSuccess 
}: EditActivitiesDialogProps) {
    
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const formActivities = useForm<ActivityFormValues>({
        resolver: zodResolver(activitySchema),
        // Não definimos defaultValues aqui. Eles serão definidos no useEffect.
    });

    // 🎯 ETAPA 1: Buscar os dados da atividade ao abrir o modal
    useEffect(() => {
        if (!open || !atividadeId) return; // Só busca se o modal estiver aberto e tiver um ID

        const cleanId = Number(atividadeId);
        if (isNaN(cleanId) || cleanId <= 0) {
            setApiError("Erro de ID: O ID da atividade é inválido.");
            setIsLoadingData(false);
            return;
        }

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const response = await fetch(`${API_BASE_URL}/atividades/${cleanId}`);
                if (!response.ok) {
                    throw new Error("Falha ao carregar os dados da atividade.");
                }
                const data = await response.json();
                
                // 💡 Tratamento e população dos dados
                formActivities.reset({
                    nome_atividade: data.nome_atividade || "",
                    // O ID do projeto vem como número, precisa ser string para o input/zod
                    projeto_id: String(data.projeto_id) || "", 
                    descr_atividade: data.descr_atividade || "",
                    // Datas da API geralmente vêm como 'YYYY-MM-DDT...' 
                    // Pegamos apenas a parte da data 'YYYY-MM-DD'
                    data_prevista_inicio: data.data_prevista_inicio ? data.data_prevista_inicio.split('T')[0] : "",
                    data_prevista_fim: data.data_prevista_fim ? data.data_prevista_fim.split('T')[0] : "",
                    status: data.status || "a_fazer",
                });
            } catch (error) {
                setApiError("Erro ao carregar dados: " + (error instanceof Error ? error.message : "Desconhecido"));
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [atividadeId, open, formActivities]);


    // 🎯 ETAPA 2: Função de Submissão (UPDATE)
    async function onSubmit(data: ActivityFormValues) {
        setIsSubmitting(true)
        setApiError(null)

        const payload = {
            ...data,
            // Certifique-se de que null/vazio são enviados corretamente se a API permitir
            descr_atividade: data.descr_atividade || null,
            data_prevista_fim: data.data_prevista_fim || null,
        };
        
        try {
            // ✅ ROTA DE EDIÇÃO (PUT ou PATCH)
            const response = await fetch(`${API_BASE_URL}/atividades/${atividadeId}`, {
                method: 'PUT', // Geralmente PUT para atualização completa
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                setApiError(result.error || `Erro ao atualizar: ${response.statusText}`)
                return
            }

            onOpenChange(false); // Fecha o modal
            formActivities.reset()
            onSuccess(); // Recarrega a tabela
            
        } catch (error) {
            setApiError("Não foi possível conectar ao servidor para atualizar.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editando Atividade ID: {atividadeId}</DialogTitle>
                </DialogHeader>

                {apiError && (<p className="text-sm font-medium text-red-500 mt-2 p-2">{apiError}</p>)}

                {isLoadingData ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                        Carregando dados...
                    </div>
                ) : (
                    <ScrollArea className="max-h-[60vh] p-4">
                        <Form {...formActivities}>
                            <form onSubmit={formActivities.handleSubmit(onSubmit)} className="space-y-4">

                                {/* Nome da atividade */}
                                <FormField control={formActivities.control} name ="nome_atividade"
                                    render={({ field }) => (<FormItem><FormLabel>Nome da atividade</FormLabel><FormControl><Input placeholder="Nome" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                
                                {/* ID do Projeto */}
                                {/* Este campo virá preenchido com o valor atual */}
                                <FormField control={formActivities.control} name ="projeto_id"
                                    render={({ field }) => (<FormItem><FormLabel>ID do Projeto</FormLabel><FormControl><Input placeholder="ID" {...field} /></FormControl><FormMessage /></FormItem>)}/>

                                {/* Descrição (Correção do Uncontrolled Input aplicada: value={field.value ?? ''}) */}
                                <FormField control={formActivities.control} name="descr_atividade"
                                    render={({ field }) => (<FormItem><FormLabel>Descrição</FormLabel><FormControl><Input placeholder="Descreva brevemente a atividade" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}/>

                                {/* Data Prevista de Início */}
                                <FormField control={formActivities.control} name="data_prevista_inicio"
                                    render={({ field }) => (<FormItem><FormLabel>Data Prevista de Início</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>

                                {/* Data Prevista de Fim */}
                                <FormField control={formActivities.control} name="data_prevista_fim"
                                    render={({ field }) => (<FormItem><FormLabel>Data Prevista de Fim</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)}/>

                                {/* Status */}
                                <FormField control={formActivities.control} name="status"
                                     render={({ field }) => (<FormItem><FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="a_fazer">A fazer</SelectItem>
                                                <SelectItem value="em_andamento">Em andamento</SelectItem>
                                                <SelectItem value="concluido">Concluído</SelectItem>
                                            </SelectContent>
                                        </Select><FormMessage /></FormItem>)}/>
                                
                            </form>
                        </Form>
                    </ScrollArea>
                )}

                <DialogFooter>
                    <Button
                        type="submit"
                        // Botão aciona o handler de submissão do react-hook-form
                        onClick={formActivities.handleSubmit(onSubmit)}
                        className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800"
                        disabled={isSubmitting || isLoadingData}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
}