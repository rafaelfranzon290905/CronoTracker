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
import { API_BASE_URL } from  "@/apiConfig"


// const API_BASE_URL = 'http://localhost:3001'

// Definindo o tipo de dados do colaborador
interface ColaboradorFormData {
    nome_colaborador: string;
    cargo: string;
    email: string;
    data_admissao: string;
    status: boolean;
}

export default function DialogColaboradores() {
    // 1. ESTADO DO FORMULÁRIO
    const [formData, setFormData] = useState<ColaboradorFormData>({
        nome_colaborador: "",
        cargo: "",
        email: "",
        data_admissao: new Date().toISOString().split('T')[0], // Data de hoje como padrão
        status: true, 
    });

    // Estado separado para o arquivo de foto
    const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);
    const [isOpen, setIsOpen] = useState(false); // Controle manual do dialog para fechar após salvar

     // Função genérica para atualizar os inputs de texto/data
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Função específica para o campo 'status' (Switch)
    const handleStatusChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, status: checked }));
    };

    // Função específica para o input de arquivo
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFotoArquivo(e.target.files[0]);
        }
    };

    // 2. FUNÇÃO DE SUBMISSÃO
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            // Criação do FormData para permitir envio de arquivo (foto)
            const dataToSend = new FormData();
            dataToSend.append('nome_colaborador', formData.nome_colaborador);
            dataToSend.append('cargo', formData.cargo);
            dataToSend.append('email', formData.email);
            dataToSend.append('data_admissao', formData.data_admissao);
            dataToSend.append('status', String(formData.status)); // Backend deve tratar string 'true'/'false'
            
            if (fotoArquivo) {
                dataToSend.append('foto', fotoArquivo);
            }

            const response = await fetch(`${API_BASE_URL}/colaboradores`, {
                method: 'POST',
                // Não definimos 'Content-Type': 'application/json' aqui 
                // para que o browser defina o boundary do multipart/form-data automaticamente
                body: dataToSend,
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.error || "Erro desconhecido ao cadastrar colaborador.";
                throw new Error(errorMessage);
            }

            console.log("Colaborador cadastrado com sucesso!");
            
            // Limpa o formulário e fecha
            setFormData({ 
                nome_colaborador: "", 
                cargo: "", 
                email: "", 
                data_admissao: new Date().toISOString().split('T')[0], 
                status: true 
            });
            setFotoArquivo(null);
            setIsOpen(false); // Fecha o modal
            
            // Aqui você poderia chamar uma função de recarregar a lista (ex: aoSalvar())

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            alert(`Erro: ${error instanceof Error ? error.message : "Falha ao salvar"}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button variant="outline">Adicionar Colaborador</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Adicionar Colaborador</DialogTitle>
            <DialogDescription>
                Insira os dados do novo membro da equipe:
            </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                    {/* Nome */}
                    <div>
                        <Label htmlFor="nome_colaborador">Nome Completo</Label>
                        <Input 
                            id="nome_colaborador" 
                            name="nome_colaborador" 
                            value={formData.nome_colaborador} 
                            onChange={handleChange} 
                            required
                        />
                    </div>
                    
                    {/* Cargo e Email na mesma linha (opcional, igual ao style do cliente) */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <Label htmlFor="cargo">Cargo</Label>
                            <Input 
                                id="cargo" 
                                name="cargo" 
                                value={formData.cargo} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="email">E-mail</Label>
                            <Input 
                                id="email" 
                                name="email" 
                                type="email"
                                value={formData.email} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </div>

                    {/* Data de Admissão */}
                    <div>
                        <Label htmlFor="data_admissao">Data de Admissão</Label>
                        <Input 
                            id="data_admissao" 
                            name="data_admissao" 
                            type="date"
                            value={formData.data_admissao} 
                            onChange={handleChange} 
                        />
                    </div>

                    {/* Foto */}
                    <div>
                        <Label htmlFor="foto">Foto de Perfil</Label>
                        <Input 
                            id="foto" 
                            name="foto" 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                    </div>

                    {/* Status (Switch) */}
                    <div className="flex items-center space-x-2 pt-2">
                        <Label htmlFor="status">Status</Label>
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
                    <Button type="submit">
                        Salvar
                    </Button>
                </div>
            </form>
        </DialogContent>
        </Dialog>
    )
}