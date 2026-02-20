import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import LogoChronoTracker from "../imagens/ChronosAzulFundoRemovido.png"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from  "@/apiConfig"
import { Loader, Loader2 } from "lucide-react";


const LOGIN_API_URL = `${API_BASE_URL}/login`;



export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!username || !password) {
            setError("Por favor, preencha o nome de usuário e a senha.");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nome_usuario: username, senha: password }),
            });

            const result = await response.json();

            if (response.ok) {
                const { token, user } = result;
                
                // Armazena o token para uso futuro
                localStorage.setItem('authToken', token); 
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.usuario_id || user.usuario_id,
                    colaborador_id: user.colaborador_id,
                    username: user.nome_usuario,
                    cargo: user.cargo,
                    nomeCompleto: user.nome_completo
                }));

                fetch(`${API_BASE_URL}/logs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario_id: user.usuario_id,
                        evento: 'LOGIN'
                    }),
                }).catch(err => console.error("Erro ao registrar log de login:", err));
                
                // alert(`Login bem-sucedido! Bem-vindo(a), ${user.nome_usuario} (${user.cargo})`);
                
                navigate('/Dashboard');

            } else {
                setError(result.error || "Erro desconhecido ao fazer login.");
                setIsLoading(false);
            }

        } catch (err) {
            console.error("Erro de rede/servidor:", err);
            setError("Não foi possível conectar ao servidor de autenticação. Verifique se o backend está rodando.");
            setIsLoading(false);
        } finally {
            console.log("Foi");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-blue-200" style={{backgroundImage: 'linear-gradient(135deg, #e0f2fe 20%, #a5c3e8 70%)'}}>
            <Card className="w-full max-w-sm rounded-xl p-6 shadow-xl bg-white/90">
                <CardHeader className="flex flex-col items-center space-y-4">
                    <div className="flex items-center">
                        <img src={LogoChronoTracker} className="w-15"/>
                        <h1 className="text-3xl font-bold">ChronoTracker</h1>
                    </div>
                    <CardTitle className="text-xl text-center text-gray-700">
                        Faça login na sua conta
                    </CardTitle>  
                </CardHeader>
                <form className="space-y-2" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label htmlFor="username" className="text-md font-medium leading-none">Nome de usuário</label>
                        <Input
                        id="username"
                        type="text"
                        placeholder="Nome de usuário"
                        required
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if (error) setError(null);
                        }}
                            
                        className="h-10 border-gray-300 focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-4">
                        <label htmlFor="password" className="text-md font-medium leading-none">Senha</label>
                        <Input
                        id="password"
                        type="password"
                        placeholder="Senha"
                        required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError(null);
                        }}
                        className="h-10 border-gray-300 focus:border-blue-500"
                        />
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded shadow-sm">
                                <p className="text-sm text-red-600 font-medium">
                                    {error}
                                </p>
                            </div>
                        )}
                    </div>
                    <Button
                    type="submit"
                    disabled={isLoading}
                    className="my-0.5 w-full bg-botao-dark text-white hover:bg-botao-light">
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin"/>
                            </>
                        ) : (
                            "Entrar"
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    )
}