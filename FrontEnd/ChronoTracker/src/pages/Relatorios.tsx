import SideBar from "@/components/componentes/SideBar";
import Header from "@/components/componentes/Header";
import { PageHeader } from "@/components/componentes/TituloPagina";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/apiConfig";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ChevronDown } from "lucide-react";
import { Search, FileSpreadsheet } from "lucide-react";

export default function Relatorios() {
    const [filtros, setFiltros] = useState({ data_inicio: '', data_fim: '', colaborador_id: '', projeto_id: '', atividade_id: '' });
    const [dados, setDados] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [projetos, setProjetos] = useState([]);
    const [atividades, setAtividades] = useState([]);
    const [tipoRelatorio ,setTipoRelatorio] = useState('produtividade');

    // Busca lista de colaboradores
    useEffect(() => {
        fetch(`${API_BASE_URL}/usuarios`)
            .then(res => res.json())
            .then(data => setColaboradores(data))
            .catch(err => console.error("Erro ao carregar colaboradores", err));
        fetch(`${API_BASE_URL}/projetos`)
            .then(res => res.json())
            .then(data => setProjetos(data));
        fetch(`${API_BASE_URL}/atividades`) // Certifique-se que esta rota existe para listar os tipos de atividades
        .then(res => res.json())
        .then(data => setAtividades(data))
        .catch(err => console.error("Erro ao carregar atividades", err));
    }, []);

    const buscarDados = async () => {
        setLoading(true);
        console.log("Estado atual dos filtros no Front:", filtros);
        try {
            // Criamos um objeto apenas com o que tem valor preenchido
            const filtrosAtivos = {};
            // Só adiciona se realmente houver um valor
            if (filtros.data_inicio) filtrosAtivos.data_inicio = filtros.data_inicio;
            if (filtros.data_fim) filtrosAtivos.data_fim = filtros.data_fim;
            
            // Enviamos os IDs apenas se eles não forem vazios
            if (filtros.colaborador_id) filtrosAtivos.colaborador_id = filtros.colaborador_id;
            if (filtros.projeto_id) filtrosAtivos.projeto_id = filtros.projeto_id;
            if (filtros.atividade_id) filtrosAtivos.atividade_id = filtros.atividade_id;

            const params = new URLSearchParams(filtrosAtivos).toString();

            // Define a rota baseada no tipo
            const endpoint = tipoRelatorio === 'despesas' ? 'despesas' : '';
            const response = await fetch(`${API_BASE_URL}/relatorios/${endpoint}?${params}`);
            // // Log para você ver no console do navegador se o ID está indo na URL
            // console.log("Chamando URL:", `${API_BASE_URL}/relatorios?${params}&exportar=false`);
            // const response = await fetch(`${API_BASE_URL}/relatorios?${params}&exportar=false`);

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
    const filtrosAtivos = { exportar: 'true' }; // Forçamos o modo exportação
    if (filtros.data_inicio) filtrosAtivos.data_inicio = filtros.data_inicio;
    if (filtros.data_fim) filtrosAtivos.data_fim = filtros.data_fim;
    
    // Escolhe o ID correto baseado no relatório
    if (tipoRelatorio === 'despesas' || tipoRelatorio === 'projeto') {
        if (filtros.projeto_id) filtrosAtivos.projeto_id = filtros.projeto_id;
    } else {
        if (filtros.colaborador_id) filtrosAtivos.colaborador_id = filtros.colaborador_id;
    }

    // Passa todos os IDs que estiverem preenchidos
    if (filtros.colaborador_id) filtrosAtivos.colaborador_id = filtros.colaborador_id;
    if (filtros.projeto_id) filtrosAtivos.projeto_id = filtros.projeto_id;
    if (filtros.atividade_id) filtrosAtivos.atividade_id = filtros.atividade_id;

    const params = new URLSearchParams(filtrosAtivos).toString();
    const endpoint = tipoRelatorio === 'despesas' ? 'relatorios/despesas' : 'relatorios';
    
    window.open(`${API_BASE_URL}/${endpoint}?${params}`, '_blank');
};

    return (
        <div className="flex h-screen w-full">
            <SideBar />
            <div className="flex-1 p-6 overflow-auto">
                <Header />
                <main className="mt-4">
                    <div className="flex justify-between">
                        <PageHeader 
                        title="Relatórios" 
                        subtitle="Checagem e exportação de relatórios" 
                        />
                        <div className="m-2 w-80 mr-10">
                            <label className="block text-md font-bold text-botao-dark mb-1">Tipo de Relatório</label>
                            <Select value={tipoRelatorio} onValueChange={(value) => {
                                setTipoRelatorio(value);
                                setDados([]);
                                setFiltros({data_inicio: '', 
                                    data_fim: '', 
                                    colaborador_id: '', 
                                    projeto_id: '', 
                                    atividade_id: ''});
                            }}>
                            <SelectTrigger className="border shadow-md border-gray-300 p-2 rounded h-10 px-3 flex justify-between items-center">
                                <SelectValue placeholder="Selecione o tipo"/>
                                {/* <ChevronDown className="h-4 w-4 opacity-50" /> */}
                            </SelectTrigger>
                            <SelectContent className="bg-white border shadow-xl rounded-md z-[999] min-w-[280px] overflow-hidden">
                                <SelectItem value="produtividade" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Produtividade por colaborador</SelectItem>
                                <SelectItem value="atividade" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Por atividade</SelectItem>
                                <SelectItem value="despesas" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Relatório de Despesas</SelectItem>
                                <SelectItem value="projeto" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Horas por projeto</SelectItem>
                            </SelectContent>
                        </Select>
                        </div>
                    </div>
                    {/* <PageHeader 
                        title="Relatórios" 
                        subtitle="Checagem e exportação de relatórios" 
                    /> */}

                    {/* ESCOLHER O TIPO DE RELATÓRIO */}
                    {/* <div className="mb-2 w-72">
                        <label className="block text-sm font-medium mb-1">Tipo de Relatório</label>
                        <Select value={tipoRelatorio} onValueChange={(value) => {
                            setTipoRelatorio(value);
                            setDados([]);
                            setFiltros({data_inicio: '', 
                                data_fim: '', 
                                colaborador_id: '', 
                                projeto_id: '', 
                                atividade_id: ''});
                        }}>
                        <SelectTrigger className="w-full border border-gray-300 p-2 rounded h-10 px-3 flex justify-between items-center">
                            <SelectValue placeholder="Selecione o tipo"/> */}
                            {/* <ChevronDown className="h-4 w-4 opacity-50" /> */}
                        {/* </SelectTrigger>
                        <SelectContent className="bg-white border shadow-xl rounded-md z-[999] min-w-[280px] overflow-hidden">
                            <SelectItem value="produtividade" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Produtividade por colaborador</SelectItem>
                            <SelectItem value="atividade" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Por atividade</SelectItem>
                            <SelectItem value="despesas" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Relatório de Despesas</SelectItem>
                            <SelectItem value="projeto" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Horas por projeto</SelectItem>
                        </SelectContent>
                    </Select>
                    </div> */}
                    
                    {/* Barra de filtros */}
                    <div className="flex gap-4 mb-8 items-end p-4 rounded-lg">
                        <div>
                            <label className="block text-sm font-medium">Início:</label>
                            <input type="date" className="border rounded p-1 h-9" value={filtros.data_inicio} onChange={e => setFiltros({...filtros, data_inicio: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Fim:</label>
                            <input type="date" className="border rounded p-1 h-9" value={filtros.data_fim} onChange={e => setFiltros({...filtros, data_fim: e.target.value})} />
                        </div>
                        {(tipoRelatorio === 'produtividade' || tipoRelatorio === 'atividade') && (
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
                        )}

                        {tipoRelatorio === 'atividade' && (
                            <>
                                {/* Primeiro selecionamos o Projeto */}
                                <div>
                                <label className="block text-sm font-medium">Projeto:</label>
                                <select 
                                    className="border rounded p-1 h-9 w-50 bg-white" 
                                    value={filtros.projeto_id} 
                                    onChange={e => {
                                    const projId = e.target.value;
                                    const projetoSelecionado = projetos.find(p => p.projeto_id.toString() === projId);
                                    
                                    // 1. Atualiza o filtro de projeto e reseta a atividade
                                    setFiltros({ ...filtros, projeto_id: projId, atividade_id: '' });
                                    
                                    // 2. Carrega as atividades específicas desse projeto (igual você faz no lançamento)
                                    if (projetoSelecionado) {
                                        setAtividades(projetoSelecionado.atividades || []);
                                    } else {
                                        setAtividades([]);
                                    }
                                    }}
                                >
                                    <option value="">Selecione o Projeto</option>
                                    {projetos.map(p => (
                                    <option key={p.projeto_id} value={p.projeto_id}>{p.nome_projeto}</option>
                                    ))}
                                </select>
                                </div>

                                {/* Depois a Atividade aparece filtrada */}
                                <div>
                                <label className="block text-sm font-medium">Atividade:</label>
                                <select 
                                    className="border rounded p-1 h-9 w-50 bg-white" 
                                    disabled={!filtros.projeto_id} // Só habilita se tiver projeto
                                    value={filtros.atividade_id} 
                                    onChange={e => setFiltros({ ...filtros, atividade_id: e.target.value })}
                                >
                                    <option value="">Selecione a Atividade</option>
                                    {atividades.map(a => (
                                    <option key={a.atividade_id} value={a.atividade_id}>{a.nome_atividade}</option>
                                    ))}
                                </select>
                                </div>
                            </>
                        )}

                        {/* NOVO: Filtro de Projeto (Aparece em Projeto e Despesas) */}
                        {(tipoRelatorio === 'projeto' || tipoRelatorio === 'despesas') && (
                            <div>
                                <label className="block text-sm font-medium">Projeto:</label>
                                <select className="border rounded p-1 h-9 bg-white" value={filtros.projeto_id} onChange={e => setFiltros({...filtros, projeto_id: e.target.value})}>
                                    <option value="">Selecione o Projeto</option>
                                    {projetos.map(p => (
                                        <option key={p.projeto_id} value={p.projeto_id}>{p.nome_projeto}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        
                        <button onClick={buscarDados} className="bg-botao-light text-white px-4 py-2 rounded hover:bg-botao-dark flex">
                            {loading ? 'Buscando...' : 'Filtrar'}
                            <Search className="mx-1"/>
                        </button>
                        <button onClick={exportarCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex">
                            Exportar Excel
                            <FileSpreadsheet className="mx-2"/>
                        </button>
                    </div>

                    {/* Tabela de resultados e cabeçalhos dinamicos */}
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-botao-dark text-white border-b">
                                    {tipoRelatorio === 'despesas' ? (
                                        <>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Tipo de Gasto</th>
                                            <th className="p-3">Descrição</th>
                                            <th className="p-3 text-right">Valor</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-3">Data</th>
                                            <th className="p-3">Colaborador</th>
                                            <th className="p-3">Projeto</th>
                                            <th className="p-3">Atividade</th>
                                            <th className="p-3">Horas</th>
                                            <th className="p-3">Descrição</th>
                                        </>
                                    )}
                                    
                                </tr>
                            </thead>
                            <tbody>
                                {dados.length > 0 ? dados.map((item, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        {tipoRelatorio === 'despesas' ? (
                                            <>
                                                <td className="p-3">{item.data ? new Date(item.data).toLocaleDateString('pt-BR') : "-"}</td>
                                                <td className="p-3">{item.tipo_gasto}</td>
                                                <td className="p-3">{item.descricao}</td>
                                                <td className="p-3 text-right">{item.valor ? `R$ ${Number(item.valor).toFixed(2)}` : "R$ 0,00"}</td>
                                            </>
                                        ) : (
                                            <>
                                                {/* Ajuste os nomes das chaves (item.Data, item.Colaborador) conforme o seu Backend retornar */}
                                                <td className="p-3">{item.data_lancamento ? new Date(item.data_lancamento).toLocaleDateString() : "-"}</td>
                                                <td className="p-3">{item.colaboradores?.nome_colaborador || "N/A"}</td>
                                                <td className="p-3">{item.projetos?.nome_projeto || "Sem preojeto"}</td>
                                                <td className="p-3 text-sm font-semibold">{item.atividades?.nome_atividade || "Geral"}</td>
                                                <td className="p-3">{item.duracao_total?.toFixed(2)}h</td>
                                                <td className="p-3">{item.descricao}</td>
                                            </>
                                        )}
                                        
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-500">
                                            {loading ? "Carregando..." : "Nenhum dado encontrado para os filtros selecionados."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="font-bold">
                                <tr>
                                    <td colSpan={tipoRelatorio === 'despesas' ? 3 : 4} className="text-right">TOTAL:</td>
                                    <td className="p-3">
                                        {tipoRelatorio === 'despesas' 
                                            ? `R$ ${dados.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0).toFixed(2)}`
                                            : `${dados.reduce((acc, curr) => acc + (Number(curr.duracao_total) || 0), 0).toFixed(2)}h`
                                        }
                                    </td>
                                    {tipoRelatorio !== 'despesas' && <td></td>}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}