'use client'
import { useEffect, useState } from "react";
import SideBar from "@/components/componentes/SideBar";
import Header from "@/components/componentes/Header";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { DataTable } from "@/components/collaborators/data-table";
import { type Usuario } from "@/lib/types";
import { usePermissions } from "@/hooks/usePermissions";
import { columns } from "@/components/users/columns";
import { UserModal } from "@/components/users/UserModal";
import { Button } from "@/components/ui/button";
import { PasswordResetModal } from "@/components/users/PasswordResetModal";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersPage() {
    const [data, setData] = useState<Usuario[]>([]);
    const { isGerente, user: userLogado } = usePermissions() as {
        isGerente: boolean;
        user: Usuario | null;
        cargo: string | null
    };
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const [userToInactivate, setUserToInactivate] = useState<Usuario | null>(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3001/usuarios');

            if (!response.ok) {
                console.error("Servidor respondeu com erro:", response.status);
                setData([]);
                return;
            }

            const result = await response.json();
            const filteredData = isGerente ? result : result.filter((u: any) => u.status === true);
            setData(filteredData);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            setData([]);
        }
    };

    useEffect(() => { fetchData(); }, [isGerente]);


    // const handleInativar = async (user: Usuario) => {
    //     if (user.usuario_id === userLogado?.usuario_id) {
    //         alert("Operação negada: Você não pode inativar seu próprio usuário.");
    //         return;
    //     }

    //     // Confirmação com o usuário
    //     const confirmacao = confirm(`Deseja realmente inativar o acesso de ${user.nome_completo}?`);

    //     if (confirmacao) {
    //         try {
    //             const response = await fetch(`http://localhost:3001/usuarios/${user.usuario_id}`, {
    //                 method: 'DELETE', 
    //             });

    //             if (!response.ok) {
    //                 throw new Error("Falha ao inativar usuário no servidor.");
    //             }
    //             fetchData();
    //             alert("Usuário inativado com sucesso!");

    //         } catch (error) {
    //             console.error("Erro ao inativar:", error);
    //             alert("Erro ao processar inativação.");
    //         }
    //     }
    // };

    const handleInativarTrigger = (user: Usuario) => {
        if (user.usuario_id === userLogado?.usuario_id) {
            toast.error("Operação negada: Você não pode inativar seu próprio usuário.");
            return;
        }
        setUserToInactivate(user);
        setIsConfirmDialogOpen(true);
    };

    const confirmInactivation = async () => {
        if (!userToInactivate) return;

        try {
            const response = await fetch(`http://localhost:3001/usuarios/${userToInactivate.usuario_id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error("Erro no servidor");

            toast.success(`Usuário ${userToInactivate.nome_completo} inativado com sucesso!`);
            fetchData();
        } catch (error) {
            toast.error("Erro ao processar inativação. Tente novamente.");
        } finally {
            setIsConfirmDialogOpen(false);
            setUserToInactivate(null);
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <SideBar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    <PageHeader title="Gestão de Usuários" subtitle="Controle de acessos e permissões do sistema.">
                        {isGerente && <Button onClick={() => { setEditingUser(null); setIsModalOpen(true) }}>Novo Usuário</Button>}
                    </PageHeader>

                    <DataTable
                        columns={columns(
                            isGerente,
                            (u) => { setEditingUser(u); setIsModalOpen(true); },
                            handleInativarTrigger,
                            (u) => { setEditingUser(u); setIsPasswordModalOpen(true); }
                        )}
                        data={data}
                        filterColumn="nome_completo"
                    />
                </main>
            </div>
            <UserModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                user={editingUser}
                currentUser={userLogado}
                onSave={fetchData}
            />
            <PasswordResetModal
                open={isPasswordModalOpen}
                onOpenChange={setIsPasswordModalOpen}
                user={editingUser}
                onSave={fetchData}
            />
            <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Inativação</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você tem certeza que deseja inativar <b>{userToInactivate?.nome_completo}</b>?
                            O acesso ao sistema será interrompido imediatamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmInactivation}
                            className="bg-destructive text-destructive-foreground text-white hover:bg-destructive/90"
                        >
                            Inativar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}