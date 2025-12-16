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

// Rotas de Colaboradores

//get para listagem
app.get('/colaboradores', async (req, res) => {
  try {
    const colaboradores = await prisma.colaboradores.findMany({
      orderBy: { colaborador_id: 'asc' }
    });
    
    const colaboradoresFormatados = colaboradores.map(col => ({
        ...col,
        foto: col.foto ? col.foto.toString('base64') : null
    }));

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
// GET /colaboradores/:id - Busca um único colaborador (Para o Modal de Edição)
app.get('/colaboradores/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido.' });
  }

  try {
    const colaborador = await prisma.colaboradores.findUnique({
      where: { colaborador_id: id },
    });

    if (!colaborador) {
      return res.status(404).json({ error: 'Colaborador não encontrado.' });
    }

    res.status(200).json(colaborador);
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});

// PUT /colaboradores/:id - Atualiza colaborador
app.put('/colaboradores/:id', async (req, res) => {
  const id = parseInt(req.params.id);
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

  const { nome_colaborador, cargo, email, status, foto, data_admissao } = req.body;
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
  console.log(`[DELETE] Recebida solicitação para ID: ${req.params.id}`); // Log no terminal do servidor

  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    console.log('[DELETE] Erro: ID inválido (NaN)');
    return res.status(400).json({ error: 'ID inválido fornecido na URL.' });
  }

  try {
    // Tenta deletar
    await prisma.colaboradores.delete({
      where: { colaborador_id: id },
    });

    console.log(`[DELETE] Sucesso ao excluir ID: ${id}`);
    res.status(200).json({ message: 'Colaborador excluído com sucesso.' });

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
// roda o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`👉 Teste em: http://localhost:${PORT}`);
});