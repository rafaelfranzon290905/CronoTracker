import { useMemo } from "react";
// import { type Usuario } from "@/lib/types";
import { useState,useEffect } from "react";
import { type Usuario } from "@/lib/types";


export function usePermissions() {
    // 1. Obtém os dados do usuário do localStorage
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    return useMemo(() => {
        const userJson = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
        let userData: Usuario | null = null;
        let isGerente = false;
        
        if (userJson) {
            try {
                userData = JSON.parse(userJson);
                isGerente = userData?.cargo?.toLowerCase() === 'gerente';
            } catch (e) {
                console.error("Erro ao fazer parse do usuário:", e);
            }
        }
        
        return { 
            isGerente,
            isColaborador: userData?.cargo?.toLowerCase() === 'colaborador',
            user: userData,
        };
    }, []);
}