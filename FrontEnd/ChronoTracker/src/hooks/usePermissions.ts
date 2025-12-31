// src/hooks/usePermissions.js (ou .ts)
import { type Usuario } from "@/lib/types";


export function usePermissions() {
    // 1. Obtém os dados do usuário do localStorage
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    
    let user: Usuario | null = null;
    let cargo = null;
    
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            cargo = user?.role || user?.cargo;
        } catch (e) {
            console.error("Erro ao fazer parse do usuário:", e);
        }
    }

    const isGerente = cargo?.toLowerCase() === 'gerente';
    
    return { 
        cargo, 
        isGerente,
        user,
        // Você pode adicionar outras checagens aqui: isColaborador: cargo === 'colaborador'
    };
}