'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { type Collaborador } from "@/lib/types"

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
  const [loading, setLoading] = useState(false)
  
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [cargo, setCargo] = useState("")
  const [status, setStatus] = useState("true") 

  useEffect(() => {
    if (colaboradorInicial) {
      setNome(colaboradorInicial.nome_colaborador || "")
      setEmail(colaboradorInicial.email || "")
      setCargo(colaboradorInicial.cargo || "")
      setStatus(colaboradorInicial.status ? "true" : "false")
    }
  }, [colaboradorInicial])

  // --- AÇÃO DE SALVAR (UPDATE) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!colaboradorInicial?.colaborador_id) {
      alert("Erro: ID do colaborador não encontrado.")
      return
    }

    setLoading(true)

    const dadosParaEnviar = {
      nome_colaborador: nome,
      email: email,
      cargo: cargo,
      status: status === "true", 
    }

    try {
      const response = await fetch(`http://localhost:3001/colaboradores/${colaboradorInicial.colaborador_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar colaborador")
      }

      alert("Colaborador atualizado com sucesso!")
      aoSalvar() 
      onOpenChange(false) 

    } catch (error) {
      console.error("Erro no update:", error)
      alert(error instanceof Error ? error.message : "Erro desconhecido ao salvar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Colaborador</DialogTitle>
          <DialogDescription>
            Faça alterações no perfil do colaborador aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            {/* Campo Nome */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* Campo Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* Campo Cargo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cargo" className="text-right">
                Cargo
              </Label>
              <Input
                id="cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                className="col-span-3"
                required
              />
            </div>

            {/* Campo Status */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Ativo</SelectItem>
                  <SelectItem value="false">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
          
       <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}