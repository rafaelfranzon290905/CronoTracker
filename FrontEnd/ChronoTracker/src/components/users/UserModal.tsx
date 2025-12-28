import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Usuario } from "@/lib/types";
import {
    DialogDescription
} from "@/components/ui/dialog";
import { z } from "zod";
import { toast } from "sonner";

const userSchema = z.object({
    nome_completo: z.string()
        .min(3, "O nome deve ter no mínimo 3 caracteres")
        .max(100, "O nome deve ter no máximo 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Apenas letras e espaços são permitidos"),

    nome_usuario: z.string()
        .min(4, "O usuário deve ter no mínimo 4 caracteres")
        .max(30, "O usuário deve ter no máximo 30 caracteres")
        .regex(/^[a-zA-Z0-9._]+$/, "Não use espaços ou caracteres especiais (exceto . e _)"),

    email: z.string()
        .email("Insira um e-mail válido")
        .min(1, "E-mail é obrigatório"),

    cargo: z.enum(["Gerente", "Colaborador"], {
        errorMap: () => ({ message: "Selecione um cargo válido" }),
    }),

    status: z.boolean(),

    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres").optional().or(z.literal('')),
});

interface UserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: Usuario | null;
    currentUser: any; // Usuário logado no sistema
    onSave: () => void;
}

export function UserModal({ open, onOpenChange, user, currentUser, onSave }: UserModalProps) {
    const [formData, setFormData] = useState<Partial<Usuario & { senha?: string }>>({});
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) setFormData(user);
        else setFormData({ status: true, cargo: 'Colaborador', nome_usuario: '', nome_completo: '', email: '', senha: '' });
        setFieldErrors({});
    }, [user, open]);


    const handleSave = async () => {
        const result = userSchema.safeParse(formData);
        if (!result.success) {
            const errors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                errors[issue.path[0]] = issue.message;
            });

            if (!user && (!formData.senha || formData.senha.length < 6)) {
                errors.senha = "Senha é obrigatória na criação (mín. 6 caracteres)";
            }

            setFieldErrors(errors);
            return;
        }
        setFieldErrors({});
        const isEditing = !!user;
        const url = isEditing
            ? `http://localhost:3001/usuarios/${user.usuario_id}`
            : `http://localhost:3001/usuarios`;

        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erro ao salvar usuário');
            }

            console.log("Sucesso ao salvar!");
            toast.success(user ? "Usuário atualizado com sucesso!" : "Novo usuário cadastrado!");

            onSave();
            onOpenChange(false);

        } catch (error) {
            console.error("Erro no fetch:", error);
            // alert(error instanceof Error ? error.message : "Falha na conexão com o servidor");
            toast.error(error instanceof Error ? error.message : "Falha na conexão com o servidor");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para gerenciar as permissões de acesso.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <Label>Nome Completo</Label>
                        <Input
                            value={formData.nome_completo || ""}
                            onChange={e => setFormData({ ...formData, nome_completo: e.target.value })}
                        />
                        {fieldErrors.nome_completo && (
                            <span className="text-[10px] text-red-500 font-medium">{fieldErrors.nome_completo}</span>
                        )}
                    </div>
                    <div>
                        <Label>E-mail</Label>
                        <Input type="email" value={formData.email || ""} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        {fieldErrors.email && (
                            <span className="text-[10px] text-red-500 font-medium">{fieldErrors.email}</span>
                        )}
                    </div>
                    {!user && (
                        <div>
                            <Label>Senha Inicial</Label>
                            <Input
                                type="password"
                                onChange={e => setFormData({ ...formData, senha: e.target.value })}
                                required
                            />
                            {fieldErrors.senha && (
                                <span className="text-[10px] text-red-500 font-medium">{fieldErrors.senha}</span>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Usuário</Label>
                            <Input
                                value={formData.nome_usuario || ""}
                                onChange={e => setFormData({ ...formData, nome_usuario: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label>Cargo / Perfil</Label>
                            <Select
                                disabled={!!user && user.usuario_id === currentUser?.usuario_id}
                                value={formData.cargo || "Colaborador"}
                                onValueChange={(v: any) => setFormData({ ...formData, cargo: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Gerente">Gerente</SelectItem>
                                    <SelectItem value="Colaborador">Colaborador</SelectItem>
                                </SelectContent>
                            </Select>
                            {user && user.usuario_id === currentUser?.usuario_id && (
                                <p className="text-[10px] text-orange-600 mt-1">
                                    Você não pode alterar seu próprio nível de acesso.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <Button onClick={handleSave} className="w-full">Salvar Alterações</Button>
            </DialogContent>
        </Dialog>
    );
}