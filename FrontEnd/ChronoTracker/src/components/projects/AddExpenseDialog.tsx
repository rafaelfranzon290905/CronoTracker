import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Receipt, Loader2, UploadCloud, FileText, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/apiConfig";
import { toast } from "sonner";

const expenseSchema = z.object({
    tipo_despesa: z.enum(["Transporte", "Refeição", "Estadia", "Outros"], {
        required_error: "Selecione o tipo de despesa.",
    }),
    data_despesa: z.string().min(1, "Data é obrigatória.").refine((val) => {
        return new Date(val) <= new Date();
    }, "A data não pode ser futura."),
    valor: z.coerce.number().gt(0, "O valor deve ser maior que zero."),
    descricao: z.string().min(5, "Mínimo de 5 caracteres."),
    anexo: z.string().min(1, "O comprovante é obrigatório."),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface Props {
    projetoId: number;
    colaboradorId: number;
    onSuccess: () => void;
}

export function AddExpenseDialog({ projetoId, colaboradorId, onSuccess }: Props) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<ExpenseFormValues>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            tipo_despesa: undefined,
            data_despesa: new Date().toISOString().split("T")[0],
            valor: 0,
            descricao: "",
            anexo: "",
        },
    });

    const processFile = (file: File) => {
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Formato inválido. Use PDF, JPG ou PNG.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            form.setValue("anexo", reader.result as string, { shouldValidate: true });
            setFileName(file.name);
        };
        reader.readAsDataURL(file);
    };


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    async function onSubmit(values: ExpenseFormValues) {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/despesas`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    projeto_id: projetoId,
                    colaborador_id: colaboradorId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao salvar");
            }

            toast.success("Despesa lançada com sucesso!");
            setOpen(false);
            form.reset();
            setFileName(null);
            onSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-blue-200 hover:bg-blue-50 text-blue-700">
                    <Receipt className="h-4 w-4" />
                    Lançar Despesa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="text-blue-600" /> Novo Lançamento
                    </DialogTitle>
                    <DialogDescription>
                        Registre seus gastos vinculados a este projeto. O comprovante é obrigatório.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tipo_despesa"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Despesa</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Transporte">Transporte</SelectItem>
                                                <SelectItem value="Refeição">Refeição</SelectItem>
                                                <SelectItem value="Estadia">Estadia</SelectItem>
                                                <SelectItem value="Outros">Outros</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="valor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Valor (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="data_despesa"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data do Gasto</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="descricao"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição/Justificativa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Uber para reunião com cliente" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="anexo"
                            render={() => (
                                <FormItem className="space-y-2">
                                    <FormLabel>Comprovante (Anexo Obrigatório)</FormLabel>
                                    <FormControl>
                                        <div
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`
                                                flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
                                                ${isDragging ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}
                                                ${fileName ? "border-green-500 bg-green-50" : ""}
                                            `}
                                        >
                                            <Input
                                                type="file"
                                                ref={fileInputRef} 
                                                className="hidden" 
                                                onChange={handleFileChange}
                                                accept=".pdf,.jpg,.jpeg,.png"
                                            />

                                            {fileName ? (
                                                <div className="flex flex-col items-center gap-2 text-green-600 font-medium text-center">
                                                    <CheckCircle2 className="h-8 w-8" />
                                                    <span className="text-xs truncate max-w-[250px]">{fileName}</span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2 h-7 text-[10px] border-green-200 text-green-700 hover:bg-green-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); 
                                                            setFileName(null);
                                                            form.setValue("anexo", "");
                                                        }}
                                                    >
                                                        Substituir Arquivo
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <UploadCloud className={`h-10 w-10 ${isDragging ? "text-blue-500 animate-bounce" : "text-blue-400"}`} />
                                                    <div className="text-center">
                                                        <p className="text-sm font-semibold text-blue-600">Clique ou arraste o comprovante</p>
                                                        <p className="text-[10px]">PDF, JPG ou PNG (máx. 5MB)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button type="submit" disabled={isLoading} className="w-full bg-blue-950 hover:bg-blue-900 rounded-xl">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar para Aprovação"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}