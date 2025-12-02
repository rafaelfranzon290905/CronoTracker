import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const API_BASE_URL = 'http://localhost:3001'

interface DeleteActivityProps {
    activityId: string;
    onSuccess: () => void; // Função para atualizar a lista após a exclusão
}

export function DeleteActivityDialog({ activityId, onSuccess }: DeleteActivityProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            // 🎯 Requisição HTTP DELETE para excluir a atividade
            const response = await fetch(`${API_BASE_URL}/atividades/${activityId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                // Se a API não retornar sucesso, tenta ler o erro
                const result = await response.json();
                throw new Error(result.error || "Falha ao excluir a atividade.");
            }

            // Sucesso: Chama a função para atualizar a lista no componente pai
            onSuccess(); 

        } catch (e: any) {
            console.error("Erro ao deletar:", e);
            setError(e.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. A atividade será removida permanentemente do servidor.
                        {error && <p className="text-sm font-medium text-red-500 mt-2">{error}</p>}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isDeleting}
                    >
                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isDeleting ? "Excluindo..." : "Excluir"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}