
const { PrismaClient } = require('./generated/prisma')

const prisma = new PrismaClient()

async function getClientes() {
    const MODEL_NAME = 'clientes'
    try {
        const clientes = await prisma.clientes.findMany()
        console.log("Conexão ok!", clientes)
    } catch (error) {
        console.log("Erro")
    } finally {
        await prisma.$disconnect()
    }
}

async function getColaboradores() {
    try {
        const colaboradores = await prisma.colaboradores.findMany({
            take: 3,
        })
        console.log("Conexão ok", colaboradores)
    } catch (error) {
        console.log("Erro")
    } finally {
        await prisma.$disconnect()
    }
}

async function clienteSP() {
    const clientesSP = await prisma.clientes.findMany({
        where: {
            estado: 'SP',
        }
    })
    console.log("Clientes paulistas", clientesSP)
}

getClientes()
getColaboradores()
clienteSP()