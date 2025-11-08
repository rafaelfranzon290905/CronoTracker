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

interface ModalClienteProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    type: "add" | "edit" | null
}

export function ModalCliente({open, onOpenChange, type }: ModalClienteProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {type === "add" ? "Adicionar novo cliente" : "Editar cliente"}
                    </DialogTitle>
                </DialogHeader>

                <form className="space-y-4">
                    <div>
                        <label htmlFor="nome">Nome</label>
                        <Input id="nome" placeholder="Digite o nome da empresa" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input id="cidade" placeholder="Cidade" />
            </div>
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input id="estado" placeholder="Estado" />
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Input id="status" placeholder="Ativo / Inativo" />
          </div>
        </form>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            {type === "add" ? "Adicionar" : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
