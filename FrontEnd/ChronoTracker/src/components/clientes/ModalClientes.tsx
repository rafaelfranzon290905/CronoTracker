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
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { API_BASE_URL } from "@/apiConfig"

interface ModalClienteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteInicial: Cliente | null
  aoSalvar: () => void
  type?: "add" | "edit" | null 
}

interface Cliente {
  cliente_id: number
  cnpj: string
  nome_cliente: string
  nome_contato: string
  cep: string
  endereco: string
  cidade: string
  estado: string
  status: boolean
}

interface FormErrors {
  cnpj: string
  cep: string
  estado: string
}

const clienteVazio: Cliente = {
  cliente_id: 0,
  cnpj: "",
  nome_cliente: "",
  nome_contato: "",
  cep: "",
  endereco: "",
  cidade: "",
  estado: "",
  status: true,
}

/* FORMATADORES */
const formatarCNPJ = (valor: string) => {
  const v = valor.replace(/\D/g, "")
  return v
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .substring(0, 18)
}

const formatarCEP = (valor: string) => {
  const v = valor.replace(/\D/g, "")
  return v.replace(/(\d{5})(\d)/, "$1-$2").substring(0, 9)
}

export function ModalCliente({
  open,
  onOpenChange,
  clienteInicial,
  aoSalvar,
}: ModalClienteProps) {
  const [formData, setFormData] = useState<Cliente>(clienteVazio)
  
  const [errors, setErrors] = useState<FormErrors>({
    cnpj: "",
    cep: "",
    estado: "",
  })

  useEffect(() => {
    if (open) {
      
      setFormData(clienteInicial || clienteVazio)
      setErrors({ cnpj: "", cep: "", estado: "" })
    }
  }, [open, clienteInicial])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    let valorFormatado = value
    if (id === "cnpj") valorFormatado = formatarCNPJ(value)
    if (id === "cep") valorFormatado = formatarCEP(value)
    if (id === "estado") valorFormatado = value.toUpperCase().slice(0, 2)

    setFormData(prev => ({
      ...prev,
      [id]: valorFormatado,
    }))

    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [id]: "" }))
    }
  }

  const handleStatusChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, status: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setErrors({ cnpj: "", cep: "", estado: "" })

    const cnpjLimpo = formData.cnpj.replace(/\D/g, "")
    const cepLimpo = formData.cep.replace(/\D/g, "")

    if (cnpjLimpo.length !== 14) {
      setErrors(prev => ({ ...prev, cnpj: "O CNPJ deve ter 14 dígitos." }))
      return
    }
    if (cepLimpo.length !== 8) {
      setErrors(prev => ({ ...prev, cep: "O CEP deve ter 8 dígitos." }))
      return
    }
    if (formData.estado.trim().length !== 2) {
      setErrors(prev => ({ ...prev, estado: "Use 2 letras (ex: SP)." }))
      return
    }

    const payload = {
      ...formData,
      cnpj: cnpjLimpo,
      cep: cepLimpo,
      estado: formData.estado.toUpperCase(),
    }

    const isEdit = formData.cliente_id !== 0
    const url = isEdit
      ? `${API_BASE_URL}/clientes/${formData.cliente_id}`
      : `${API_BASE_URL}/clientes`

    const method = isEdit ? "PUT" : "POST"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (response.status === 409 || (data.message && data.message.toLowerCase().includes("cnpj"))) {
          const msg = data.message || "CNPJ já existente."
          setErrors(prev => ({ ...prev, cnpj: msg }))
          toast.error("CNPJ duplicado", { description: msg })
          return
        }

        toast.error("Erro ao salvar", { description: data.message || "Erro inesperado." })
        return
      }

      toast.success(isEdit ? "Cliente atualizado!" : "Cliente cadastrado!")
      aoSalvar()
      onOpenChange(false)

    } catch (err) {
      console.error("Erro inesperado:", err)
      toast.error("Erro no servidor")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {/* Título dinâmico */}
            {formData.cliente_id ? `Editar cliente: ${formData.nome_cliente}` : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="nome_cliente">Nome da empresa</Label>
            <Input id="nome_cliente" value={formData.nome_cliente} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="nome_contato">Nome do contato</Label>
            <Input id="nome_contato" value={formData.nome_contato} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" value={formData.cep} onChange={handleChange} maxLength={9} />
            {errors.cep && <span className="text-red-500 text-xs">{errors.cep}</span>}
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" value={formData.endereco} onChange={handleChange} />
          </div>

          <div className="flex gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" value={formData.cidade} onChange={handleChange} />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" value={formData.estado} onChange={handleChange} maxLength={2} />
              {errors.estado && <span className="text-red-500 text-xs">{errors.estado}</span>}
            </div>
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" value={formData.cnpj} onChange={handleChange} maxLength={18} />
            {errors.cnpj && <span className="text-red-500 text-xs font-bold">{errors.cnpj}</span>}
          </div>

          <div className="flex items-center gap-2">
            <Label>Status</Label>
            <Switch checked={formData.status} onCheckedChange={handleStatusChange} />
            <span>{formData.status ? "Ativo" : "Inativo"}</span>
          </div>

          <DialogFooter>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}