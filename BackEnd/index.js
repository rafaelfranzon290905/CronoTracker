// Importações
const express = require('express');
const cors = require('cors');

require('dotenv').config();
const { PrismaClient } = require('./generated/prisma');

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
      },
      select: {
        colaborador_id: true,
        nome_colaborador: true, // Ajustado para bater com o schema
        cargo: true,
        status: true
      },
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
  // Nota: Os nomes aqui devem ser idênticos aos do req.body (JSON enviado pelo front)
  const { nome_colaborador, cargo, email, data_admissao, status, foto } = req.body;

  // Validação básica
  if (!email || !nome_colaborador || !cargo) {
    return res.status(400).json({ error: 'Nome, Cargo e E-mail são obrigatórios.' });
  }

  try {
    // Prisma: Criação do registro
    const novoColaborador = await prisma.colaboradores.create({
      data: {
        nome_colaborador,
        cargo,
        email, 
        data_admissao: data_admissao ? new Date(data_admissao) : new Date(),
        status: status !== undefined ? status : true, // Se não vier, assume true (conforme default do banco)
        foto: foto ? Buffer.from(foto, 'base64') : null, 
      }
    });

    res.status(201).json(novoColaborador);

  } catch (error) {
    // Tratamento de Erro de Chave Única (Email Duplicado)
    if (error.code === 'P2002')
      return res.status(409).json({ error: 'Este e-mail já está cadastrado para outro colaborador.' });
    }
    
    console.error('Erro ao cadastrar colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
);