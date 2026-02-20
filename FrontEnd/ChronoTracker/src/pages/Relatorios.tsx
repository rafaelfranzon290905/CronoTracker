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
import { Search, FileSpreadsheet, FileText } from "lucide-react";

export default function Relatorios() {
    const [filtros, setFiltros] = useState({ data_inicio: '', data_fim: '', colaborador_id: '', projeto_id: '', atividade_id: '' });
    const [dados, setDados] = useState([]);
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [projetos, setProjetos] = useState([]);
    const [atividades, setAtividades] = useState([]);
    const [tipoRelatorio ,setTipoRelatorio] = useState();
    const [erroTipo, setErroTipo] = useState(false);

    const [paginaAtual, setPaginaAtual] = useState(1);
    const itensPorPagina = 10;
    const indiceFinal = paginaAtual * itensPorPagina;
    const indiceInicial = indiceFinal - itensPorPagina;
    const dadosPaginados = dados.slice(indiceInicial, indiceFinal);
    const totalPaginas = Math.ceil(dados.length / itensPorPagina);

    // Busca lista de colaboradores
    useEffect(() => {
        fetch(`${API_BASE_URL}/usuarios`)
            .then(res => res.json())
            .then(data => setColaboradores(data))
            .catch(err => console.error("Erro ao carregar colaboradores", err));
        fetch(`${API_BASE_URL}/projetos`)
            .then(res => res.json())
            .then(data => setProjetos(data));
        fetch(`${API_BASE_URL}/atividades`) 
        .then(res => res.json())
        .then(data => setAtividades(data))
        .catch(err => console.error("Erro ao carregar atividades", err));
    }, []);

    const buscarDados = async () => {
        console.log("Estado atual dos filtros no Front:", filtros);
        if (!tipoRelatorio || tipoRelatorio === '') {
            setErroTipo(true);
            setTimeout(() => setErroTipo(false), 3000);
            return; 
        }
        setErroTipo(false); 
        setLoading(true);
        try {
            const filtrosAtivos = {};
            if (filtros.data_inicio) filtrosAtivos.data_inicio = filtros.data_inicio;
            if (filtros.data_fim) filtrosAtivos.data_fim = filtros.data_fim;
            
            if (filtros.colaborador_id) filtrosAtivos.colaborador_id = filtros.colaborador_id;
            if (filtros.projeto_id) filtrosAtivos.projeto_id = filtros.projeto_id;
            if (filtros.atividade_id) filtrosAtivos.atividade_id = filtros.atividade_id;

            const params = new URLSearchParams(filtrosAtivos).toString();

            const endpoint = tipoRelatorio === 'despesas' ? 'despesas' : '';
            const response = await fetch(`${API_BASE_URL}/relatorios/${endpoint}?${params}`);
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

    const exportarDados = (formato) => {
    if (!tipoRelatorio) return alert("Selecione um tipo de relatório primeiro.");
    const filtrosAtivos = { exportar: 'true', formato: formato }; 
    if (filtros.data_inicio) filtrosAtivos.data_inicio = filtros.data_inicio;
    if (filtros.data_fim) filtrosAtivos.data_fim = filtros.data_fim;
    
    if (tipoRelatorio === 'despesas' || tipoRelatorio === 'projeto') {
        if (filtros.projeto_id) filtrosAtivos.projeto_id = filtros.projeto_id;
    } else {
        if (filtros.colaborador_id) filtrosAtivos.colaborador_id = filtros.colaborador_id;
    }

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
                        <div className="m-2 w-80 mr-10 relative">
                            <label className="block text-md font-bold text-botao-dark mb-1">Tipo de Relatório</label>
                            <Select value={tipoRelatorio} onValueChange={(value) => {
                                setTipoRelatorio(value);
                                setErroTipo(false);
                                setDados([]);
                                setFiltros({data_inicio: '', 
                                    data_fim: '', 
                                    colaborador_id: '', 
                                    projeto_id: '', 
                                    atividade_id: ''});
                                setPaginaAtual(1);
                            }}>
                            <SelectTrigger className="border shadow-md border-gray-300 p-2 rounded h-10 px-3 flex justify-between items-center">
                                <SelectValue placeholder="Selecione o tipo"/>
                                {/* <ChevronDown className="h-4 w-4 opacity-50" /> */}
                            </SelectTrigger>
                            <SelectContent className="bg-white border shadow-xl rounded-md z-[999] min-w-[280px] overflow-hidden">
                                
                                {/* <SelectItem value="Selecione o tipo" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Selecione o tipo</SelectItem> */}
                                <SelectItem value="produtividade" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Produtividade por colaborador</SelectItem>
                                <SelectItem value="atividade" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Por atividade</SelectItem>
                                <SelectItem value="despesas" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Relatório de Despesas</SelectItem>
                                <SelectItem value="projeto" className="p-2 hover:bg-blue-50 cursor-pointer outline-none">Horas por projeto</SelectItem>
                            </SelectContent>
                        </Select>
                        {erroTipo && (
                            <span className="mt-2 absolute text-red-500 text-md font-semibold">
                                ⚠️ Por favor, selecione um tipo de relatório
                            </span>
                        )}
                        </div>
                    </div>
                    {/* <PageHeader 
                        title="Relatórios" 
                        subtitle="Checagem e exportação de relatórios" 
                    /> */}

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
                                    
                                    setFiltros({ ...filtros, projeto_id: projId, atividade_id: '' });
                                    
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

                        {/* <div className="flex-1"></div> */}

                        {/* BOTÕES DE EXPORTAÇÃO */}
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => exportarDados('xlsx')} className="bg-green-700 text-white px-3 py-2 rounded hover:bg-green-800 flex items-center">
                                    <FileSpreadsheet className="mr-2 h-4 w-4"/> Excel
                                </button>
                                <button onClick={() => exportarDados('csv')} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center text-sm">
                                    <FileText className="mr-2 h-4 w-4"/> CSV
                                </button>
                            </div>
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
                                {dadosPaginados.length > 0 ? dadosPaginados.map((item, index) => (
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
                            {dados.length > 0 && (
                                <tfoot className="font-bold bg-gray-50 border-t-2">
                                    <tr>
                                        <td colSpan={tipoRelatorio === 'despesas' ? 3 : 6} className="p-4 text-right uppercase text-xs tracking-wider text-gray-500">Total Acumulado:</td>
                                        <td className="p-3 text-md text-botao-dark">
                                            {tipoRelatorio === 'despesas' 
                                                ? `R$ ${dados.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                                : `${dados.reduce((acc, curr) => acc + (Number(curr.duracao_total) || 0), 0).toFixed(2)}h`
                                            }
                                        </td>
                                        {tipoRelatorio !== 'despesas' && <td></td>}
                                    </tr>
                                </tfoot>
                            )}
                            </table>
                            </div>

                                {dados.length > itensPorPagina && (
                                    <div className="flex justify-end items-center gap-4 mt-4 p-4">
                                        <button 
                                            onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                                            disabled={paginaAtual === 1}
                                            className="p-2 border rounded disabled:opacity-30 font-bold"
                                        >
                                            Anterior
                                        </button>
                                        <span className="text-sm font-medium min-w-fit">Página {paginaAtual} de {totalPaginas}</span>
                                        <button 
                                            onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                                            disabled={paginaAtual === totalPaginas}
                                            className="p-2 border rounded disabled:opacity-30 font-bold"
                                        >
                                            Próximo
                                        </button>
                                    </div>
            )}

                </main>
            </div>
        </div>
    );
}