import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Edit, Loader2 } from "lucide-react"
// ❌ O que pode estar errado:
// import { DialogHeader } from "@/components/ui/dialog" 

// 🚀 O que deve estar correto (Agrupando todos os componentes do modal):
import {
    Dialog,
    DialogContent,
    DialogDescription, // Se estiver usando
    DialogFooter,
    DialogHeader,      // 👈 O componente que estava dando erro
    DialogTitle,       // Se estiver usando
    DialogTrigger,     // Se estiver usando
} from "@/components/ui/dialog"
// ... (Importações dos componentes UI e do Zod Schema, ActivityFormValues, Projeto) ...
// Reutilize todas as importações do AddActivitiesDialog.tsx aqui!

const API_BASE_URL = 'http://localhost:3001';

// Supondo que você tem estas interfaces e schema definidos em outro lugar
interface Projeto { id: string; nome: string; }
// ... (Defina o activitySchema e ActivityFormValues novamente aqui ou importe-os) ...

interface EditActivityProps {
    currentActivity: ActivityFormValues & { id: string }; // Dados atuais da atividade, incluindo ID
    projetos: Projeto[];
    onSuccess: () => void; // Função para atualizar a lista após a edição
}

export function EditActivityDialog({ currentActivity, projetos, onSuccess }: EditActivityProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const formActivities = useForm<ActivityFormValues>({
        // Assumindo que 'activitySchema' está disponível
        // resolver: zodResolver(activitySchema), 
        // 🎯 DIFERENÇA 1: Usamos os dados atuais como defaultValues
        defaultValues: currentActivity, 
    });

    useEffect(() => {
        // 🎯 Atualiza o formulário se a atividade mudar (útil se o componente for reutilizado)
        formActivities.reset(currentActivity);
    }, [currentActivity, formActivities]);


    async function onSubmit(data: ActivityFormValues) {
        setIsSubmitting(true);
        setApiError(null);

        try {
            // 🎯 DIFERENÇA 2: Método PUT/PATCH e URL com ID
            const response = await fetch(`${API_BASE_URL}/atividades/${currentActivity.id}`, {
                method: 'PUT', // Ou PATCH, dependendo da sua API
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const result = await response.json();
                setApiError(result.error || `Erro ao salvar alterações: ${response.statusText}`);
                return;
            }
            
            setOpen(false);
            onSuccess(); // Atualiza a lista de atividades na página

        } catch (error) {
            setApiError("Não foi possível conectar ao servidor.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Botão de edição, geralmente um ícone */}
                <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Atividade: {currentActivity.nome_atividade}</DialogTitle>
                    {/* ... (Restante do Diálogo) ... */}
                </DialogHeader>

                {/* 🎯 O CORPO DO FORMULÁRIO (ScrollArea e FormField) É EXATAMENTE IGUAL ao AddActivitiesDialog 🎯 */}
                {/* Copie e cole toda a seção <ScrollArea> e <Form> do modal de adição aqui. */}
                {/* ... */}
                
                <DialogFooter>
                    <Button onClick={formActivities.handleSubmit(onSubmit)} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}