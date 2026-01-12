'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Collaborador } from "@/lib/types"
import { API_BASE_URL } from  "@/apiConfig"

// Reutilizando o schema do componente de Adicionar
const formSchema = z.object({
  nome_colaborador: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  cargo: z.string().min(2, { message: "O cargo é obrigatório." }),
  email: z.string().email({ message: "Insira um e-mail válido." }),
  data_admissao: z.string().min(1, { message: "A data é obrigatória." }),
  status: z.boolean(),
});

const cargos = [
  "Desenvolvedor Frontend",
  "Desenvolvedor Backend",
  "Designer UX/UI",
  "Gerente de Projetos",
  "Analista de QA",
] as const;

type FormValues = z.infer<typeof formSchema>;

interface ModalColaboradoresProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  colaboradorInicial: Collaborador | null
  aoSalvar: () => void
}

export function ModalColaboradores({
  open,
  onOpenChange,
  colaboradorInicial,
  aoSalvar,
}: ModalColaboradoresProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_colaborador: "",
      cargo: "",
      email: "",
      status: true,
    },
  });

  // Atualiza o formulário quando o colaborador selecionado mudar
  useEffect(() => {
    if (colaboradorInicial) {
      const dataFormatada = colaboradorInicial.data_admissao 
      ? new Date(colaboradorInicial.data_admissao).toISOString().split('T')[0]
      : "";

      form.reset({
        nome_colaborador: colaboradorInicial.nome_colaborador || "",
        cargo: colaboradorInicial.cargo || "",
        email: colaboradorInicial.email || "",
        data_admissao: dataFormatada,
        status: !!colaboradorInicial.status,
      });
    }
  }, [colaboradorInicial, form]);

  async function onSubmit(values: FormValues) {
    if (!colaboradorInicial?.colaborador_id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/colaboradores/${colaboradorInicial.colaborador_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar colaborador");
      }

      aoSalvar();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Colaborador</DialogTitle>
          <DialogDescription>
            Faça alterações no perfil do colaborador. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="nome_colaborador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome colaborador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cargos.map((cargo) => (
                          <SelectItem key={cargo} value={cargo}>
                            {cargo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="exemplo@chronotracker.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_admissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Admissão</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Colaborador Ativo</FormLabel>
                      <FormDescription>Status atual no sistema.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}