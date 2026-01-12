import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "../ui/button"
import { Switch } from "../ui/switch"
// import { Loader2 } from "lucide-react"
// import { useEffect } from "react"
import { toast } from "sonner"
import { API_BASE_URL } from  "@/apiConfig"


// const API_BASE_URL = 'http://localhost:3001'

// Definindo o tipo de dados do cliente para o estado do formulário
interface ClienteFormData {
    cnpj: string;
    nome_cliente: string;
    nome_contato: string;
    cep: string;
    endereco: string;
    cidade: string;
    estado: string;
    status: boolean; // O campo booleano
}

interface DialogClientesProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    aoSalvar: () => void;
}

const formatarCNPJ = (valor: string) => {
  const v = valor.replace(/\D/g, ""); // Remove tudo que não é dígito
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 18); // Limita ao tamanho do CNPJ formatado
};

const formatarCEP = (valor: string) => {
  const v = valor.replace(/\D/g, "");
  return v.replace(/(\d{5})(\d)/, "$1-$2").substring(0, 9);
};

export default function DialogClientes({ open, onOpenChange, aoSalvar }: DialogClientesProps) {
    // 1. ESTADO DO FORMULÁRIO: Inicializa com valores vazios e status TRUE por padrão (ativo)
    const [formData, setFormData] = useState<ClienteFormData>({
        cnpj: "",
        nome_cliente: "",
        nome_contato: "",
        cep: "",
        endereco: "",
        cidade: "",
        estado: "",
        status: true, 
    });

    const [errors, setErrors] = useState({
        cnpj: "",
        cep: "",
        estado: ""
    });

     // Função genérica para atualizar os inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let valorFormatado = value;
        if (name === "cnpj") valorFormatado = formatarCNPJ(value);
        if (name === "cep") valorFormatado = formatarCEP(value);
        if (name === "estado") valorFormatado = value.toUpperCase().slice(0, 2);
        setFormData(prev => ({ ...prev, [name]: valorFormatado }));
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    // Função específica para o campo 'status' (Switch)
    const handleStatusChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, status: checked }));
    };

    // 2. FUNÇÃO DE SUBMISSÃO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let temErro = false;
        const novosErros = { cnpj: "", cep: "", estado: "" };
       const cnpjLimpo = formData.cnpj.replace(/\D/g, ''); // Remove pontos e traços
       const cepLimpo = formData.cep.replace(/\D/g, '');
        
        if (cnpjLimpo.length !== 14) {
            novosErros.cnpj = "O CNPJ deve ter 14 dígitos.";
            temErro = true;
        }

        if (cepLimpo.length !== 8) {
            novosErros.cep = "O CEP deve ter 8 dígitos.";
            temErro = true;
        }

        if (formData.estado.trim().length !== 2) {
            novosErros.estado = "2 dígitos ex.(SP)";
            temErro = true;
        } 

        if (temErro) {
            setErrors(novosErros);
            return; // Interrompe o envio
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/clientes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                // Captura a mensagem de erro do servidor (ex: "CNPJ já cadastrado")
                const errorMessage = result.error || "Erro desconhecido ao cadastrar cliente.";
                throw new Error(errorMessage);
            }

            // Sucesso: Fecha o modal e limpa o formulário (ou faz o que for necessário, como recarregar a lista)
            // IMPORTANTE: Use um modal customizado de sucesso em vez de alert() em produção.
            console.log("Cliente cadastrado com sucesso!");
            toast.success("Cliente cadastrado com sucesso!", {
              description: `O cliente ${formData.nome_cliente} foi cadastrado com sucesso`
            });
            // Limpa o formulário e fecha
            setFormData(prev => ({ ...prev, 
                cnpj: "", nome_cliente: "", nome_contato: "", cep: "", 
                endereco: "", cidade: "", estado: "", status: true 
            }));

            aoSalvar();

            onOpenChange(false);

        } catch (error: any) {
            console.log(error);
            console.error('Erro ao enviar formulário:', error);
            // Mostra o erro de validação ou de servidor
        
        } finally {
            console.log("jdanjadnja")
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
                <Button className="bg-botao-dark">Adicionar Cliente</Button>
            </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Adicionar Cliente</DialogTitle>
                <DialogDescription>
                    Adicione os dados do cliente que deseja adicionar:
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    <div>
                        <Label htmlFor="empresa">Nome da empresa</Label>
                        <Input id="empresa" name="nome_cliente" value={formData.nome_cliente} onChange={handleChange} required/>
                    </div>
                    <div>
                        <Label htmlFor="contato">Nome do contato</Label>
                        <Input id="contato" name="nome_contato" value={formData.nome_contato} onChange={handleChange}/>
                    </div>
                    <div>
                        <Label htmlFor="cep-1">CEP</Label>
                        <Input id="cep-1" name="cep" value={formData.cep} onChange={handleChange} maxLength={9}/>
                        {errors.cep && <span className="text-sm font-medium text-red-500 mt-2">{errors.cep}</span>}
                    </div>
                    <div>
                        <Label htmlFor="endereco-1">Endereço</Label>
                        <Input id="endereco-1" name="endereco" value={formData.endereco} onChange={handleChange}/>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="cidade-1">Cidade</Label>
                            <Input id="cidade-1" name="cidade" className="w-100" value={formData.cidade} onChange={handleChange}/>
                            {errors.estado && <span className="text-sm font-medium text-red-500 mt-2">{errors.estado}</span>}
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="estado-1">Estado</Label>
                            <Input id="estado-1" name="estado" maxLength={2} value={formData.estado} onChange={handleChange}/>
                        </div>
                        
                    </div>
                    
                    <div>
                        <Label htmlFor="cnpj-1">CNPJ</Label>
                        <Input id="cnpj-1" name="cnpj" value={formData.cnpj} onChange={handleChange} required maxLength={18}/>
                        {errors.cnpj && <span className="text-sm font-medium text-red-500 mt-2">{errors.cnpj}</span>}
                    </div>
                    {/* Linha 7: Status (Switch/Alternador) */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Label htmlFor="status">Status</Label>
                            {/* O Switch recebe o estado booleano e o handler de mudança */}
                            <Switch 
                                id="status"
                                name="status"
                                checked={formData.status}
                                onCheckedChange={handleStatusChange}
                            />
                             <span className="text-sm font-medium">{formData.status ? 'Ativo' : 'Inativo'}</span>
                        </div>
                </div>
                {/* Botão de Submit */}
                    <div className="pt-4 flex justify-end">
                        <Button type="submit" className="bg-botao-dark">
                                Salvar
                        </Button>
                    </div>
            </form>
        </DialogContent>
        </Dialog>
    )
}