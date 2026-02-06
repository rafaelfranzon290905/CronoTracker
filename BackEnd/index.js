require('dotenv').config();
// Importações
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura';


const { PrismaClient } = require('@prisma/client');
// const { boolean } = require('fast-check');
// const { error } = require('effect/Brand');
// const database = require('mime-db');

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


// Rotas de Clientes

// GET /clientes - Lista todos os clientes (NOVA ROTA)
app.get('/clientes', async (req, res) => {
  try {
    const todosClientes = await prisma.clientes.findMany({
      // Opcional: ordenar por cliente_id para garantir a ordem
      orderBy: {
        cliente_id: 'asc',
      },
    });
    res.status(200).json(todosClientes);
  } catch (error) {
    console.error('Erro ao buscar todos os clientes:', error);
    res.status(500).json({ error: 'Erro interno ao listar clientes.' });
  }
});

// Get clientes
app.get('/clientes/cnpj/:cnpj', async (req, res) => {
  const cnpjLimpo = req.params.cnpj.replace(/[^\d]/g, '');

  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ error: 'formato de CNPJ inválido. Deve ter 14 dígitos.' });
  }

  try {
    // 🔎 Prisma: Usa findUnique para buscar um registro pela chave única (CNPJ)
    const cliente = await prisma.clientes.findUnique({
      where: {
        cnpj: cnpjLimpo, // Assumindo que 'cnpj' é um campo único no seu modelo 'clientes'
      },
      select: {
        cliente_id: true, // Ou 'id', dependendo do nome exato no seu schema
        nome_empresa: true,
      },
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

// POST /clientes - Cadastra um novo cliente
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
    // 🚨 Aqui está a correção para o "Adicionar"
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

// DELETE /clientes - Exclui um cliente
app.delete('/clientes/:id', async (req, res) => {
  const clienteId = parseInt(req.params.id);

  // Validação simples
  if (isNaN(clienteId)) {
    return res.status(400).json({ error: 'ID do cliente inválido.' });
  }
  try {
    // Prisma usa delete para remover um registro pelo ID
    const clienteDeletado = await prisma.clientes.delete({
      where: {
        cliente_id: clienteId,
      },
    });
    // Se for bem sucedida
    res.status(200).json({ message: 'Cliente excluido com sucesso.', cliente: clienteDeletado });

  } catch (error) {
    if (error.code == 'P2025') {
      return res.status(404).json({ error: `Cliente com ID ${clienteId} não encontrado` });
    }
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'Este cliente não pode ser excluído porque possui projetos ou horas lançadas no sistema.' 
      });
    }
    console.error('Erro ao deletar o cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao tentar deletar cliente' });
  }
})

app.put('/clientes/:id', async (req, res) => {
  const clienteId = Number(req.params.id)
  const {
    cnpj,
    nome_cliente,
    nome_contato,
    cep,
    endereco,
    cidade,
    estado,
    status
  } = req.body

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
        return res.status(409).json({
          code: 'CNPJ_DUPLICADO',
          message: 'CNPJ já existente'
        })
      }
    }

    const clienteAtualizado = await prisma.clientes.update({
      where: { cliente_id: clienteId },
      data: {
        cnpj: cnpjLimpo, 
        nome_cliente,
        nome_contato,
        cep,
        endereco,
        cidade,
        estado,
        status
      }
    })

    return res.status(200).json(clienteAtualizado)

  } catch (error) {
    // Segurança extra
    if (error.code === 'P2002') {
      return res.status(409).json({
        code: 'CNPJ_DUPLICADO',
        message: 'CNPJ já existente'
      })
    }

    console.error(error)
    return res.status(500).json({ message: 'Erro interno' })
  }
})

// GET /clientes/:id/projetos - Lista todos os projetos de um cliente específico
app.get('/clientes/:id/projetos', async (req, res) => {
  const clienteId = parseInt(req.params.id);

  if (isNaN(clienteId)) {
    return res.status(400).json({ error: 'ID do cliente inválido.' });
  }

  try {
    const projetosDoCliente = await prisma.projetos.findMany({
      where: {
        cliente_id: clienteId,
      },
      orderBy: {
        projeto_id: 'desc',
      },
    });

    res.status(200).json(projetosDoCliente);
  } catch (error) {
    console.error(`Erro ao buscar projetos do cliente ${clienteId}:`, error);
    res.status(500).json({ error: 'Erro interno ao buscar projetos do cliente.' });
  }
});

// Rotas de Colaboradores

//get para listagem
app.get('/colaboradores', async (req, res) => {
  try {
    const colaboradores = await prisma.colaboradores.findMany({
      include: {
        projeto_colaboradores: {
          include: {
            projetos: {
              include: { 
                atividades: true, // Traz as atividades de cada projeto
                clientes: true
              }
            }
          }
        }
      },
      orderBy: { nome_colaborador: 'asc' }
    });

    const colaboradoresFormatados = colaboradores.map(col => {
      // Extrai apenas os nomes dos projetos em um array simples de strings
      const projetosNomes = col.projeto_colaboradores.map(pc => pc.projetos?.nome_projeto).filter(Boolean);

      // Extrai todas as atividades de todos os projetos que ele participa
      const atividadesEquipe = col.projeto_colaboradores.flatMap(pc => pc.projetos?.atividades || []);

      return {
        ...col,
        foto: col.foto ? col.foto.toString('base64') : null,
        listaProjetos: projetosNomes,
        atividadesEquipe: atividadesEquipe // Nova propriedade com a lista da equipe
      };
    });

    res.status(200).json(colaboradoresFormatados);
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    res.status(500).json({ error: 'Erro ao buscar lista de colaboradores' });
  }
});

// GET /colaboradores/email/:email - Verifica se um colaborador existe pelo EMAIL
// Exemplo de uso: /colaboradores/email/joao@empresa.com
app.get('/colaboradores/email/:email', async (req, res) => {
  const { email } = req.params;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Formato de e-mail inválido.' });
  }

  try {
    const colaborador = await prisma.colaboradores.findUnique({
      where: {
        email: email,
      }
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

// POST /colaboradores - Cadastra um novo colaborador
app.post('/colaboradores', async (req, res) => {
  const { nome_colaborador, cargo, email, data_admissao, status, foto } = req.body;

  if (!email || !nome_colaborador || !cargo) {
    return res.status(400).json({ error: 'Nome, Cargo e E-mail são obrigatórios.' });
  }

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

    // Adicionamos o 'return' aqui para parar a execução
    return res.status(201).json(novoColaborador);

  } catch (error) {
    // O bloco catch agora envolve TODA a lógica de erro
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este e-mail já está cadastrado para outro colaborador.' });
    }

    console.error('Erro ao cadastrar colaborador:', error);
    // O return aqui impede que qualquer código abaixo (se houvesse) rodasse
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

app.get('/atividades', async (req, res) => {
  try {
    const atividades = await prisma.atividades.findMany({
      include: { responsavel: true, projetos: { select: { nome_projeto: true } } },
      orderBy: { atividade_id: 'asc' },
    });
    const somaHoras = await prisma.lancamentos_de_horas.groupBy({
      by: ['atividade_id'],
      _sum: { duracao_total: true }
    });
    const result = atividades.map(atv => {
      const lanc = somaHoras.find(l => l.atividade_id === atv.atividade_id);
      return { ...atv, horas_gastas: lanc?._sum?.duracao_total || 0 };
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar atividades.' });
  }
});

app.get('/atividades/:atividade_id', async (req, res) => {
  const atividadeId = Number(req.params.atividade_id);
  try {
    const atividade = await prisma.atividades.findUnique({
      where: { atividade_id: atividadeId },
      include: { responsavel: true, projetos: true, lancamentos_de_horas: { include: { colaboradores: { select: { nome_colaborador: true } } } } }
    });
    if (!atividade) return res.status(404).json({ error: "Não encontrada." });
    res.json(atividade);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar atividade." });
  }
});

app.post('/atividades', async (req, res) => {
  const { nome_atividade, descr_atividade, data_prevista_inicio, data_prevista_fim, projeto_id, colaborador_id, horas_gastas, status } = req.body;
  if (!projeto_id) return res.status(400).json({ error: 'projeto_id obrigatório.' });

  try {
    const projetoIdNum = Number(projeto_id);
    const dataInicio = data_prevista_inicio ? new Date(data_prevista_inicio + 'T12:00:00Z') : new Date();
    const dataFim = data_prevista_fim ? new Date(data_prevista_fim + 'T12:00:00Z') : null;
    
    // Converte status para Boolean (se vier string do formulário)
    const statusBoolean = (status === 'true' || status === true || status === 'Ativa');

    const novaAtividade = await prisma.atividades.create({
      data: {
        nome_atividade,
        descr_atividade: descr_atividade || "",
        data_prevista_inicio: dataInicio,
        data_prevista_fim: dataFim,
        horas_gastas: Number(horas_gastas) || 0,
        status: statusBoolean,
        projetos: { connect: { projeto_id: projetoIdNum } },
        ...(colaborador_id && { responsavel: { connect: { colaborador_id: Number(colaborador_id) } } })
      }
    });

    // Recalcula horas no projeto
    const soma = await prisma.atividades.aggregate({ where: { projeto_id: projetoIdNum }, _sum: { horas_gastas: true } });
    await prisma.projetos.update({ where: { projeto_id: projetoIdNum }, data: { horas_gastas: soma._sum.horas_gastas || 0 } });

    res.status(201).json(novaAtividade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cadastrar atividade.' });
  }
});

app.put('/atividades/:atividade_id', async (req, res) => {
  const { atividade_id } = req.params;
  const { nome_atividade, descr_atividade, data_prevista_inicio, data_prevista_fim, horas_gastas, status, projeto_id, colaborador_id } = req.body;

  try {
    const dataInicio = data_prevista_inicio ? new Date(data_prevista_inicio + 'T12:00:00Z') : null;
    const dataFim = data_prevista_fim ? new Date(data_prevista_fim + 'T12:00:00Z') : null;
    const statusBoolean = (status === 'true' || status === true || status === 'Ativa');

    const atualizada = await prisma.atividades.update({
      where: { atividade_id: Number(atividade_id) },
      data: {
        nome_atividade,
        descr_atividade: descr_atividade || "",
        data_prevista_inicio: dataInicio,
        data_prevista_fim: dataFim,
        horas_gastas: Number(horas_gastas) || 0,
        status: statusBoolean,
        projetos: { connect: { projeto_id: Number(projeto_id) } },
        responsavel: colaborador_id ? { connect: { colaborador_id: Number(colaborador_id) } } : { disconnect: true }
      }
    });

    const soma = await prisma.atividades.aggregate({ where: { projeto_id: Number(projeto_id) }, _sum: { horas_gastas: true } });
    await prisma.projetos.update({ where: { projeto_id: Number(projeto_id) }, data: { horas_gastas: soma._sum.horas_gastas || 0 } });

    res.status(200).json(atualizada);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar atividade." });
  }
});

app.delete('/atividades/:atividade_id', async (req, res) => {
  const id = Number(req.params.atividade_id);
  try {
    await prisma.atividades.delete({ where: { atividade_id: id } });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar." });
  }
});
// ----------------------------------------------------
// 🎯 ROTAS DE PROJETOS
// ----------------------------------------------------
// GET /projetos - Listar Projetos (com dados do Cliente)
app.get('/projetos', async (req, res) => {
  try {
    const totalLancamentos = await prisma.lancamentos_de_horas.count();
    // console.log("DEBUG RENDER - Total de lançamentos no banco:", totalLancamentos);
    const projetos = await prisma.projetos.findMany({
      include: {
        clientes: {
          select: { nome_cliente: true }
        },
        atividades: {
          select: {
            atividade_id: true,
            nome_atividade: true,
            status: true
          }
        },
        projeto_colaboradores: {
          include: {
            colaboradores: true
          }
        }
      },
      orderBy: { projeto_id: 'desc' }
    });
    const agregacaoHoras = await prisma.lancamentos_de_horas.groupBy({
      by: ['projeto_id'],
      _sum: {
        duracao_total: true
      }
    });

    const projetosComHoras = projetos.map(projeto => {
      const calculo = agregacaoHoras.find(h => Number(h.projeto_id) === Number(projeto.projeto_id));
      const total = calculo?._sum?.duracao_total || 0;
      
      return {
        ...projeto,
        horas_consumidas: total, 
        horas_gastas: total
      };
    });

    // console.log("Exemplo de projeto: ", JSON.stringify(projetos[0], null, 2));
    res.status(200).json(projetosComHoras);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao listar projetos.' });
  }
});

app.get('/projetos/:id', async (req, res) => {
  const { id } = req.params;
  const projetoId = parseInt(id);

  if (isNaN(projetoId)) {
    return res.status(400).json({ error: "ID do projeto inválido." });
  }

  try {
    const [projeto, somaDespesas, somaHoras] = await Promise.all([
      prisma.projetos.findUnique({
        where: { projeto_id: projetoId },
        include: {
          clientes: { select: { nome_cliente: true } },
          atividades: { orderBy: { atividade_id: 'asc' } },
          projeto_colaboradores: { include: { colaboradores: true } },
          despesas: { 
            orderBy: { data_despesa: 'desc' },
            include: { colaborador: { select: { nome_colaborador: true } } }
          }
        }
      }),

      prisma.despesas.aggregate({
        where: { 
          projeto_id: projetoId,
          status_aprovacao: "Aprovada" 
        },
        _sum: { valor: true }
      }),

      prisma.lancamentos_de_horas.aggregate({
        where: { projeto_id: projetoId },
        _sum: { duracao_total: true }
      })
    ]);

    if (!projeto) {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }

    res.status(200).json({
      ...projeto,
      horas_consumidas: somaHoras._sum.duracao_total || 0,
      horas_gastas: somaHoras._sum.duracao_total || 0,
      total_despesas: Number(somaDespesas._sum.valor) || 0
    });

  } catch (error) {
    console.error(`Erro ao buscar projeto ${id}:`, error);
    res.status(500).json({ error: 'Erro interno ao buscar detalhes do projeto.' });
  }
});

// POST /projetos - Criar Projeto
app.post('/projetos', async (req, res) => {
  const { cliente_id, nome_projeto, descricao, data_inicio, data_fim, status, horas_previstas, colaboradores_ids } = req.body;

  if (!cliente_id || !nome_projeto || !data_inicio || !data_fim) {
    return res.status(400).json({ error: 'Campos obrigatórios: Cliente, Nome, Data Início, Data Fim.' });
  }

  try {
    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    if (fim < inicio) {
      return res.status(400).json({ error: 'A Data Prevista de Fim não pode ser anterior à Data de Início.' });
    }
    const projetoExistente = await prisma.projetos.findFirst({
      where: {
        cliente_id: parseInt(cliente_id),
        nome_projeto: {
          equals: nome_projeto,
          mode: 'insensitive'
        }
      }
    });

    if (projetoExistente) {
      return res.status(409).json({ error: `Este cliente já possui um projeto chamado "${nome_projeto}".` });
    }

    // Criação
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
          create: (colaboradores_ids || []).map(id => ({
            colaborador_id: id
          }))
        }
      }
    });

    res.status(201).json(novoProjeto);

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    res.status(500).json({ error: 'Erro interno ao criar projeto.' });
  }
});

// PUT /projetos/:id - Atualizar Projeto
app.put('/projetos/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente_id, nome_projeto, descricao, data_inicio, data_fim, status, horas_previstas, colaboradores_ids } = req.body;

  try {
    if (data_inicio && data_fim) {
      if (new Date(data_fim) < new Date(data_inicio)) {
        return res.status(400).json({ error: 'A Data Prevista de Fim não pode ser anterior à Data de Início.' });
      }
    }

    if (cliente_id && nome_projeto) {
      const duplicado = await prisma.projetos.findFirst({
        where: {
          cliente_id: parseInt(cliente_id),
          nome_projeto: { equals: nome_projeto, mode: 'insensitive' },
          projeto_id: { not: parseInt(id) }
        }
      });
      if (duplicado) return res.status(409).json({ error: 'Nome de projeto já existe para este cliente.' });
    }

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
          create: (colaboradores_ids || []).map(idColab => ({
            colaborador_id: parseInt(idColab)
          }))
        }
      },
      include: {
        projeto_colaboradores: {
          include: {
            colaboradores: true
          }
        }
      }
    });

    res.status(200).json(projetoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    res.status(500).json({ error: 'Erro ao atualizar projeto.' });
  }
});

// DELETE /projetos/:id - Excluir Projeto
app.delete('/projetos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.projetos.delete({
      where: { projeto_id: parseInt(id) }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir projeto:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Projeto não encontrado.' });
    }
    res.status(500).json({ error: 'Erro interno ao excluir projeto.' });
  }
});

// POST /despesas - Cadastro de Despesa
app.post('/despesas', async (req, res) => {
  const { projeto_id, colaborador_id, tipo_despesa, data_despesa, valor, descricao, anexo } = req.body;

  if (!projeto_id || !colaborador_id || !tipo_despesa || !data_despesa || !valor || !descricao || !anexo) {
    return res.status(400).json({ error: "Todos os campos, incluindo o anexo, são obrigatórios." });
  }

  const tiposPermitidos = ["Transporte", "Refeição", "Estadia", "Outros"];
  if (!tiposPermitidos.includes(tipo_despesa)) {
    return res.status(400).json({ error: "Tipo de despesa inválido." });
  }

  const valorNumerico = parseFloat(valor);
  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ error: "O valor da despesa deve ser maior que zero." });
  }

  const dataLancamento = new Date(data_despesa);
  const hoje = new Date();
  if (dataLancamento > hoje) {
    return res.status(400).json({ error: "A data da despesa não pode ser futura." });
  }

  if (descricao.trim().length < 5) {
    return res.status(400).json({ error: "A descrição deve ter no mínimo 5 caracteres." });
  }

  try {
    const projeto = await prisma.projetos.findUnique({ where: { projeto_id: Number(projeto_id) } });
    
    if (!projeto) {
      return res.status(404).json({ error: "Projeto não encontrado." });
    }

    if (projeto.status === false) { 
      return res.status(400).json({ error: "Não é permitido lançar despesas em projetos inativos ou encerrados." });
    }

    const novaDespesa = await prisma.despesas.create({
      data: {
        projeto_id: Number(projeto_id),
        colaborador_id: Number(colaborador_id),
        tipo_despesa,
        data_despesa: dataLancamento,
        valor: valorNumerico,
        descricao,
        anexo, 
        status_aprovacao: "Pendente" 
      }
    });

    res.status(201).json(novaDespesa);
  } catch (error) {
    console.error("Erro ao cadastrar despesa:", error);
    res.status(500).json({ error: "Erro interno ao processar o lançamento da despesa." });
  }
});

// PATCH /despesas/:id/status - Aprovar ou Reprovar Despesa (Apenas Gerentes)
app.patch('/despesas/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, motivo_reprovacao, cargo } = req.body; 

  if (!cargo || cargo.toLowerCase() !== 'gerente') {
    return res.status(403).json({ error: "Acesso negado. Apenas gerentes podem aprovar despesas." });
  }

  const statusPermitidos = ["Aprovada", "Reprovada", "Pendente"];
  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({ error: "Status inválido." });
  }

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
    res.status(500).json({ error: 'Erro interno ao processar aprovação.' });
  }
});

// GET /despesas - Lista todas as despesas 
app.get('/despesas', async (req, res) => {
  const { status } = req.query;
  console.log("Filtro recebido na URL:", status);
  try {
    const despesas = await prisma.despesas.findMany({
      where: status ? { status_aprovacao: status } : {},
      include: {
        colaborador: { select: { nome_colaborador: true } },
        projeto: { select: { nome_projeto: true } }
      },
      orderBy: { data_despesa: 'desc' }
    });
    console.log(`Foram encontradas ${despesas.length} despesas.`);
    res.status(200).json(despesas);
  } catch (error) {
    console.error("Erro ao listar despesas:", error);
    res.status(500).json({ error: "Erro interno ao buscar despesas." });
  }
});

// Rotas de Login
app.post('/login', async (req, res) => {
  const { nome_usuario, senha } = req.body;

  if (!nome_usuario || !senha) {
    return res.status(400).json({ error: "Nome de usuário e senha são obrigatórios." });
  }

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { nome_usuario },
    });
    if (!usuario) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.hash_senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign(
            { 
                usuarioId: usuario.usuario_id, 
                cargo: usuario.cargo, // ✅ Incluir o cargo para RBAC
                nomeUsuario: usuario.nome_usuario,
                colaborador_id: usuario.colaborador_id 
            }, 
            JWT_SECRET, 
            { expiresIn: '8h' } // Token expira em 8 horas
        );

        // 4. Retornar o token e dados do usuário (sem a senha!)
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
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});


// PUT /colaboradores/:id - Atualiza colaborador
app.put('/colaboradores/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome_colaborador, cargo, email, status, foto, data_admissao } = req.body;

  console.log(`[PUT] Tentativa de atualização para ID: ${id}`);

  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  // Debug: Verificar cabeçalhos para ajudar no diagnóstico
  const contentType = req.headers['content-type'];
  console.log(`[PUT] Content-Type recebido: ${contentType}`);

  // Verifica se o body está vazio
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error('[PUT] Erro: req.body vazio.');

    // Feedback específico se o Content-Type estiver errado
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Erro de Formato: O servidor espera JSON. Verifique se o frontend está enviando headers: {"Content-Type": "application/json"}.'
      });
    }

    return res.status(400).json({ error: 'Nenhum dado recebido. O corpo da requisição está vazio.' });
  }

  console.log('[PUT] Dados recebidos:', { nome_colaborador, cargo, email, status, temFoto: !!foto });

  const dadosParaAtualizar = {
    nome_colaborador,
    cargo,
    email,
    status
  };

  // Só adiciona a foto se ela foi enviada (para não apagar a existente se vier null/undefined)
  if (foto) {
    dadosParaAtualizar.foto = Buffer.from(foto, 'base64');
  }
  // Só atualiza data_admissao se fornecida
  if (data_admissao) {
    dadosParaAtualizar.data_admissao = new Date(data_admissao);
  }

  try {
    const colaboradorAtualizado = await prisma.colaboradores.update({
      where: { colaborador_id: id },
      data: dadosParaAtualizar,
    });

    console.log('[PUT] Sucesso ID:', colaboradorAtualizado.colaborador_id);
    res.status(200).json(colaboradorAtualizado);

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: `Colaborador ID ${id} não encontrado.` });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'E-mail já está em uso.' });
    }
    console.error('[PUT] Erro:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar.' });
  }
});

// DELETE /colaboradores/:id - Exclui um colaborador
app.delete('/colaboradores/:id', async (req, res) => {

  const id = parseInt(req.params.id);

  try {
    const colabId = parseInt(id);

    await prisma.$transaction(async (tx) => {
      // Inativa o Colaborador
      await tx.colaboradores.update({
        where: { colaborador_id: colabId },
        data: { status: false }
      });

      // Inativa o Usuário que aponta para este colaborador
      await tx.usuarios.updateMany({
        where: { colaborador_id: colabId },
        data: { status: false }
      });
    });

    res.status(200).json({ message: 'Colaborador e Usuário inativados com sucesso.' });

  } catch (error) {
    console.error('[DELETE] Erro no Prisma:', error);

    // Erro P2025: Registro não encontrado
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Colaborador não encontrado.' });
    }

    // Erro P2003: Chave estrangeira (tem vínculos)
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Não é possível excluir: Este colaborador possui vínculos (vendas/projetos). Tente inativá-lo.'
      });
    }

    res.status(500).json({ error: 'Erro interno ao excluir colaborador.' });
  }
});

// ----------------------------------------------------
// 🎯 ROTAS DE USUÁRIOS (GESTÃO E PERMISSÕES)
// ----------------------------------------------------

// GET /usuarios - Listar Usuários
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await prisma.usuarios.findMany({
      select: {
        usuario_id: true,
        nome_usuario: true,
        nome_completo: true,
        email: true,
        cargo: true,
        status: true,
        // hash_senha: false <-- Segurança: Nunca enviar o hash
      },
      orderBy: { nome_completo: 'asc' }
    });
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro interno ao listar usuários.' });
  }
});

// POST /usuarios - Criar novo usuário
app.post('/usuarios', async (req, res) => {
  const { nome_usuario, senha, nome_completo, email, cargo } = req.body;

  if (!nome_usuario || !senha || !email) {
    return res.status(400).json({ error: 'Usuário, senha e e-mail são obrigatórios.' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash_senha = await bcrypt.hash(senha, salt);

    const novoUsuario = await prisma.$transaction(async (tx) => {
      // data: {
      //     nome_usuario,
      //     hash_senha,
      //     nome_completo,
      //     email,
      //     cargo: cargo || 'Colaborador',
      //     status: true
      // }
      const colaborador = await tx.colaboradores.create({
        data: {
          nome_colaborador: nome_completo,
          email: email,
          cargo: cargo || 'Colaborador',
          data_admissao: new Date(), // Data padrão de hoje
          status: true
        }
      });

      // Cria o usuário vinculado ao colaborador criado acima
      const usuario = await tx.usuarios.create({
        data: {
          nome_usuario,
          hash_senha,
          nome_completo,
          email,
          cargo: cargo || 'Colaborador',
          status: true,
          colaborador_id: colaborador.colaborador_id
        }
      });

      return usuario;
    });

    // Remove a senha do objeto de retorno
    const { hash_senha: _, ...userSemSenha } = novoUsuario;
    res.status(201).json({ message: "Usuário e Colaborador criados com sucesso!", userSemSenha });

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Usuário ou E-mail já cadastrados.' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

// PUT /usuarios/:id 
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_completo, email, cargo, status, senha, nome_usuario } = req.body;

  try {
    const usuarioIdNum = parseInt(id);
    const dadosParaAtualizar = {
      nome_completo,
      email,
      cargo,
      status,
      nome_usuario
    };

    if (senha && senha.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      dadosParaAtualizar.hash_senha = await bcrypt.hash(senha, salt);
    }
    const resultado = await prisma.$transaction(async (tx) => {
      // Busca o usuário para garantir que existe e pegar o vínculo
      const usuarioOriginal = await tx.usuarios.findUnique({
        where: { usuario_id: usuarioIdNum }
      });

      if (!usuarioOriginal) {
        throw new Error("P2025");
      }

      // Atualiza o Usuário
      const usuarioAtualizado = await tx.usuarios.update({
        where: { usuario_id: usuarioIdNum },
        data: dadosParaAtualizar
      });

      // sincroniza status com o Colaborador
      if (status !== undefined && usuarioOriginal.colaborador_id) {
        await tx.colaboradores.update({
          where: { colaborador_id: usuarioOriginal.colaborador_id },
          data: { status: status }
        });
      }

      return usuarioAtualizado;
    });

    const { hash_senha: _, ...userSemSenha } = resultado;
    res.status(200).json(userSemSenha);

  } catch (error) {
    if (error.code === 'P2002' || error.message.includes('unique constraint')) {
      return res.status(409).json({ error: 'Conflito: Usuário ou E-mail já existem.' });
    }
    if (error.code === 'P2025' || error.message === "P2025") {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário.' });
  }
});


app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioIdNum = parseInt(id);

    await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuarios.findUnique({
        where: { usuario_id: usuarioIdNum },
        select: { colaborador_id: true }
      });
      if (!usuario) throw new Error("Usuário não encontrado");
      await tx.usuarios.update({
        where: { usuario_id: usuarioIdNum },
        data: { status: false }
      });
      if (usuario.colaborador_id) {
        await tx.colaboradores.update({
          where: { colaborador_id: usuario.colaborador_id },
          data: { status: false }
        });
      }
    });
    res.status(200).json({ message: 'Usuário e Colaborador inativados com sucesso.' });
  } catch (error) {
    console.error('Erro ao inativar usuário:', error);
    res.status(500).json({ error: 'Erro ao inativar usuário.' });
  }
});

// ROTAS DE TIMESHEETS

// GET /lancamentos - Lista as horas (Filtra por usuário ou traz tudo se for gerente)
app.get('/lancamentos', async (req, res) => {
  const { usuario_id, cargo } = req.query;

  try {
    let whereClause = {};
    
    // Se NÃO for gerente OU se for gerente mas NÃO estiver pedindo para ver a equipe
    if (cargo !== 'gerente' && usuario_id) {
      const usuario = await prisma.usuarios.findUnique({
        where: { usuario_id: Number(usuario_id) },
        select: { colaborador_id: true }
      });
      
      if (usuario?.colaborador_id) {
        whereClause.colaborador_id = usuario.colaborador_id;
      }
    }

    const lancamentos = await prisma.lancamentos_de_horas.findMany({
      where: whereClause,
      include: {
        colaboradores: { select: { nome_colaborador: true } },
        projetos: { select: { nome_projeto: true } },
        clientes: { select: { nome_cliente: true } },
        atividades: { select: { nome_atividade: true } }
      },
      orderBy: { data_lancamento: 'desc' } // Ordenar pela data do trabalho, não da criação
    });

    res.status(200).json(lancamentos);
  } catch (error) {
    console.error('Erro ao buscar lançamentos:', error);
    res.status(500).json({ error: 'Erro ao listar horas.' });
  }
});

// POST /lancamentos
app.post('/lancamentos', async (req, res) => {
  // Ajustado para receber 'data' e 'cliente_id' vindos do front
  const { 
    usuario_id, projeto_id, atividade_id, cliente_id,
    data, hora_inicio, hora_fim, descricao, tipo_lancamento 
  } = req.body;

  // console.log("Dados recebidos no backend:", req.body); // Log para debug

  // --- NOVA VALIDAÇÃO DE DATA FUTURA ---
  const dataLancamento = new Date(`${data}T00:00:00`); // Usar data local para comparar dia
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas os dias

  if (dataLancamento > hoje) {
    return res.status(400).json({ error: "Não é permitido lançar horas em datas futuras." });
  }

  try {
    if (!usuario_id) {
      return res.status(400).json({ error: "ID do usuário não fornecido." });
    }
    // Busca o usuário para confirmar o cargo e o ID do colaborador vinculado
    const usuario = await prisma.usuarios.findUnique({
      where: { usuario_id: Number(usuario_id) }
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (!usuario.colaborador_id) {
      return res.status(400).json({ error: "Este usuário não possui um colaborador vinculado." });
    }

    // Regra: Gerentes têm aprovação automática
    const statusInicial = 'aprovado';

    // 1. Preparar a data base para as horas (evita confusão de fuso horário)
    const dataBase = data; // '2026-01-14'

    // 2. Converter as strings "12:00" em objetos Date válidos para o Prisma
    const inicioDate = new Date(`${dataBase}T${hora_inicio}:00Z`);
    const fimDate = new Date(`${dataBase}T${hora_fim}:00Z`);

    // 3. Calcular a duracao_total (opcional, mas recomendado já que a coluna existe)
    const diffMs = fimDate.getTime() - inicioDate.getTime();
    const duracaoHoras = diffMs / (1000 * 60 * 60);

    const novoLancamento = await prisma.lancamentos_de_horas.create({
      data: {
        colaborador_id: usuario.colaborador_id,
        projeto_id: Number(projeto_id),
        atividade_id: Number(atividade_id),
        cliente_id: Number(cliente_id),
        data_lancamento: new Date(`${dataBase}T12:00:00Z`), // 'data' vindo do front
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
    console.error("Erro Prisma:", error);
    res.status(500).json({ error: 'Erro interno ao registrar horas.' });
  }
});

// PATCH /lancamentos/:id/status - Aprovar ou Rejeitar (Apenas Gerentes)
app.patch('/lancamentos/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, cargo } = req.body; // status: 'aprovado' ou 'rejeitado'

  if (cargo !== 'gerente') {
    return res.status(403).json({ error: "Apenas gerentes podem aprovar horas." });
  }

  try {
    const atualizado = await prisma.lancamentos_de_horas.update({
      where: { lancamento_id: parseInt(id) },
      data: { status_aprovacao: status }
    });
    res.status(200).json(atualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar status do lançamento.' });
  }
});

// GET /dashboard/stats/:usuario_id
app.get('/dashboard/stats/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { usuario_id: Number(usuario_id) },
    });

    if (!usuario?.colaborador_id) return res.status(404).json({ error: "Colaborador não encontrado" });

    // ---DATAS---
    const agora = new Date();
    // Ajuste para o fuso de Brasília (UTC-3)
    const hojeLocal = new Date(agora.getTime() - (3 * 60 * 60 * 1000)); 

    const inicioHoje = new Date(hojeLocal);
    inicioHoje.setUTCHours(0, 0, 0, 0);

    const fimHoje = new Date(hojeLocal);
    fimHoje.setUTCHours(23, 59, 59, 999);

    // Para a porcentagem (Ontem)
    const inicioOntem = new Date(inicioHoje);
    inicioOntem.setUTCDate(inicioHoje.getUTCDate() - 1);

    const fimOntem = new Date(fimHoje);
    fimOntem.setUTCDate(fimHoje.getUTCDate() - 1);

    const seteDiasAtras = new Date(inicioHoje);
    seteDiasAtras.setUTCDate(inicioHoje.getUTCDate() - 6);

    // ---BUSCAS---
    // 1. Horas de Hoje
    const horasHoje = await prisma.lancamentos_de_horas.aggregate({
      _sum: { duracao_total: true },
      where: {
        colaborador_id: usuario.colaborador_id,
        data_lancamento: { gte: inicioHoje, lte: fimHoje }
      }
    });

const horasOntem = await prisma.lancamentos_de_horas.aggregate({
  _sum: { duracao_total: true },
  where: {
    colaborador_id: usuario.colaborador_id,
    data_lancamento: { gte: inicioHoje, lte: fimOntem }
  }
});

const totalHoje = Number(horasHoje._sum.duracao_total || 0);
const totalOntem = Number(horasOntem._sum.duracao_total || 0);

// Lógica da porcentagem
let diferencaPercentual = 0;
if (totalOntem > 0) {
  diferencaPercentual = ((totalHoje - totalOntem) / totalOntem) * 100;
} else if (totalHoje > 0) {
  diferencaPercentual = 100; // Se ontem foi 0 e hoje tem algo, cresceu 100%
}


    const lancamentosSemana = await prisma.lancamentos_de_horas.groupBy({
      by: ['data_lancamento'],
      _sum: { duracao_total: true },
      where: {
        colaborador_id: usuario.colaborador_id,
        data_lancamento: { gte: seteDiasAtras, lte: fimHoje }
      },
      orderBy: { data_lancamento: 'asc' }
    });

    // ---GRÁFICO---
    // Formatar dados para o gráfico (Recharts)
    const diasSemanaNomes = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    
    // Criamos um mapa para facilitar a busca
    const mapaDeHoras = {};
    lancamentosSemana.forEach(item => {
        const dataObj = new Date(item.data_lancamento);
        const diaIndex = dataObj.getUTCDay(); // Pega o dia da semana 0-6
        mapaDeHoras[diaIndex] = Number(item._sum.duracao_total || 0);
    });
    
    const graficoData = diasSemanaNomes.map((nome, index) => ({
        dia: nome,
        horas: Number((mapaDeHoras[index] || 0).toFixed(1))
    }));

    // Meta Diária e produtividade
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


// roda o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`👉 Teste em: http://localhost:${PORT}`);
});