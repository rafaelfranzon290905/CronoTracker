// src/hooks/usePermissions.js (ou .ts)

export function usePermissions() {
    // 1. Obtém os dados do usuário do localStorage
    const userJson = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
    
    let cargo = null;
    
    if (userJson) {
        try {
            const user = JSON.parse(userJson);
            cargo = user.cargo;
        } catch (e) {
            console.error("Erro ao fazer parse do usuário:", e);
        }
    }

    // 2. Função de checagem
    const isGerente = cargo === 'gerente';
    
    return { 
        cargo, 
        isGerente,
        // Você pode adicionar outras checagens aqui: isColaborador: cargo === 'colaborador'
    };
}