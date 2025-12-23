
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Loader2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    // DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "../ui/scroll-area"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { type Projeto } from "@/lib/projects"


const formSchema = z.object({
    nome_projeto: z.string().min(3, { message: "O nome do projeto deve ter pelo menos 3 caracteres." }),
    cliente_id: z.string().min(1, { message: "Selecione um cliente." }),
    descricao: z.string().optional(),
    data_inicio: z.string().min(1, { message: "A data de início é obrigatória." }),
    data_fim: z.string().min(1, { message: "A data de fim é obrigatória." }),
    status: z.boolean(),
}).refine((data) => {
    const inicio = new Date(data.data_inicio);
    const fim = new Date(data.data_fim);
    return fim >= inicio;
}, {
    message: "A data fim não pode ser anterior ao início",
    path: ["data_fim"],
});

type ProjetoFormValues = z.infer<typeof formSchema>;

interface AddProjectDialogProps {
    clientes: { cliente_id: number; nome_cliente: string }[];
    onSuccess: () => void;
    projectToEdit?: Projeto;
}

export function AddProjectDialog({ clientes, onSuccess, projectToEdit }: AddProjectDialogProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    console.log("Componente Modal Renderizado. Estado open:", open);

    const isEditMode = !!projectToEdit; // Verifica se está em modo de edição

    const formProjects = useForm<ProjetoFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome_projeto: "",
            cliente_id: "",
            descricao: "",
            data_inicio: "",
            data_fim: "",
            status: true,
        },
    });

    useEffect(() => {
        if (open && projectToEdit) {
            formProjects.reset({
                nome_projeto: projectToEdit.nome_projeto,
                cliente_id: projectToEdit.cliente_id.toString(),
                descricao: projectToEdit.descricao || "",
                data_inicio: projectToEdit.data_inicio ? new Date(projectToEdit.data_inicio).toISOString().split('T')[0] : "",
                data_fim: projectToEdit.data_fim ? new Date(projectToEdit.data_fim).toISOString().split('T')[0] : "",
                status: projectToEdit.status,
            });
        } else if (open && !projectToEdit) {
            formProjects.reset({
                nome_projeto: "",
                cliente_id: "",
                descricao: "",
                data_inicio: "",
                data_fim: "",
                status: true,
            });
        }
    }, [open, projectToEdit, formProjects]);

    async function onSubmit(values: ProjetoFormValues) {
        setIsLoading(true);
        try {
            const url = isEditMode
                ? `http://localhost:3001/projetos/${projectToEdit?.projeto_id}`
                : "http://localhost:3001/projetos";

            const method = isEditMode ? "PUT" : "POST";

            // const response = await fetch("http://localhost:3001/projetos", {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify({
            //         ...values,
            //         cliente_id: parseInt(values.cliente_id)
            //     }),
            // });

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...values,
                    cliente_id: parseInt(values.cliente_id)
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(`Erro: ${errorData.error}`);
                return;
            }
            setOpen(false);
            // formProjects.reset();
            if (!isEditMode) formProjects.reset();
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
            {isEditMode ? (
                <div onClick={(e) => {
                    e.preventDefault();
                    setOpen(true);
                }}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm outline-none hover:bg-gray-100 cursor-pointer rounded-sm transition-colors w-full"
                >
                    <Edit className="h-4 w-4 text-blue-900" />
                    <span>Editar</span>
                </div>
            ) : (
                <Button onClick={() => setOpen(true)} className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800 mx-3">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Projeto
                </Button>
            )}
            < Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        {/* <DialogTitle>Adicionar Novo Projeto</DialogTitle> */}
                        <DialogTitle>{isEditMode ? "Editar Projeto" : "Adicionar Novo Projeto"}</DialogTitle>
                        <DialogDescription>
                            Preencha os dados abaixo para cadastrar um novo projeto.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] p-4">
                        <Form {...formProjects}>
                            <form onSubmit={formProjects.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={formProjects.control}
                                    name="nome_projeto"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome do Projeto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Sistema ERP" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={formProjects.control}
                                    name="cliente_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cliente</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione o cliente" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {clientes.map((c) => (
                                                        <SelectItem key={c.cliente_id} value={c.cliente_id.toString()}>
                                                            {c.nome_cliente}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={formProjects.control}
                                        name="data_inicio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Início *</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={formProjects.control}
                                        name="data_fim"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Fim *</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={formProjects.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel className="text-base">Status</FormLabel>
                                                <div className="flex content-center gap-4">
                                                    <FormDescription className="text-sm">
                                                        {field.value ? "Ativo." : "Inativo."}
                                                    </FormDescription>

                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={formProjects.control}
                                    name="descricao"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Descrição</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Descreva brevemente o projeto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </ScrollArea>

                    <DialogFooter>
                        <Button
                            onClick={formProjects.handleSubmit(onSubmit)}
                            className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800"
                        >
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : (isEditMode ? "Salvar Alterações" : "Salvar Projeto")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

        </>
    );
}