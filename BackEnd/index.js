// Importações
const express = require('express');
const cors = require('cors');

require('dotenv').config();
const { PrismaClient } = require('./generated/prisma');
const { boolean } = require('fast-check');

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
        return res.status(400).json({ error: 'formato de CNPJ inválido. Deve ter 14 dígitos.'});
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
  const { cnpj, nome_cliente, nome_contato, cep, endereco, cidade, estado, status} = req.body;
  
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


// ----------------------------------------------------
// 🎯 ROTAS DE COLABORADORES
// ----------------------------------------------------

// GET /colaboradores/cpf/:cpf - Verifica se um colaborador existe pelo CPF
app.get('/colaboradores/cpf/:cpf', async (req, res) => {
  const cpfLimpo = req.params.cpf.replace(/[^\d]/g, '');

  if (cpfLimpo.length !== 11) {
    return res.status(400).json({ error: 'Formato de CPF inválido. Deve ter 11 dígitos.' });
  }

  try {
    // 🔎 Prisma: Usa findUnique para buscar um registro pela chave única (CPF)
    const colaborador = await prisma.colaboradores.findUnique({
      where: {
        cpf: cpfLimpo, // Assumindo que 'cpf' é um campo único no seu modelo 'colaboradores'
      },
      select: {
        colaborador_id: true, // Ou 'id', dependendo do nome exato no seu schema
        nome: true,
      },
    });
    
    if (colaborador) {
      res.status(200).json({ existe: true, colaborador: colaborador });
    } else {
      res.status(200).json({ existe: false });
    }
  } catch (error) {
    console.error('Erro ao verificar CPF:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// POST /colaboradores - Cadastra um novo colaborador
app.post('/colaboradores', async (req, res) => {
  // Nota: Os nomes dos campos devem bater exatamente com o seu 'schema.prisma'
  const { cpf, nome_colaborador, cargo, email, data_admissao, status, foto } = req.body;

  if (!cpf || !nome_colaborador) {
    return res.status(400).json({ error: 'CPF e Nome são obrigatórios.' });
  }
  const cpfLimpo = cpf.replace(/[^\d]/g, '');

  try {
    // ✍️ Prisma: Usa create para inserir um novo registro
    const novoColaborador = await prisma.colaboradores.create({
      data: {
        cpf: cpfLimpo,
        nome_colaborador,
        cargo,
        email,
        data_admissao: data_admissao ? new Date(data_admissao) : undefined,
        status,
        foto,
      }
    });

    res.status(201).json(novoColaborador);
  } catch (error) {
    // 🛑 Tratamento de Erro de Chave Única do Prisma
    if (error.code === 'P2002') { 
      return res.status(409).json({ error: 'Este CPF já está cadastrado (Violação de Chave Única).' });
    }
    console.error('Erro ao cadastrar colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// Rota de Atividades
 // GET /atividades - Lista todas as atividades

  app.get('/atividades', async (req, res) => {
  try {
    const todasAtividades = await prisma.atividades.findMany({
      // Opcional: ordenar por atividade_id para garantir a ordem
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
      where: { atividade_id: atividadeId }
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
  // Nota: 'status' foi REMOVIDO da desestruturação, pois será forçado como 'true'
  const { nome_atividade, descr_atividade, data_prevista_inicio, data_prevista_fim, projeto_id} = req.body;
  
  if (!projeto_id) {
    return res.status(400).json({ error: 'O ID do projeto é obrigatório para vincular a atividade.' });
  }
  
  try {
    // 1. CONVERSÃO DO PROJETO_ID PARA INTEIRO (Já corrigido)
   const projetoIdNumerico = Number(projeto_id); 
    if (isNaN(projetoIdNumerico) || !Number.isInteger(projetoIdNumerico)) {
      return res.status(400).json({ error: 'O ID do projeto deve ser um número inteiro válido.' });
    }

    // 2. CONVERSÃO DAS DATAS PARA OBJETO Date (Já corrigido)
    const dataInicio = new Date(data_prevista_inicio + 'T00:00:00Z');
    const dataFim = (data_prevista_fim && data_prevista_fim !== "") ? new Date(data_prevista_fim + 'T00:00:00Z') : null; 
    const statusBoolean = true;
    
    
    // ✍️ Criação da Atividade no Prisma
    const novaAtividade = await prisma.atividades.create({
      data: {
        nome_atividade,
        descr_atividade,
        data_prevista_inicio: dataInicio, 
        data_prevista_fim: dataFim,
        status: statusBoolean, // ✅ Agora envia o valor booleano esperado pelo Postgres
        projeto_id: projetoIdNumerico, // Usa o ID numérico convertido
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
        projeto_id 
    } = req.body;

    try {
        const atividadeIdNumerico = parseInt(atividade_id, 10);
        if (isNaN(atividadeIdNumerico)) {
            return res.status(400).json({ error: "ID da atividade inválido." });
        }

        // Conversão dos dados de entrada
        const dataInicio = data_prevista_inicio 
            ? new Date(data_prevista_inicio + 'T00:00:00Z') 
            : null;
        const dataFim = data_prevista_fim 
            ? new Date(data_prevista_fim + 'T00:00:00Z') 
            : null;

        const projetoIdNumerico = projeto_id ? parseInt(projeto_id, 10) : null;
        if (projeto_id && isNaN(projetoIdNumerico)) {
             return res.status(400).json({ error: "ID do projeto deve ser um número válido." });
        }
        const statusBooleano = typeof status === 'string' 
            ? status.toLowerCase() === 'true' 
            : Boolean(status);


        const atividadeAtualizada = await prisma.atividades.update({
            where: {
                atividade_id: atividadeIdNumerico,
            },
            data: {
                nome_atividade: nome_atividade,
                descr_atividade: descr_atividade,
                data_prevista_inicio: dataInicio,
                data_prevista_fim: dataFim,
                status: statusBooleano, // Deve ser um enum string ('a_fazer', 'em_andamento', 'concluido')
                projeto_id: projetoIdNumerico, 
            },
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
// Inicialização do Servidor
// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});