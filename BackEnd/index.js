require('dotenv').config();
// Importações
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-muito-segura';


const { PrismaClient } = require('@prisma/client');
const { boolean } = require('fast-check');
const { error } = require('effect/Brand');

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
  // Nota: Os nomes dos campos devem bater exatamente com o seu 'schema.prisma'
  const { cnpj, nome_cliente, nome_contato, cep, endereco, cidade, estado, status } = req.body;

  if (!cnpj || !nome_cliente) {
    return res.status(400).json({ error: 'CNPJ e Nome da Empresa são obrigatórios.' });
  }
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

  try {
    // ✍️ Prisma: Usa create para inserir um novo registro
    const novoCliente = await prisma.clientes.create({
      data: {
        cnpj: cnpjLimpo,
        nome_cliente,
        nome_contato,
        cep,
        endereco,
        cidade,
        estado,
        status, // Deve ser um boolean se o seu modelo espera um boolean

      }
    });

    res.status(201).json(novoCliente);
  } catch (error) {
    // 🛑 Tratamento de Erro de Chave Única do Prisma
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Este CNPJ já está cadastrado (Violação de Chave Única).' });
    }
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
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
    console.error('Erro ao deletar o cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao tentar deletar cliente' });
  }
})

// PUT /clientes/:id - atualiza os dados de um cliente
app.put('/clientes/:id', async (req, res) => {
  // Extair e validar o ID
  const clienteId = parseInt(req.params.id);

  if (isNaN(clienteId)) {
    return res.status(400).json({ error: 'ID do cliente inválido.' });
  }
  // Extrair dados do corpo da requisição
  const {
    cnpj,
    nome_cliente,
    nome_contato,
    cep,
    endereco,
    cidade,
    estado,
    status
  } = req.body;

  // Prepara os dados para a atualização, limpando o CNPJ se ele existir
  const dadosParaAtualizar = {
    cnpj: cnpj ? cnpj.replace(/[^\d]/g, '') : undefined,
    nome_cliente,
    nome_contato,
    cep,
    endereco,
    cidade,
    estado,
    status,
  };
  try {
    const clienteAtualizado = await prisma.clientes.update({
      where: { cliente_id: clienteId },
      data: dadosParaAtualizar,
    });

    res.status(200).json(clienteAtualizado);

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: `Cliente com ID ${clienteId} não encontrado` });
    }
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno ao atualizar o cliente' });
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
                atividades: true // Traz as atividades de cada projeto
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

// Rota de Atividades
// GET /atividades - Lista todas as atividades

app.get('/atividades', async (req, res) => {
  try {
    const todasAtividades = await prisma.atividades.findMany({
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
    res.status(200).json(todasAtividades);
  } catch (error) {
    console.error('Erro ao buscar todos as atividades:', error);
    res.status(500).json({ error: 'Erro interno ao listar atividades.' });
  }
});

// 🎯 ROTA GET /atividades/:atividade_id - Busca uma única atividade
app.get('/atividades/:atividade_id', async (req, res) => {
  const atividadeId = Number(req.params.atividade_id);

  if (!Number.isInteger(atividadeId)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const atividade = await prisma.atividades.findUnique({
      where: { atividade_id: atividadeId },
      include: {
        responsavel: true,
        projetos: true
      }
    });

    if (!atividade) {
      return res.status(404).json({ error: "Atividade não encontrada." });
    }

    res.json(atividade);
  } catch (error) {
    console.error("Erro ao buscar atividade:", error);
    res.status(500).json({ error: "Erro ao buscar atividade." });
  }
});


// POST /atividades - Cadastra um novo cliente
app.post('/atividades', async (req, res) => {
  const { nome_atividade, descr_atividade, data_prevista_inicio, data_prevista_fim, projeto_id, colaborador_id } = req.body;

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
    // 2. CONVERSÃO DAS DATAS PARA OBJETO Date 
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
        status: statusBoolean, // ✅ Agora envia o valor booleano esperado pelo Postgres
        //         projeto_id: projetoIdNumerico, // Usa o ID numérico convertido
        //         colaborador_id: colaborador_id ? Number(colaborador_id) : null,
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

    res.status(201).json(novaAtividade);
  } catch (error) {
    // Tratamento de erro específico para chave estrangeira (P2003)
    if (error.code === 'P2003') {
      return res.status(404).json({ error: `O Projeto ID ${projeto_id} não existe.` });
    }

    console.error('Erro ao cadastrar atividade:', error);
    res.status(500).json({ error: 'Erro interno do servidor. Verifique os logs para detalhes.' });
  }
});

// Rota DELETE para Atividades

app.delete('/atividades/:atividade_id', async (req, res) => {
  const atividadeId = Number(req.params.atividade_id);

  if (!Number.isInteger(atividadeId)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const existe = await prisma.atividades.findUnique({
      where: { atividade_id: atividadeId }
    });

    if (!existe) {
      return res.status(404).json({ error: `Atividade ${atividadeId} não existe.` });
    }

    await prisma.atividades.delete({
      where: { atividade_id: atividadeId }
    });

    res.sendStatus(204);
  } catch (error) {
    console.error("Erro ao deletar:", error);
    res.status(500).json({ error: "Erro interno ao deletar." });
  }
});


// 🎯 ROTA PUT /atividades/:atividade_id - Atualiza uma atividade existente
app.put('/atividades/:atividade_id', async (req, res) => {
  const { atividade_id } = req.params;
  const {
    nome_atividade,
    descr_atividade,
    data_prevista_inicio, // String 'YYYY-MM-DD' ou null
    data_prevista_fim, // String 'YYYY-MM-DD' ou null
    status,
    projeto_id,
    colaborador_id
  } = req.body;

  try {
    const dataInicio = data_prevista_inicio ? new Date(data_prevista_inicio + 'T00:00:00Z') : null;
    const dataFim = data_prevista_fim ? new Date(data_prevista_fim + 'T00:00:00Z') : null;


    const atividadeAtualizada = await prisma.atividades.update({
      where: { atividade_id: Number(atividade_id) },
      data: {
        nome_atividade,
        descr_atividade: descr_atividade || "",
        data_prevista_inicio: dataInicio,
        data_prevista_fim: dataFim,
        status: Boolean(status),
        projetos: {
          connect: { projeto_id: Number(projeto_id) }
        },
        responsavel: colaborador_id
          ? { connect: { colaborador_id: Number(colaborador_id) } }
          : { disconnect: true }
      },
      include: {
        responsavel: true,
        projetos: true
      }
    });

    res.status(200).json(atividadeAtualizada);

  } catch (error) {
    // Erro: Atividade não encontrada no banco de dados (Prisma P2025)
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Atividade não encontrada para o ID fornecido." });
    }
    // Erro: Projeto ID não encontrado (Prisma P2003)
    if (error.code === 'P2003') {
      return res.status(404).json({ error: `O Projeto ID ${projeto_id} não existe.` });
    }

    console.error("Erro ao atualizar atividade:", error);
    res.status(500).json({ error: "Erro interno do servidor ao tentar atualizar a atividade." });
  }
});

// ----------------------------------------------------
// 🎯 ROTAS DE PROJETOS
// ----------------------------------------------------

// GET /projetos - Listar Projetos (com dados do Cliente)
app.get('/projetos', async (req, res) => {
  try {
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
    // console.log("Exemplo de projeto: ", JSON.stringify(projetos[0], null, 2));
    res.status(200).json(projetos);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao listar projetos.' });
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
        nomeUsuario: usuario.nome_usuario
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
// roda o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`👉 Teste em: http://localhost:${PORT}`);
});