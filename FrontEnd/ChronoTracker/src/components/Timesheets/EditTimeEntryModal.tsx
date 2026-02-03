import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function EditTimeEntryModal({ open, onOpenChange, entry, onSave }: any) {
  const [motivo, setMotivo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Resetar o motivo ao abrir/fechar
  useEffect(() => { if (!open) setMotivo(""); }, [open]);

  const handleSave = async () => {
    if (motivo.length < 5) {
      return toast.warning("Por favor, descreva o motivo da alteração com mais detalhes.");
    }

    setIsSaving(true);
    try {
      // Aqui você faz o PUT para sua API enviando os dados e o motivo
      // const res = await fetch(...)
      await onSave(entry.lancamento_id, { ...entry, motivo_edicao: motivo });
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Lançamento de Horas</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-3 rounded text-sm text-muted-foreground">
            Editando atividade: <strong>{entry?.atividades?.nome_atividade}</strong>
          </div>
          <div className="space-y-2">
            <Label>Justificativa da Alteração (Obrigatório)</Label>
            <Textarea 
              placeholder="Explique o que foi alterado e o porquê..." 
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Confirmar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}