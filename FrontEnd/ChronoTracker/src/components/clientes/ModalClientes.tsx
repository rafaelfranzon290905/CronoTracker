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

interface ModalClienteProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    clienteInicial: Cliente | null;
    aoSalvar: () => void;
}

interface Cliente {
    cliente_id: number;
    cnpj: string;
    nome_cliente: string;
    nome_contato: string;
    cep: string;
    endereco: string;
    cidade: string;
    estado: string;
    status: boolean;
}



const API_BASE_URL = 'http://localhost:3001'



export function ModalCliente({open, onOpenChange, clienteInicial, aoSalvar}: ModalClienteProps) {

  const [formData, setFormData] = useState<Cliente | null>(clienteInicial);

  useEffect(() => {
    setFormData(clienteInicial);
  }, [clienteInicial, open]);

  if (!clienteInicial) {
    return null;
  }

  const isReady = formData !== null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const {id, value, type, checked} = e.target;
    setFormData(prev => ({
      ...(prev as Cliente),
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // Função específica para o campo 'status' (Switch)
    const handleStatusChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, status: checked }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData) return;

    // Use o ID de forma limpa
    const idDoCliente = formData.cliente_id; 
    
    // Verifique o console para garantir que o ID está correto antes do fetch
    console.log("ID do Cliente sendo enviado:", idDoCliente);

    // Rota e métodos fixos para edição PUT
    const url = `${API_BASE_URL}/clientes/${idDoCliente}`;
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Erro de atualização desconhecido' }));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            alert(`Cliente ID ${formData.cliente_id} atualizado com sucesso!`);
            
            aoSalvar(); // Recarrega a lista
            onOpenChange(false); // Fecha o modal

        } catch (error) {
            console.error(`Erro ao editar cliente:`, error);
            alert(`Falha na atualização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Editar cliente: {clienteInicial.nome_cliente}
                    </DialogTitle>
                </DialogHeader>
                {isReady && (
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="nome_cliente">Nome da empresa</label>
                        <Input id="nome_cliente" placeholder="Digite o nome da empresa" value={formData.nome_cliente} onChange={handleChange} required/>
                    </div>
                    <div>
                        <Label htmlFor="nome_contato">Nome do contato</Label>
                        <Input id="nome_contato" name="nome_contato" value={formData.nome_contato} onChange={handleChange}/>
                    </div>
                     <div>
                        <Label htmlFor="cep">CEP</Label>
                        <Input id="cep" name="cep" value={formData.cep} onChange={handleChange}/>
                    </div>
                    <div>
                        <label htmlFor="endereco">Endereço</label>
                        <Input id="endereco" placeholder="Digite o endereço" value={formData.endereco} onChange={handleChange}/>
                    </div>
                   
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" placeholder="Cidade" value={formData.cidade} onChange={handleChange}/>
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" placeholder="Estado (ex: RS)" value={formData.estado} onChange={handleChange}/>
            </div>
      
          </div>
          <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" placeholder="0000000" value={formData.cnpj} onChange={handleChange} required/>
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
                        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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