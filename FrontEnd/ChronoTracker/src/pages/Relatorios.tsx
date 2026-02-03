import SideBar from "@/components/componentes/SideBar";
import Header from "@/components/componentes/Header";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/apiConfig";

export default function Relatorios() {
    const [filtros, setFiltros] = useState({ data_inicio: '', data_fim: '', colaborador_id: '' });
    const [dados, setDados] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(false);

    // Busca lista de colaboradores
    useEffect(() => {
        fetch(`${API_BASE_URL}/usuarios`)
            .then(res => res.json())
            .then(data => setColaboradores(data))
            .catch(err => console.error("Erro ao carregar colaboradores", err));
    }, []);

    const buscarDados = async () => {
        setLoading(true);
        console.log("Estado atual dos filtros no Front:", filtros);
        try {
            // Criamos um objeto apenas com o que tem valor preenchido
            const filtrosAtivos = {};
            if (filtros.data_inicio) filtrosAtivos.data_inicio = filtros.data_inicio;
            if (filtros.data_fim) filtrosAtivos.data_fim = filtros.data_fim;
            
            // Limpeza rigorosa do ID
            if (filtros.colaborador_id && filtros.colaborador_id !== "" && filtros.colaborador_id !== "undefined") {
                filtrosAtivos.colaborador_id = filtros.colaborador_id;
            }

            const params = new URLSearchParams(filtrosAtivos).toString();
            // Log para você ver no console do navegador se o ID está indo na URL
        console.log("Chamando URL:", `${API_BASE_URL}/relatorios?${params}&exportar=false`);
            const response = await fetch(`${API_BASE_URL}/relatorios?${params}&exportar=false`);

            if (!response.ok) throw new Error("Erro na resposta do servidor");
            
            const json = await response.json();
            setDados(json);
        } catch (error) {
            console.error("Erro ao buscar relatórios:", error);
            alert("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    const exportarCSV = () => {
    // Pegar apenas os filtros preenchidos igual na busca
    const filtrosAtivos = {};
    if (filtros.data_inicio) filtrosAtivos.data_inicio = filtros.data_inicio;
    if (filtros.data_fim) filtrosAtivos.data_fim = filtros.data_fim;
    if (filtros.colaborador_id) filtrosAtivos.colaborador_id = filtros.colaborador_id;

    const params = new URLSearchParams(filtrosAtivos).toString();
    window.open(`${API_BASE_URL}/relatorios?${params}&exportar=true`, '_blank');
};

    return (
        <div className="flex h-screen w-full">
            <SideBar />
            <div className="flex-1 p-6 overflow-auto">
                <Header />
                <main className="mt-4">
                    <PageHeader 
                        title="Relatórios" 
                        subtitle="Checagem e exportação de relatórios" 
                    />

                    {/* Barra de filtros */}
                    <div className="flex gap-4 mb-8 items-end bg-gray-50 p-4 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium">Início:</label>
                            <input type="date" className="border rounded p-1" onChange={e => setFiltros({...filtros, data_inicio: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fim:</label>
                            <input type="date" className="border rounded p-1" onChange={e => setFiltros({...filtros, data_fim: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Colaborador:</label>
                            <select className="border rounded p-1" value={filtros.colaborador_id} onChange={e => {
                                const valorSelecionado = e.target.value;
                                console.log("Selecionou colaborador ID:", valorSelecionado); // Debug imediato
                                setFiltros({...filtros, colaborador_id: valorSelecionado});
                            }}>
                                <option value="">Todos</option>
                                {colaboradores.map(c => {
                                    const idReal = c.colaborador_id;
                                    return (
                                        <option key={idReal} value={idReal}>{c.nome_completo}</option>
                                    );
                                })}
                            </select>
                        </div>
                        <button onClick={buscarDados} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            {loading ? 'Buscando...' : 'Filtrar'}
                        </button>
                        <button onClick={exportarCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                            Exportar Excel
                        </button>
                    </div>

                    {/* Tabela de resultados */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Colaborador</th>
                                    <th className="p-3">Atividade/Projeto</th>
                                    <th className="p-3">Horas</th>
                                    <th className="p-3">Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dados.length > 0 ? dados.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        {/* Ajuste os nomes das chaves (item.Data, item.Colaborador) conforme o seu Backend retornar */}
                                        <td className="p-3">{item.data_lancamento ? new Date(item.data_lancamento).toLocaleDateString() : "-"}</td>
                                        <td className="p-3">{item.colaboradores?.nome_colaborador || "N/A"}</td>
                                        <td className="p-3 text-sm font-semibold">{item.atividades?.nome_atividade || "Geral"}</td>
                                        <td className="p-3">{item.duracao_total?.toFixed(2)}h</td>
                                        <td className="p-3">{item.descricao}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-500">
                                            {loading ? "Carregando..." : "Nenhum dado encontrado para os filtros selecionados."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}