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
import { Loader2 } from "lucide-react"
import { useEffect } from "react"

const API_BASE_URL = 'http://localhost:3001'

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
    aoSalvar: () => void;
}

export default function DialogClientes({aoSalvar}: DialogClientesProps) {
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
    const [open, setOpen] = useState(false);
    // 🎯 NOVO ESTADO: Para armazenar erros de validação
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false); // Para controle de loading

    // Função de validação
    const validateForm = (data: ClienteFormData) => {
        const errors: { [key: string]: string } = {};

        // 1. Validação do CNPJ (14 dígitos e apenas números)
        const cleanCnpj = data.cnpj.replace(/[^\d]/g, ''); // Remove formatação (pontos, traços)
        if (cleanCnpj.length !== 14) {
            errors.cnpj = "CNPJ deve conter 14 dígitos.";
        }
        
        // 2. Validação do CEP (8 dígitos e apenas números)
        const cleanCep = data.cep.replace(/[^\d]/g, ''); // Remove formatação (traço)
        if (cleanCep.length !== 8) {
            errors.cep = "CEP deve conter 8 dígitos.";
        }

        setValidationErrors(errors);
        
        // Retorna TRUE se não houver erros
        return Object.keys(errors).length === 0;
    };
     // Função genérica para atualizar os inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Função específica para o campo 'status' (Switch)
    const handleStatusChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, status: checked }));
    };

    // 🎯 NOVO: Função para aplicar a máscara de CEP (XXXXX-XXX)
    const maskCep = (value: string) => {
        // 1. Remove tudo que não for dígito
        const cleaned = value.replace(/\D/g, '');
        // 2. Aplica a máscara (5 dígitos e depois o hífen)
        return cleaned
            .slice(0, 8) // Limita a 8 dígitos
            .replace(/^(\d{5})(\d)/, '$1-$2'); // Coloca o hífen após o 5º dígito
    };

    // 🎯 NOVO: Função para aplicar a máscara de CNPJ (XX.XXX.XXX/XXXX-XX)
    const maskCnpj = (value: string) => {
        // 1. Remove tudo que não for dígito
        const cleaned = value.replace(/\D/g, '');
        // 2. Aplica a máscara e limita a 14 dígitos
        return cleaned
            .slice(0, 14) // Limita a 14 dígitos
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2'); // Coloca o hífen após os 4 dígitos do final
    };

    // 🎯 NOVO: Handler específico para CNPJ
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const maskedValue = maskCnpj(e.target.value);
        setFormData(prev => ({ ...prev, cnpj: maskedValue }));
    };

    // 🎯 NOVO: Handler específico para CEP
    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const maskedValue = maskCep(rawValue);
        
        // Atualiza o estado do formulário imediatamente com a máscara (para visualização)
        setFormData(prev => ({ ...prev, cep: maskedValue }));
        
        // 1. Limpa o CEP para validação
        const cleanCep = rawValue.replace(/\D/g, '');

        // 2. Verifica se atingiu 8 dígitos para buscar
        if (cleanCep.length === 8) {
            try {
                // Desabilitar o campo temporariamente ou mostrar loading aqui seria ideal
                
                // 3. Chama a API ViaCEP
                const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
                const data = await response.json();

                // 4. Verifica se o CEP é válido e preenche os campos
                if (!data.erro) {
                    setFormData(prev => ({ 
                        ...prev, 
                        endereco: data.logradouro,
                        cidade: data.localidade,
                        estado: data.uf,
                        // Bairro (se você tiver esse campo)
                        // bairro: data.bairro || prev.bairro, 
                    }));
                } else {
                    // Se a API retornar erro (CEP não encontrado)
                    console.log("CEP não encontrado pela API.");
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    

    // 2. FUNÇÃO DE SUBMISSÃO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm(formData)) {
            // Se houver erros, a função para aqui e as mensagens de erro serão exibidas
            alert("Por favor, corrija os erros de validação antes de salvar."); // Alerta geral
            return; 
        }

        // Bloqueia o botão e inicia o envio
        setIsSubmitting(true);

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
            
            // Limpa o formulário e fecha
            setFormData(prev => ({ ...prev, 
                cnpj: "", nome_cliente: "", nome_contato: "", cep: "", 
                endereco: "", cidade: "", estado: "", status: true 
            }));
            // Chama a função para recarregar dados
            aoSalvar();

            // Fecha o modal
            setOpen(false);
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            // Mostra o erro de validação ou de servidor
        
        } finally {
            console.log("jdanjadnja")
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>Adicionar Cliente</DialogTrigger>
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
                        <Input id="cep-1" name="cep" value={formData.cep} onChange={handleCepChange}/>
                        {validationErrors.cep && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.cep}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="endereco-1">Endereço</Label>
                        <Input id="endereco-1" name="endereco" value={formData.endereco} onChange={handleChange}/>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="cidade-1">Cidade</Label>
                            <Input id="cidade-1" name="cidade" className="w-100" value={formData.cidade} onChange={handleChange}/>
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="estado-1">Estado</Label>
                            <Input id="estado-1" name="estado" maxLength={2} value={formData.estado} onChange={handleChange}/>
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="cnpj-1">CNPJ</Label>
                        <Input id="cnpj-1" name="cnpj" value={formData.cnpj} onChange={handleCnpjChange} required/>
                        {validationErrors.cnpj && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.cnpj}</p>
                        )}
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