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
import { API_BASE_URL } from  "@/apiConfig"
import { toast } from "sonner";


// const API_BASE_URL = 'http://localhost:3001'

interface DeleteActivityProps {
    activityId: string | number;
    onSuccess: () => void; // Função para atualizar a lista após a exclusão
    open?: boolean;         
    onOpenChange?: (open: boolean) => void;
}

export function DeleteActivityDialog({ activityId, onSuccess }: DeleteActivityProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDeleting(true);
        // setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/atividades/${activityId}`, {
                method: 'DELETE',
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                toast.success("Atividade removida com sucesso!");
                setOpen(false); // Fecha o modal apenas no sucesso
                onSuccess(); 
            } else {
                const errorMsg = result.error || "Não foi possível excluir a atividade.";
                toast.error(errorMsg);
            }
            onSuccess(); 
        } catch (e: any) {
            console.error("Erro ao deletar:", e);
            toast.error("Erro de conexão com o servidor.");
            setError(e.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className=" flex items-center gap-2 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" /> 
                    <span>Excluir</span>
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