import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { Switch } from "../ui/switch"

interface ModalColaboradorProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    colaboradorInicial: Colaborador | null;
    aoSalvar: () => void;
}

interface Colaborador {
    colaborador_id: number;
    nome_colaborador: string;
    cargo: string;
    email: string;
    data_admissao: string | Date | null; // Pode vir como string do JSON ou Date
    status: boolean;
    // O campo 'foto' não precisa estar na interface de leitura inicial, pois tratamos o upload separado
}

const API_BASE_URL = 'http://localhost:3001'

export function ModalColaboradores({open, onOpenChange, colaboradorInicial, aoSalvar}: ModalColaboradorProps) {

  const [formData, setFormData] = useState<Colaborador | null>(colaboradorInicial);
  const [fotoArquivo, setFotoArquivo] = useState<File | null>(null);

  useEffect(() => {
    setFormData(colaboradorInicial);
    setFotoArquivo(null); // Reseta o arquivo ao abrir um novo colaborador
  }, [colaboradorInicial, open]);

  if (!colaboradorInicial) {
    return null;
  }

  const isReady = formData !== null;

  // Função auxiliar para formatar a data para o input HTML (yyyy-MM-dd)
  const formatDateForInput = (dateValue: string | Date | null) => {
    if (!dateValue) return '';
    const date = new Date(dateValue);
    return date.toISOString().split('T')[0];
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const {id, value} = e.target;
    
    setFormData(prev => ({
      ...(prev as Colaborador),
      [id]: value,
    }));
  };

  // Handler específico para o arquivo de foto
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoArquivo(e.target.files[0]);
    }
  };

  // Handler específico para o Switch de status
  const handleStatusChange = (checked: boolean) => {
      setFormData(prev => ({ ...prev!, status: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    const idDoColaborador = formData.colaborador_id; 
    console.log("ID do Colaborador sendo enviado:", idDoColaborador);

    const url = `${API_BASE_URL}/colaboradores/${idDoColaborador}`;
    
    // Preparação para envio com FormData (necessário para upload de arquivos/Bytes)
    const dataToSend = new FormData();
    dataToSend.append('nome_colaborador', formData.nome_colaborador);
    dataToSend.append('cargo', formData.cargo);
    dataToSend.append('email', formData.email);
    
    if (formData.data_admissao) {
        dataToSend.append('data_admissao', new Date(formData.data_admissao).toISOString());
    }
    
    dataToSend.append('status', String(formData.status)); // FormData envia tudo como string

    // Se houver uma nova foto selecionada, anexa. Se não, o backend deve ignorar ou manter a antiga.
    if (fotoArquivo) {
        dataToSend.append('foto', fotoArquivo);
    }
        
    try {
        const response = await fetch(url, {
            method: 'PUT',
            // Não defina 'Content-Type': 'application/json' aqui. 
            // O navegador define automaticamente o boundary do multipart/form-data
            body: dataToSend,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Erro de atualização desconhecido' }));
            throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
        }

        alert(`Colaborador ID ${formData.colaborador_id} atualizado com sucesso!`);
        
        aoSalvar(); // Recarrega a lista
        onOpenChange(false); // Fecha o modal

    } catch (error) {
        console.error(`Erro ao editar colaborador:`, error);
        alert(`Falha na atualização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Editar Colaborador: {colaboradorInicial.nome_colaborador}
          </DialogTitle>
        </DialogHeader>
        
        {isReady && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Nome */}
            <div>
                <Label htmlFor="nome_colaborador">Nome Completo</Label>
                <Input 
                    id="nome_colaborador" 
                    placeholder="Nome do colaborador" 
                    value={formData.nome_colaborador} 
                    onChange={handleChange} 
                    required
                />
            </div>

            {/* Grid para Cargo e Email */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="cargo">Cargo</Label>
                    <Input 
                        id="cargo" 
                        value={formData.cargo} 
                        onChange={handleChange} 
                        required
                    />
                </div>
                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
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
                    type="date"
                    value={formatDateForInput(formData.data_admissao)} 
                    onChange={handleChange}
                />
            </div>

            {/* Upload de Foto */}
            <div>
                <Label htmlFor="foto">Atualizar Foto (Opcional)</Label>
                <Input 
                    id="foto" 
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
                    checked={formData.status}
                    onCheckedChange={handleStatusChange}
                />
                <span className="text-sm font-medium">
                    {formData.status ? 'Ativo' : 'Inativo'}
                </span>
            </div>

            <DialogFooter className="mt-4">
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                    Cancelar
                </Button>
                <Button type="submit">
                    Salvar alterações
                </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}