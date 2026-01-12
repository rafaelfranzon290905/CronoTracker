import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PlusCircle, Loader2 } from "lucide-react"

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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "../ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { API_BASE_URL } from  "@/apiConfig"

// URL da  API
// const API_BASE_URL = 'http://localhost:3001'

const formSchema = z.object({
  nome_colaborador: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  cargo: z.string().min(2, { message: "O cargo é obrigatório." }),
  email: z.string().email({ message: "Insira um e-mail válido." }),
  data_admissao: z.string().min(1, { message: "A data de entrada é obrigatória." }),
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

interface AddCollaboratorDialogProps {
  onSuccess?: () => void;
}

export function AddCollaboratorDialog({onSuccess}: AddCollaboratorDialogProps) {
  
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_colaborador: "",
      cargo: "",
      email: "",
      data_admissao: "",
      status: true,
    },
  });

  // Função de Envio para a API
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      console.log("Enviando dados:", values);

      const response = await fetch(`${API_BASE_URL}/colaboradores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           ...values,
           data_admissao: new Date(values.data_admissao).toISOString()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao cadastrar');
      }

      console.log("Sucesso!");
      
      form.reset();
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar colaborador." + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800 mx-3">
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Colaborador
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Colaborador</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para cadastrar um novo membro na equipe.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <Input type="date" placeholder="dd/mm/aaaa" {...field} />
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
                      <FormDescription>
                        Desative para colaboradores desligados.
                      </FormDescription>
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
        
        <DialogFooter>
            <Button 
              onClick={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
              className="bg-blue-950 rounded-2xl text-white hover:bg-blue-800"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Colaborador
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}