
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
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


const formSchema = z.object({
    name: z.string().min(3, { message: "O nome do projeto deve ter pelo menos 3 caracteres." }),
    cliente: z.string().min(1, { message: "Selecione um cliente." }),
    descricao: z.string().min(3, { message: "A descrição é obrigatória." }),
    dataEntrada: z.string().min(1, { message: "A data de início é obrigatória." }),
    dataFim: z.string().min(1, { message: "A data de fim é obrigatória." }),
    status: z.boolean(),
});

type ProjetoFormValues = z.infer<typeof formSchema>;

interface AddProjectDialogProps {
    clientes: { id: string; nome: string }[];
}

export function AddProjectDialog({ clientes }: AddProjectDialogProps) {
    const [open, setOpen] = useState(false);

    const formProjects = useForm<ProjetoFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            cliente: "",
            descricao: "",
            dataEntrada: "",
            dataFim: "",
            status: true,
        },
    });

    function onSubmit(values: ProjetoFormValues) {
        console.log("Novo Projeto:", values);
        setOpen(false);
        formProjects.reset();
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800 mx-3">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Projeto
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Projeto</DialogTitle>
                    <DialogDescription>
                        Preencha os dados abaixo para cadastrar um novo projeto.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] p-4">
                    <Form {...formProjects}>
                        <form onSubmit={formProjects.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={formProjects.control}
                                name="name"
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
                                name="cliente"
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
                                                    <SelectItem key={c.id} value={c.nome}>
                                                        {c.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formProjects.control}
                                name="descricao"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Descreva brevemente o projeto" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formProjects.control}
                                name="dataEntrada"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Início</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formProjects.control}
                                name="dataFim"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Data de Fim</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
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
                        Salvar Projeto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}