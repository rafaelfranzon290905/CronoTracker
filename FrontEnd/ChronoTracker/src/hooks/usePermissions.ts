import { useMemo } from "react";
// import { type Usuario } from "@/lib/types";
import { useState,useEffect } from "react";


export interface Usuario {
  usuario_id: number;
  colaborador_id: number; // 👈 Adicionado aqui
  nome_usuario: string;
  cargo: string;
  nome_completo: string;
}

export function usePermissions() {
    // 1. Obtém os dados do usuário do localStorage
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    return useMemo(() => {
        let userData: Usuario | null = null;
        let cargo = null;
        
        if (userJson) {
            try {
                userData = JSON.parse(userJson);
                cargo = userData?.cargo;
            } catch (e) {
                console.error("Erro ao fazer parse do usuário:", e);
            }
        }

        const isGerente = cargo?.toLowerCase() === 'gerente';
        
        return { 
            cargo, 
            isGerente,
            user: userData,
        };
    }, [userJson]);
}