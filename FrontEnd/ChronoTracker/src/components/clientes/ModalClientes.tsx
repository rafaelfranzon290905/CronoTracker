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
import { toast } from "sonner"
import { API_BASE_URL } from "@/apiConfig"

interface ModalClienteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clienteInicial: Cliente | null
  aoSalvar: () => void
  type: "add" | "edit" | null
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
  const [formData, setFormData] = useState<Cliente | null>(clienteInicial)

  const [errors, setErrors] = useState<FormErrors>({
    cnpj: "",
    cep: "",
    estado: "",
  })

  useEffect(() => {
    setFormData(clienteInicial)
    setErrors({ cnpj: "", cep: "", estado: "" })
  }, [clienteInicial, open])

  if (!formData) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target

    let valorFormatado = value
    if (id === "cnpj") valorFormatado = formatarCNPJ(value)
    if (id === "cep") valorFormatado = formatarCEP(value)
    if (id === "estado") valorFormatado = value.toUpperCase().slice(0, 2)

    setFormData(prev => ({
      ...(prev as Cliente),
      [id]: valorFormatado,
    }))

    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [id]: "" }))
    }
  }

  const handleStatusChange = (checked: boolean) => {
    setFormData(prev => ({ ...(prev as Cliente), status: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!formData) return

  let temErro = false
  const novosErros = { cnpj: "", cep: "", estado: "" }

  const cnpjLimpo = formData.cnpj.replace(/\D/g, "")
  const cepLimpo = formData.cep.replace(/\D/g, "")
  const estadoLimpo = formData.estado.trim()

  if (cnpjLimpo.length !== 14) {
    novosErros.cnpj = "O CNPJ deve ter 14 dígitos."
    temErro = true
  }

  if (cepLimpo.length !== 8) {
    novosErros.cep = "O CEP deve ter 8 dígitos."
    temErro = true
  }

  if (estadoLimpo.length !== 2) {
    novosErros.estado = "Use 2 letras (ex: SP)."
    temErro = true
  }

  if (temErro) {
    setErrors(novosErros)
    return
  }

  //PAYLOAD DEFINIDO AQUI (NÃO REMOVER)
  const payload = {
    ...formData,
    cnpj: cnpjLimpo,
    cep: cepLimpo,
    estado: estadoLimpo,
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/clientes/${formData.cliente_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      if (response.status === 409) {
        setErrors(prev => ({
          ...prev,
          cnpj: "CNPJ já existente.",
        }))

        toast.error("CNPJ duplicado", {
          description: "Já existe um cliente cadastrado com este CNPJ.",
        })

        return
      }

      throw new Error(data?.error || "Erro ao salvar")
    }

    toast.success("Cliente atualizado com sucesso")
    aoSalvar()
    onOpenChange(false)

  } catch (error) {
    toast.error("Erro inesperado", {
      description:
        error instanceof Error ? error.message : "Erro ao salvar cliente",
    })
  }
}

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Editar cliente: {clienteInicial?.nome_cliente}
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="nome_cliente">Nome da empresa</Label>
            <Input id="nome_cliente" value={formData.nome_cliente} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="nome_contato">Nome do contato</Label>
            <Input id="nome_contato" value={formData.nome_contato} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input id="cep" value={formData.cep} onChange={handleChange} />
            {errors.cep && <span className="text-red-500 text-sm">{errors.cep}</span>}
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
              <Input id="estado" value={formData.estado} onChange={handleChange} />
              {errors.estado && <span className="text-red-500 text-sm">{errors.estado}</span>}
            </div>
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" value={formData.cnpj} onChange={handleChange} />
            {errors.cnpj && <span className="text-red-500 text-sm">{errors.cnpj}</span>}
          </div>

          <div className="flex items-center gap-2">
            <Label>Status</Label>
            <Switch checked={formData.status} onCheckedChange={handleStatusChange} />
            <span>{formData.status ? "Ativo" : "Inativo"}</span>
          </div>

          <DialogFooter>
            <Button type="submit">Salvar alterações</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
