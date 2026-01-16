import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { type Usuario } from "@/lib/types";
import { toast } from "sonner";
import { API_BASE_URL } from  "@/apiConfig"

const passwordSchema = z.object({
  novaSenha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmarSenha: z.string()
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

interface PasswordResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Usuario | null;
  onSave: () => void;
}

export function PasswordResetModal({ open, onOpenChange, user, onSave }: PasswordResetModalProps) {
  const [formData, setFormData] = useState({ novaSenha: "", confirmarSenha: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFormData({ novaSenha: "", confirmarSenha: "" });
      setErrors({});
    }
  }, [open]);

  const handleReset = async () => {
    const result = passwordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${user?.usuario_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: formData.novaSenha }), 
      });

      if (!response.ok) throw new Error("Erro ao resetar senha");
      toast.success(`Senha de ${user?.nome_completo} alterada com sucesso!`);

    //   alert(`Senha de ${user?.nome_completo} alterada com sucesso!`);
      onOpenChange(false);
      onSave();
    } catch (error) {
    //   alert("Falha no servidor ao trocar senha.");
    toast.error("Falha no servidor ao trocar senha. Tente novamente.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Resetar Senha</DialogTitle>
          <DialogDescription>
            Defina uma nova senha de acesso para <b>{user?.nome_completo}</b>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Nova Senha</Label>
            <Input 
              type="password" 
              value={formData.novaSenha}
              onChange={e => setFormData({...formData, novaSenha: e.target.value})}
              className={errors.novaSenha ? "border-red-500" : ""}
            />
            {errors.novaSenha && <span className="text-[10px] text-red-500">{errors.novaSenha}</span>}
          </div>

          <div className="grid gap-2">
            <Label>Confirmar Nova Senha</Label>
            <Input 
              type="password" 
              value={formData.confirmarSenha}
              onChange={e => setFormData({...formData, confirmarSenha: e.target.value})}
              className={errors.confirmarSenha ? "border-red-500" : ""}
            />
            {errors.confirmarSenha && <span className="text-[10px] text-red-500">{errors.confirmarSenha}</span>}
          </div>
        </div>

        <Button onClick={handleReset} className="w-full bg-blue-700 hover:bg-blue-800">
          Confirmar Nova Senha
        </Button>
      </DialogContent>
    </Dialog>
  );
}