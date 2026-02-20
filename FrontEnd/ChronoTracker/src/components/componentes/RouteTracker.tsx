import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from "@/apiConfig";

export default function RouteTracker() {
  const location = useLocation();

  // Local: components/componentes/RouteTracker.tsx
useEffect(() => {
  const storedUser = localStorage.getItem('currentUser');
  if (!storedUser) return;

  try {
    const user = JSON.parse(storedUser);
    const userId = user.usuario_id || user.id;

    if (userId && !isNaN(parseInt(userId))) {
      fetch(`${API_BASE_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: Number(userId), 
          evento: 'NAVEGACAO',
          tela_acessada: location.pathname
        }),
      }).catch(err => console.error("Erro no fetch do log:", err));
    } else {
      console.warn("RouteTracker: usuario_id não encontrado no objeto do localStorage", user);
    }
  } catch (e) {
    console.error("Erro ao ler localStorage no RouteTracker", e);
  }
}, [location]);

  return null;
}