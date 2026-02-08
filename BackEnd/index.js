require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura';

// Inicialização do Prisma Client
const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor ChronoTracker Backend rodando com Prisma e Neon!');
});

// ==================================================================
// ROTAS DE CLIENTES
// ==================================================================

// GET /clientes
app.get('/clientes', async (req, res) => {
  try {
    const todosClientes = await prisma.clientes.findMany({
      orderBy: { cliente_id: 'asc' },
    });
    res.status(200).json(todosClientes);
  } catch (error) {
    console.error('Erro ao buscar todos os clientes:', error);
    res.status(500).json({ error: 'Erro interno ao listar clientes.' });
  }
});

// GET /clientes/cnpj/:cnpj
app.get('/clientes/cnpj/:cnpj', async (req, res) => {
  const cnpjLimpo = req.params.cnpj.replace(/[^\d]/g, '');
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ error: 'formato de CNPJ inválido. Deve ter 14 dígitos.' });
  }
  try {
    const cliente = await prisma.clientes.findUnique({
      where: { cnpj: cnpjLimpo },
      select: { cliente_id: true, nome_empresa: true },
    });
    if (cliente) {
      res.status(200).json({ existe: true, cliente: cliente });
    } else {
      res.status(200).json({ existe: false });
    }
  } catch (error) {
    console.error('Erro ao verificar CNPJ:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /clientes
app.post('/clientes', async (req, res) => {
  const { cnpj, nome_cliente, nome_contato, cep, endereco, cidade, estado, status } = req.body;
  if (!cnpj || !nome_cliente) {
    return res.status(400).json({ error: 'CNPJ e Nome da Empresa são obrigatórios.' });
  }
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  try {
    const novoCliente = await prisma.clientes.create({
      data: {
        cnpj: cnpjLimpo,
        nome_cliente,
        nome_contato,
        cep,
        endereco,
        cidade,
        estado,
        status: status !== undefined ? status : true,
      }
    });
    return res.status(201).json(novoCliente);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'CNPJ já existente',
        message: 'Este CNPJ já está cadastrado no sistema.' 
      });
    }
    console.error('Erro ao cadastrar cliente:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// PUT /clientes/:id
app.put('/clientes/:id', async (req, res) => {
  const clienteId = Number(req.params.id)
  const { cnpj, nome_cliente, nome_contato, cep, endereco, cidade, estado, status } = req.body
  try {
    const cnpjLimpo = cnpj ? cnpj.replace(/\D/g, '') : null
    if (cnpjLimpo) {
      const duplicado = await prisma.clientes.findFirst({
        where: {
          cnpj: cnpjLimpo,
          cliente_id: { not: clienteId }
        }
      })
      if (duplicado) {
        return res.status(409).json({ code: 'CNPJ_DUPLICADO', message: 'CNPJ já existente' })
      }
    }
    const clienteAtualizado = await prisma.clientes.update({
      where: { cliente_id: clienteId },
      data: { cnpj: cnpjLimpo, nome_cliente, nome_contato, cep, endereco, cidade, estado, status }
    })
    return res.status(200).json(clienteAtualizado)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ code: 'CNPJ_DUPLICADO', message: 'CNPJ já existente' })
    }
    console.error(error)
    return res.status(500).json({ message: 'Erro interno' })
  }
})

// DELETE /clientes/:id
app.delete('/clientes/:id', async (req, res) => {
  const clienteId = parseInt(req.params.id);
  if (isNaN(clienteId)) return res.status(400).json({ error: 'ID do cliente inválido.' });
  try {
    const clienteDeletado = await prisma.clientes.delete({
      where: { cliente_id: clienteId },
    });
    res.status(200).json({ message: 'Cliente excluido com sucesso.', cliente: clienteDeletado });
  } catch (error) {
    if (error.code == 'P2025') return res.status(404).json({ error: `Cliente com ID ${clienteId} não encontrado` });
    if (error.code === 'P2003') return res.status(400).json({ error: 'Este cliente não pode ser excluído porque possui projetos ou horas.' });
    console.error('Erro ao deletar o cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
})

// GET /clientes/:id/projetos
app.get('/clientes/:id/projetos', async (req, res) => {
  const clienteId = parseInt(req.params.id);
  if (isNaN(clienteId)) return res.status(400).json({ error: 'ID do cliente inválido.' });
  try {
    const projetosDoCliente = await prisma.projetos.findMany({
      where: { cliente_id: clienteId },
      orderBy: { projeto_id: 'desc' },
    });
    res.status(200).json(projetosDoCliente);
  } catch (error) {
    console.error(`Erro ao buscar projetos do cliente ${clienteId}:`, error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos.' });
  }
});

// ==================================================================
// ROTAS DE COLABORADORES
// ==================================================================

// GET /colaboradores
app.get('/colaboradores', async (req, res) => {
  try {
    const colaboradores = await prisma.colaboradores.findMany({
      include: {
        projeto_colaboradores: {
          include: {
            projetos: {
              include: { atividades: true, clientes: true }
            }
          }
        }
      },
      orderBy: { nome_colaborador: 'asc' }
    });
    const colaboradoresFormatados = colaboradores.map(col => {
      const projetosNomes = col.projeto_colaboradores.map(pc => pc.projetos?.nome_projeto).filter(Boolean);
      const atividadesEquipe = col.projeto_colaboradores.flatMap(pc => pc.projetos?.atividades || []);
      return {
        ...col,
        foto: col.foto ? col.foto.toString('base64') : null,
        listaProjetos: projetosNomes,
        atividadesEquipe: atividadesEquipe
      };
    });
    res.status(200).json(colaboradoresFormatados);
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    res.status(500).json({ error: 'Erro ao buscar lista de colaboradores' });
  }
});

// GET /colaboradores/email/:email
app.get('/colaboradores/email/:email', async (req, res) => {
  const { email } = req.params;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  try {
    const colaborador = await prisma.colaboradores.findUnique({
      where: { email: email }
    });
    if (colaborador) {
      res.status(200).json({ existe: true, colaborador: colaborador });
    } else {
      res.status(200).json({ existe: false });
    }
  } catch (error) {
    console.error('Erro ao verificar e-mail:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /colaboradores
app.post('/colaboradores', async (req, res) => {
  const { nome_colaborador, cargo, email, data_admissao, status, foto } = req.body;
  if (!email || !nome_colaborador || !cargo) return res.status(400).json({ error: 'Nome, Cargo e E-mail são obrigatórios.' });
  try {
    const novoColaborador = await prisma.colaboradores.create({
      data: {
        nome_colaborador,
        cargo,
        email,
        data_admissao: data_admissao ? new Date(data_admissao) : new Date(),
        status: status !== undefined ? status : true,
        foto: foto ? Buffer.from(foto, 'base64') : null,
      }
    });
    return res.status(201).json(novoColaborador);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    console.error('Erro ao cadastrar colaborador:', error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// PUT /colaboradores/:id
app.put('/colaboradores/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome_colaborador, cargo, email, status, foto, data_admissao } = req.body;
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });
  const dadosParaAtualizar = { nome_colaborador, cargo, email, status };
  if (foto) dadosParaAtualizar.foto = Buffer.from(foto, 'base64');
  if (data_admissao) dadosParaAtualizar.data_admissao = new Date(data_admissao);
  try {
    const colaboradorAtualizado = await prisma.colaboradores.update({
      where: { colaborador_id: id },
      data: dadosParaAtualizar,
    });
    res.status(200).json(colaboradorAtualizado);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: `Colaborador não encontrado.` });
    if (error.code === 'P2002') return res.status(400).json({ error: 'E-mail já está em uso.' });
    console.error('[PUT] Erro:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar.' });
  }
});

// DELETE /colaboradores/:id
app.delete('/colaboradores/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.$transaction(async (tx) => {
      await tx.colaboradores.update({
        where: { colaborador_id: id },
        data: { status: false }
      });
      await tx.usuarios.updateMany({
        where: { colaborador_id: id },
        data: { status: false }
      });
    });
    res.status(200).json({ message: 'Colaborador e Usuário inativados com sucesso.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Colaborador não encontrado.' });
    console.error('[DELETE] Erro:', error);
    res.status(500).json({ error: 'Erro interno ao excluir colaborador.' });
  }
});

// ==================================================================
// ROTAS DE ATIVIDADES
// ==================================================================

// GET /atividades
app.get('/atividades', async (req, res) => {
  try {
    const atividades = await prisma.atividades.findMany({
      include: {
        responsavel: true,
        projetos: {
          select: {
            nome_projeto: true
          }
        }
      },
      orderBy: {
        atividade_id: 'asc',
      },
    });
    const somaHorasAtividades = await prisma.lancamentos_de_horas.groupBy({
      by: ['atividade_id'],
      _sum: { duracao_total: true }
    });

    const atividadesComHorasReais = atividades.map(atv => {
      const lancamento = somaHorasAtividades.find(l => l.atividade_id === atv.atividade_id);
      return {
        ...atv,
        horas_gastas: lancamento?._sum?.duracao_total || 0
      };
    });


    res.status(200).json(atividadesComHorasReais);
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).json({ error: 'Erro interno ao listar atividades.' });
  }
});

// GET /atividades/:atividade_id
app.get('/atividades/:atividade_id', async (req, res) => {
  const atividadeId = Number(req.params.atividade_id);
  if (!Number.isInteger(atividadeId)) return res.status(400).json({ error: "ID inválido." });
  try {
    const atividade = await prisma.atividades.findUnique({
      where: { atividade_id: atividadeId },
      include: {
        responsavel: true,
        projetos: true,
        lancamentos_de_horas: {
          include: { 
            colaboradores: { 
              select: { nome_colaborador: true } 
            } 
          },
          orderBy: { 
            data_lancamento: 'desc' 
          }
        }
      }
    });
    if (!atividade) return res.status(404).json({ error: "Atividade não encontrada." });
    res.json(atividade);
  } catch (error) {
    console.error("Erro ao buscar atividade:", error);
    res.status(500).json({ error: "Erro ao buscar atividade." });
  }
});

// POST /atividades
app.post('/atividades', async (req, res) => {
  const { nome_atividade, descr_atividade, data_prevista_inicio, data_prevista_fim, projeto_id, colaborador_id, horas_gastas } = req.body;

  if (!projeto_id) {
    return res.status(400).json({ error: 'O ID do projeto é obrigatório para vincular a atividade.' });
  }

  try {
    // 1. CONVERSÃO DO PROJETO_ID PARA INTEIRO 
    //    const projetoIdNumerico = Number(projeto_id); 
    //     if (isNaN(projetoIdNumerico) || !Number.isInteger(projetoIdNumerico)) {
    //       return res.status(400).json({ error: 'O ID do projeto deve ser um número inteiro válido.' });
    //     }
    const projetoIdNumerico = Number(projeto_id);
    const dataInicio = new Date(data_prevista_inicio + 'T00:00:00Z');
    const dataFim = (data_prevista_fim && data_prevista_fim !== "") ? new Date(data_prevista_fim + 'T00:00:00Z') : null;
    const statusBoolean = true;


    // ✍️ Criação da Atividade no Prisma
 const novaAtividade = await prisma.atividades.create({
  data: {
    nome_atividade,
    descr_atividade: descr_atividade || "",
    data_prevista_inicio: dataInicio,
    data_prevista_fim: dataFim,
    horas_gastas: Number(horas_gastas) || 0,
    status: statusBoolean,
    projetos: {
      connect: { projeto_id: projetoIdNumerico }
    },
    ...(colaborador_id && {
      responsavel: {
        connect: { colaborador_id: Number(colaborador_id) }
      }
    })
  }
});

// RECALCULA AS HORAS DO PROJETO
const soma = await prisma.atividades.aggregate({
  where: { projeto_id: projetoIdNumerico },
  _sum: { horas_gastas: true }
});

// ATUALIZA O PROJETO
await prisma.projetos.update({
  where: { projeto_id: projetoIdNumerico },
  data: {
    horas_gastas: soma._sum.horas_gastas || 0
  }
});

    res.status(201).json(novaAtividade);
  } catch (error) {
    if (error.code === 'P2003') return res.status(404).json({ error: `O Projeto ID ${projeto_id} não existe.` });
    console.error('Erro ao cadastrar atividade:', error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// PUT /atividades/:atividade_id
app.put('/atividades/:atividade_id', async (req, res) => {
  const { atividade_id } = req.params;
  const { nome_atividade, descr_atividade, data_prevista_inicio, data_prevista_fim, horas_gastas, status, projeto_id, colaborador_id } = req.body;
  try {
    const dataInicio = data_prevista_inicio ? new Date(data_prevista_inicio + 'T12:00:00Z') : null;
    const dataFim = data_prevista_fim ? new Date(data_prevista_fim + 'T12:00:00Z') : null;

    const atividadeAtualizada = await prisma.atividades.update({
      where: { atividade_id: Number(atividade_id) },
      data: {
        nome_atividade,
        descr_atividade: descr_atividade || "",
        data_prevista_inicio: dataInicio,
        data_prevista_fim: dataFim,
        horas_gastas: Number(horas_gastas) || 0,
        status: Boolean(status),
        projetos: { connect: { projeto_id: Number(projeto_id) } },
        responsavel: colaborador_id ? { connect: { colaborador_id: Number(colaborador_id) } } : { disconnect: true }
      },
      include: {
        responsavel: true,
        projetos: true,
      }
    });

    const soma = await prisma.atividades.aggregate({
      where: { projeto_id: Number(projeto_id) },
      _sum: { horas_gastas: true }
    });

await prisma.projetos.update({
  where: { projeto_id: Number(projeto_id) },
  data: {
    horas_gastas: soma._sum.horas_gastas || 0
  }
});

    res.status(200).json(atividadeAtualizada);
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Atividade não encontrada." });
    console.error("Erro ao atualizar:", error);
    res.status(500).json({ error: "Erro interno." });
  }
});

// DELETE /atividades/:atividade_id
app.delete('/atividades/:atividade_id', async (req, res) => {
  const atividadeId = Number(req.params.atividade_id);
  if (!Number.isInteger(atividadeId)) return res.status(400).json({ error: "ID inválido." });
  try {
    const existe = await prisma.atividades.findUnique({ where: { atividade_id: atividadeId } });
    if (!existe) return res.status(404).json({ error: `Atividade não existe.` });
    await prisma.atividades.delete({ where: { atividade_id: atividadeId } });
    res.sendStatus(204);
  } catch (error) {
    console.error("Erro ao deletar:", error);
    res.status(500).json({ error: "Erro interno ao deletar." });
  }
});

// ==================================================================
// ROTAS DE PROJETOS
// ==================================================================

// GET /projetos
app.get('/projetos', async (req, res) => {
  try {
    const totalLancamentos = await prisma.lancamentos_de_horas.count();
    // console.log("DEBUG RENDER - Total de lançamentos no banco:", totalLancamentos);
    const projetos = await prisma.projetos.findMany({
      include: {
        clientes: { select: { nome_cliente: true } },
        atividades: { select: { atividade_id: true, nome_atividade: true, status: true } },
        projeto_colaboradores: { include: { colaboradores: true } }
      },
      orderBy: { projeto_id: 'desc' }
    });
    const agregacaoHoras = await prisma.lancamentos_de_horas.groupBy({
      by: ['projeto_id'],
      _sum: { duracao_total: true }
    });
    const projetosComHoras = projetos.map(projeto => {
      const calculo = agregacaoHoras.find(h => Number(h.projeto_id) === Number(projeto.projeto_id));
      const total = calculo?._sum?.duracao_total || 0;
      
      return {
        ...projeto,
        horas_gastas: total
      };
    });
    res.status(200).json(projetosComHoras);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao listar projetos.' });
  }
});

// GET /projetos/:id
app.get('/projetos/:id', async (req, res) => {
  const { id } = req.params;
  const projetoId = parseInt(id);
  if (isNaN(projetoId)) return res.status(400).json({ error: "ID do projeto inválido." });
  try {
    const [projeto, somaDespesas, somaHoras] = await Promise.all([
      prisma.projetos.findUnique({
        where: { projeto_id: projetoId },
        include: {
          clientes: { select: { nome_cliente: true } },
          atividades: { orderBy: { atividade_id: 'asc' } },
          projeto_colaboradores: { include: { colaboradores: true } },
          despesas: { orderBy: { data_despesa: 'desc' }, include: { colaborador: { select: { nome_colaborador: true } } } }
        }
      }),
      prisma.despesas.aggregate({
        where: { projeto_id: projetoId, status_aprovacao: "Aprovada" },
        _sum: { valor: true }
      }),
      prisma.lancamentos_de_horas.aggregate({
        where: { projeto_id: projetoId },
        _sum: { duracao_total: true }
      })
    ]);
    if (!projeto) return res.status(404).json({ error: 'Projeto não encontrado.' });
    res.status(200).json({
      ...projeto,
      horas_gastas: somaHoras._sum.duracao_total || 0,
      total_despesas: Number(somaDespesas._sum.valor) || 0
    });
  } catch (error) {
    console.error(`Erro ao buscar projeto ${id}:`, error);
    res.status(500).json({ error: 'Erro interno ao buscar detalhes do projeto.' });
  }
});

// POST /projetos
app.post('/projetos', async (req, res) => {
  const { cliente_id, nome_projeto, descricao, data_inicio, data_fim, status, horas_previstas, colaboradores_ids } = req.body;
  if (!cliente_id || !nome_projeto || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Campos obrigatórios: Cliente, Nome, Data Início, Data Fim.' });
  }
  try {
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    if (fim < inicio) return res.status(400).json({ error: 'Data Fim não pode ser anterior à Data Início.' });
    
    const novoProjeto = await prisma.projetos.create({
      data: {
        cliente_id: parseInt(cliente_id),
        nome_projeto,
        descricao,
        data_inicio: inicio,
        data_fim: fim,
        horas_previstas: horas_previstas ? parseInt(horas_previstas) : 0,
        status: status ?? true,
        projeto_colaboradores: {
          create: (colaboradores_ids || []).map(id => ({ colaborador_id: id }))
        }
      }
    });
    res.status(201).json(novoProjeto);
  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro interno ao criar projeto.' });
  }
});

// PUT /projetos/:id
app.put('/projetos/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente_id, nome_projeto, descricao, data_inicio, data_fim, status, horas_previstas, colaboradores_ids } = req.body;
  try {
    const projetoAtualizado = await prisma.projetos.update({
      where: { projeto_id: parseInt(id) },
      data: {
        cliente_id: cliente_id ? parseInt(cliente_id) : undefined,
        nome_projeto,
        descricao,
        data_inicio: data_inicio ? new Date(data_inicio) : undefined,
        data_fim: data_fim ? new Date(data_fim) : undefined,
        horas_previstas: horas_previstas !== undefined ? parseInt(horas_previstas) : undefined,
        status,
        projeto_colaboradores: {
          deleteMany: {},
          create: (colaboradores_ids || []).map(idColab => ({ colaborador_id: parseInt(idColab) }))
        }
      },
      include: { projeto_colaboradores: { include: { colaboradores: true } } }
    });
    res.status(200).json(projetoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    res.status(500).json({ error: 'Erro ao atualizar projeto.' });
  }
});

// DELETE /projetos/:id
app.delete('/projetos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.projetos.delete({ where: { projeto_id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: 'Projeto não encontrado.' });
    res.status(500).json({ error: 'Erro interno ao excluir projeto.' });
  }
});

// ==================================================================
// ROTAS DE DESPESAS
// ==================================================================

// POST /despesas
app.post('/despesas', async (req, res) => {
  const { projeto_id, colaborador_id, tipo_despesa, data_despesa, valor, descricao, anexo } = req.body;
  if (!projeto_id || !colaborador_id || !tipo_despesa || !data_despesa || !valor || !descricao || !anexo) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios." });
  }
  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico) || valorNumerico <= 0) return res.status(400).json({ error: "Valor inválido." });

  try {
    const projeto = await prisma.projetos.findUnique({ where: { projeto_id: Number(projeto_id) } });
    if (!projeto) return res.status(404).json({ error: "Projeto não encontrado." });
    if (projeto.status === false) return res.status(400).json({ error: "Projeto inativo." });

    const novaDespesa = await prisma.despesas.create({
      data: {
        projeto_id: Number(projeto_id),
        colaborador_id: Number(colaborador_id),
        tipo_despesa,
        data_despesa: new Date(data_despesa),
        valor: valorNumerico,
        descricao,
        anexo, 
        status_aprovacao: "Pendente" 
      }
    });
    res.status(201).json(novaDespesa);
  } catch (error) {
    console.error("Erro ao cadastrar despesa:", error);
    res.status(500).json({ error: "Erro interno." });
  }
});

// PATCH /despesas/:id/status
app.patch('/despesas/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, motivo_reprovacao, cargo } = req.body; 
  if (!cargo || cargo.toLowerCase() !== 'gerente') return res.status(403).json({ error: "Apenas gerentes podem aprovar." });
  try {
    const despesaAtualizada = await prisma.despesas.update({
      where: { despesa_id: parseInt(id) },
      data: { 
        status_aprovacao: status,
        motivo_reprovacao: status === "Reprovada" ? motivo_reprovacao : null
      }
    });
    res.status(200).json(despesaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar status da despesa:", error);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// GET /despesas
app.get('/despesas', async (req, res) => {
  const { status } = req.query;
  try {
    const despesas = await prisma.despesas.findMany({
      where: status ? { status_aprovacao: status } : {},
      include: {
        colaborador: { select: { nome_colaborador: true } },
        projeto: { select: { nome_projeto: true } }
      },
      orderBy: { data_despesa: 'desc' }
    });
    res.status(200).json(despesas);
  } catch (error) {
    console.error("Erro ao listar despesas:", error);
    res.status(500).json({ error: "Erro interno." });
  }
});

// ==================================================================
// ROTAS DE LOGIN E USUÁRIOS
// ==================================================================

app.post('/login', async (req, res) => {
  const { nome_usuario, senha } = req.body;
  if (!nome_usuario || !senha) return res.status(400).json({ error: "Campos obrigatórios." });
  try {
    const usuario = await prisma.usuarios.findUnique({ where: { nome_usuario } });
    if (!usuario) return res.status(401).json({ error: "Credenciais inválidas." });
    const senhaValida = await bcrypt.compare(senha, usuario.hash_senha);
    if (!senhaValida) return res.status(401).json({ error: "Credenciais inválidas." });

    const token = jwt.sign(
        { usuarioId: usuario.usuario_id, cargo: usuario.cargo, nomeUsuario: usuario.nome_usuario, colaborador_id: usuario.colaborador_id }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
    );
    res.json({
        message: "Login bem-sucedido!",
        token,
        user: {
            usuario_id: usuario.usuario_id,
            nome_usuario: usuario.nome_usuario,
            cargo: usuario.cargo,
            nome_completo: usuario.nome_completo,
            colaborador_id: usuario.colaborador_id,
        }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno." });
  }
});

// GET /usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: { usuario_id: true, nome_usuario: true, nome_completo: true, email: true, cargo: true, status: true },
      orderBy: { nome_completo: 'asc' }
    });
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// POST /usuarios
app.post('/usuarios', async (req, res) => {
  const { nome_usuario, senha, nome_completo, email, cargo } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hash_senha = await bcrypt.hash(senha, salt);
    const novoUsuario = await prisma.$transaction(async (tx) => {
      const colaborador = await tx.colaboradores.create({
        data: { nome_colaborador: nome_completo, email, cargo: cargo || 'Colaborador', data_admissao: new Date(), status: true }
      });
      const usuario = await tx.usuarios.create({
        data: { nome_usuario, hash_senha, nome_completo, email, cargo: cargo || 'Colaborador', status: true, colaborador_id: colaborador.colaborador_id }
      });
      return usuario;
    });
    const { hash_senha: _, ...userSemSenha } = novoUsuario;
    res.status(201).json({ message: "Usuário criado!", userSemSenha });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Usuário ou E-mail já cadastrados.' });
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// PUT /usuarios/:id
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_completo, email, cargo, status, senha, nome_usuario } = req.body;
  try {
    const dadosParaAtualizar = { nome_completo, email, cargo, status, nome_usuario };
    if (senha && senha.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      dadosParaAtualizar.hash_senha = await bcrypt.hash(senha, salt);
    }
    const resultado = await prisma.$transaction(async (tx) => {
      const usuarioOriginal = await tx.usuarios.findUnique({ where: { usuario_id: parseInt(id) } });
      if (!usuarioOriginal) throw new Error("P2025");
      const usuarioAtualizado = await tx.usuarios.update({ where: { usuario_id: parseInt(id) }, data: dadosParaAtualizar });
      if (status !== undefined && usuarioOriginal.colaborador_id) {
        await tx.colaboradores.update({ where: { colaborador_id: usuarioOriginal.colaborador_id }, data: { status: status } });
      }
      return usuarioAtualizado;
    });
    const { hash_senha: _, ...userSemSenha } = resultado;
    res.status(200).json(userSemSenha);
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Conflito: Usuário ou E-mail já existem.' });
    if (error.message === "P2025") return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.status(500).json({ error: 'Erro ao atualizar.' });
  }
});

// DELETE /usuarios/:id
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.findUnique({ where: { usuario_id: parseInt(id) } });
      if (!usuario) throw new Error("Usuário não encontrado");
      await tx.usuarios.update({ where: { usuario_id: parseInt(id) }, data: { status: false } });
      if (usuario.colaborador_id) {
        await tx.colaboradores.update({ where: { colaborador_id: usuario.colaborador_id }, data: { status: false } });
      }
    });
    res.status(200).json({ message: 'Inativado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao inativar usuário.' });
  }
});

// ==================================================================
// ROTAS DE TIMESHEETS (Lançamento de Horas)
// ==================================================================

// GET /lancamentos
app.get('/lancamentos', async (req, res) => {
  const { usuario_id, cargo } = req.query;
  try {
    let whereClause = {};
    if (cargo !== 'gerente' && usuario_id) {
      const usuario = await prisma.usuarios.findUnique({
        where: { usuario_id: Number(usuario_id) },
        select: { colaborador_id: true }
      });
      if (usuario?.colaborador_id) whereClause.colaborador_id = usuario.colaborador_id;
    }
    const lancamentos = await prisma.lancamentos_de_horas.findMany({
      where: whereClause,
      include: {
        colaboradores: { select: { nome_colaborador: true } },
        projetos: { select: { nome_projeto: true } },
        clientes: { select: { nome_cliente: true } },
        atividades: { select: { nome_atividade: true } }
      },
      orderBy: { data_lancamento: 'desc' }
    });
    res.status(200).json(lancamentos);
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error);
    res.status(500).json({ error: 'Erro ao listar horas.' });
  }
});

// POST /lancamentos
app.post('/lancamentos', async (req, res) => {
  const { 
    usuario_id, projeto_id, atividade_id, cliente_id,
    data, hora_inicio, hora_fim, descricao, tipo_lancamento 
  } = req.body;

  try {
    // 1. Validação de Data Futura
    if (data) {
      const dataLancamento = new Date(`${data}T00:00:00`); 
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); 
      if (dataLancamento > hoje) return res.status(400).json({ error: "Não é permitido lançar horas em datas futuras." });
    }

    // 2. Validação de Usuário
    if (!usuario_id) return res.status(400).json({ error: "ID do usuário não fornecido." });

    const usuario = await prisma.usuarios.findUnique({
      where: { usuario_id: Number(usuario_id) }
    });

    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });
    if (!usuario.colaborador_id) return res.status(400).json({ error: "Este usuário não possui um colaborador vinculado." });

    // 3. Preparação dos dados
    const statusInicial = 'aprovado';
    const inicioDate = new Date(`${data}T${hora_inicio}:00Z`);
    const fimDate = new Date(`${data}T${hora_fim}:00Z`);

    const diffMs = fimDate.getTime() - inicioDate.getTime();
    const duracaoHoras = diffMs / (1000 * 60 * 60);

    const novoLancamento = await prisma.lancamentos_de_horas.create({
      data: {
        colaborador_id: usuario.colaborador_id,
        projeto_id: Number(projeto_id),
        atividade_id: Number(atividade_id),
        cliente_id: Number(cliente_id),
        data_lancamento: new Date(`${data}T12:00:00Z`),
        hora_inicio: inicioDate,
        hora_fim: fimDate,
        duracao_total: duracaoHoras,
        descricao: descricao || "",
        status_aprovacao: statusInicial,
        tipo_lancamento: tipo_lancamento || "manual"
      }
    });
    res.status(201).json(novoLancamento);
  } catch (error) {
    console.error("Erro ao lançar horas:", error);
    res.status(500).json({ error: 'Erro interno ao registrar horas.' });
  }
});

// PUT /lancamentos/:id
app.put('/lancamentos/:id', async (req, res) => {
  const { id } = req.params;
  
  console.log("=== TENTATIVA DE EDIÇÃO ===");
  const { 
    projeto_id, atividade_id, cliente_id, 
    data_lancamento, hora_inicio, hora_fim, 
    descricao, motivo_edicao 
  } = req.body;

  try {
    // 1. Validações e Tratamento
    if (!projeto_id || !atividade_id) {
       return res.status(400).json({ error: "Projeto e Atividade são obrigatórios." });
    }

    const idLancamento = Number(id);
    const idProjeto = Number(projeto_id);
    const idAtividade = Number(atividade_id);
    const idCliente = cliente_id ? Number(cliente_id) : null;

    if (isNaN(idProjeto) || isNaN(idAtividade)) {
        return res.status(400).json({ error: "IDs inválidos." });
    }

    const dataBase = data_lancamento && data_lancamento.includes('T') 
        ? data_lancamento.split('T')[0] 
        : data_lancamento;
    
    if (!dataBase) return res.status(400).json({ error: "Data obrigatória." });

    const timeToDate = (dateStr, timeStr) => {
        if(!timeStr) return null;
        const timeParts = timeStr.split(':');
        const d = new Date(dateStr);
        d.setUTCHours(Number(timeParts[0]), Number(timeParts[1]), 0, 0);
        return d;
    };

    const inicioDate = timeToDate(dataBase, hora_inicio);
    const fimDate = timeToDate(dataBase, hora_fim);
    const dataLancamentoDate = new Date(`${dataBase}T12:00:00Z`);

    let duracaoHoras = 0;
    if (inicioDate && fimDate) {
        const diffMs = fimDate.getTime() - inicioDate.getTime();
        duracaoHoras = diffMs / (1000 * 60 * 60);
    }

    // --- CORREÇÃO DO MOTIVO ---
    // Como a coluna 'motivo_edicao' não existe no banco, 
    // vamos concatenar o motivo dentro da 'descricao' para não perder a informação.
    let descricaoFinal = descricao || "";
    if (motivo_edicao && motivo_edicao.trim() !== "") {
        descricaoFinal = `${descricaoFinal} | [Motivo Edição: ${motivo_edicao}]`;
    }

    // 2. ATUALIZAÇÃO NO PRISMA
    const lancamentoAtualizado = await prisma.lancamentos_de_horas.update({
      where: { lancamento_id: idLancamento },
      data: {
        projetos: { connect: { projeto_id: idProjeto } },
        atividades: { connect: { atividade_id: idAtividade } },
        // Lógica condicional para cliente (só conecta se tiver ID)
        ...(idCliente && { clientes: { connect: { cliente_id: idCliente } } }),
        
        data_lancamento: dataLancamentoDate,
        hora_inicio: inicioDate,
        hora_fim: fimDate,
        duracao_total: duracaoHoras,
        
        descricao: descricaoFinal, // Salvamos aqui!
        
        // motivo_edicao: motivo_edicao <-- REMOVIDO POIS NÃO EXISTE NO BANCO
      },
    });

    console.log("=== SUCESSO ===");
    res.json(lancamentoAtualizado);

  } catch (error) {
    console.error("ERRO NO UPDATE:", error);
    
    if (error.code === 'P2025') return res.status(404).json({ error: "Lançamento não encontrado." });
    if (error.code === 'P2003') return res.status(400).json({ error: "Projeto ou Atividade informados não existem." });
    
    res.status(500).json({ error: "Erro interno no servidor", details: error.message });
  }
});

// DELETE /lancamentos/:id
app.delete('/lancamentos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lancamentos_de_horas.delete({
      where: { lancamento_id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir." });
  }
});

// PATCH /lancamentos/:id/status
app.patch('/lancamentos/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, cargo } = req.body;
  if (cargo !== 'gerente') return res.status(403).json({ error: "Apenas gerentes podem aprovar horas." });
  try {
    const atualizado = await prisma.lancamentos_de_horas.update({
      where: { lancamento_id: parseInt(id) },
      data: { status_aprovacao: status }
    });
    res.status(200).json(atualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status.' });
  }
});

// GET /dashboard/stats/:usuario_id
app.get('/dashboard/stats/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const usuario = await prisma.usuarios.findUnique({ where: { usuario_id: Number(usuario_id) } });
    if (!usuario?.colaborador_id) return res.status(404).json({ error: "Colaborador não encontrado" });

    // Ajuste Datas (UTC-3 fixo simples ou UTC)
    const agora = new Date();
    const hojeLocal = new Date(agora.getTime() - (3 * 60 * 60 * 1000)); 
    const inicioHoje = new Date(hojeLocal); inicioHoje.setUTCHours(0, 0, 0, 0);
    const fimHoje = new Date(hojeLocal); fimHoje.setUTCHours(23, 59, 59, 999);
    
    const inicioOntem = new Date(inicioHoje); inicioOntem.setUTCDate(inicioHoje.getUTCDate() - 1);
    const fimOntem = new Date(fimHoje); fimOntem.setUTCDate(fimHoje.getUTCDate() - 1);
    const seteDiasAtras = new Date(inicioHoje); seteDiasAtras.setUTCDate(inicioHoje.getUTCDate() - 6);

    const horasHoje = await prisma.lancamentos_de_horas.aggregate({
      _sum: { duracao_total: true },
      where: { colaborador_id: usuario.colaborador_id, data_lancamento: { gte: inicioHoje, lte: fimHoje } }
    });
    const horasOntem = await prisma.lancamentos_de_horas.aggregate({
      _sum: { duracao_total: true },
      where: { colaborador_id: usuario.colaborador_id, data_lancamento: { gte: inicioOntem, lte: fimOntem } }
    });

    const totalHoje = Number(horasHoje._sum.duracao_total || 0);
    const totalOntem = Number(horasOntem._sum.duracao_total || 0);
    let diferencaPercentual = 0;
    if (totalOntem > 0) {
      diferencaPercentual = ((totalHoje - totalOntem) / totalOntem) * 100;
    } else if (totalHoje > 0) {
      diferencaPercentual = 100;
    }

    const lancamentosSemana = await prisma.lancamentos_de_horas.groupBy({
      by: ['data_lancamento'],
      _sum: { duracao_total: true },
      where: { colaborador_id: usuario.colaborador_id, data_lancamento: { gte: seteDiasAtras, lte: fimHoje } },
      orderBy: { data_lancamento: 'asc' }
    });

    const diasSemanaNomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const mapaDeHoras = {};
    lancamentosSemana.forEach(item => {
        const dataObj = new Date(item.data_lancamento);
        const diaIndex = dataObj.getUTCDay();
        mapaDeHoras[diaIndex] = Number(item._sum.duracao_total || 0);
    });
    const graficoData = diasSemanaNomes.map((nome, index) => ({
        dia: nome,
        horas: Number((mapaDeHoras[index] || 0).toFixed(1))
    }));
    const META_DIARIA = 8;
    const produtividadeReal = Math.min(Math.round((totalHoje / META_DIARIA) * 100), 100);

    res.json({
      totalHoje: Number(totalHoje.toFixed(1)),
      percentual: Math.round(diferencaPercentual),
      produtividade: produtividadeReal,
      grafico: graficoData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// Inicialização
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`👉 Teste em: http://localhost:${PORT}`);
});