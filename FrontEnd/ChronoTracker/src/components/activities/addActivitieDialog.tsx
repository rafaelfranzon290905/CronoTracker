
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
  nome_atividade: z.string().min(3, { message: "O nome da atividade é obrigatório." }),
  projeto_id: z.string().min(1, { message: "Selecione o projeto vinculado." }),
  descr_atividade: z.string().min(3, { message: "A descrição é obrigatória." }),
  data_prevista_inicio: z.string().min(1, { message: "Informe a data de início." }),
  data_prevista_fim: z.string().min(1, { message: "Informe a data de fim." }),
  status: z.enum(["a_fazer", "em_andamento", "concluido"]),
});

type ActivitiesFormValues = z.infer<typeof formSchema>;

interface AddActivitiesDialogProps {
    projetos: { id: string; nome: string }[];
}

export function AddProjectDialog({ projetos }: AddActivitiesDialogProps) {
    const [open, setOpen] = useState(false);

    const formActivities = useForm<ActivitiesFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome_atividade: "",
            projeto_id: "",
            descr_atividade: "",
            data_prevista_inicio: "",
            data_prevista_fim: "",
            status: "a_fazer",
        },
    });

    function onSubmit(values: ActivitiesFormValues) {
        console.log("Nova Atividade:", values);
        setOpen(false);
        formActivities.reset();
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
                            <FormField
                                control={formActivities.control}
                                name ="nome_atividade"
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

                            <FormField
                                control={formActivities.control}
                                name="projeto_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Projeto Vinculado</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o projeto" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {projetos.map((c) => (
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
                                control={formActivities.control}
                                name="descr_atividade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descrição</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Descreva brevemente a atividade" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={formActivities.control}
                                name="data_prevista_inicio"
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

                            <FormField
                                control={formActivities.control}
                                name="data_prevista_fim"
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="a_fazer">A fazer</SelectItem>
                                                <SelectItem value="em_andamento">Em andamento</SelectItem>
                                                <SelectItem value="concluido">Concluído</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </ScrollArea>

                <DialogFooter>
                    <Button
                        onClick={formActivities.handleSubmit(onSubmit)}
                        className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800"
                    >
                        Salvar Atividade
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}