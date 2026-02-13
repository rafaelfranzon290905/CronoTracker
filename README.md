# ChronoTracker
Repositório referente ao projeto ChronoTracker desenvolvido em colaboração com a Sinosbyte como parte do programa de imersão do projeto Residência em TIC 55 da Brisa, sob orientação.
O ChronoTracker é uma solução completa de controle de horas, permitindo que colaboradores registrem suas atividades em tempo real enquanto gestores acompanham a produtividade e aprovam lançamentos através de uma interface intuitiva. A aplicação centraliza todas as informações pertinentes para gestão de negócios, contando com registros de clientes, projetos, atividades, colaboradores, usuários e despesas, além disso, é capaz de gerar relatórios .

# Demonstração
O sistema está disponível para visualização através do Vercel, com o banco de dados sendo hospedado no Render: https://crono-tracker-a5hm.vercel.app/

## Tecnologias utilizadas
- Frontend: **React + Vite**
- Linguagem: **Typescript**
- Estilização: **TailwindCSS**
- Componentes de UI: **Shadcn/ui**
- Ícones: **lucide React**
- Banco de dados: **PostgreSQL (Prisma ORM)**
- Backend: **Node.js + Express**
---

## Pré-requisitos e instalação local

Para rodar o projeto é preciso instalar:
- Node.js: https://www.nodejs.tech/pt-br/download 
- npm: https://www.npmjs.com/package/download
- Git: https://git-scm.com/downloads 

---

## Como Rodar

1. No visual studio code, abra o terminal git bash:
2. Clone o repositório do github e acesse a pasta do projeto:

```
bash
git clone https://github.com/rafaelfranzon290905/CronoTracker.git 
cd ChronoTracker
```

2. Configure o Backend (variáveis de ambiente):
```
cd BackEnd
touch .env
```
Dentro do arquivo .env adicione a URL de conexão com o Neon:
```
DATABASE_URL=(Privado por segurança, pedir encaminhamento com membros do projeto)
```

3. Instale as dependências do projeto, faça as migrações do banco e rode o Backend:
```
npm install
npx dotenv -e .env -- npx prisma db pull
npx dotenv -e .env -- npx prisma generate
node index.js
```

4. Configurações do frontend:
Em um novo terminal, acesse a pasta do frontend e configure a URL da API
```
cd FrontEnd
cd ChronoTracker
touch .env
```
Dentro do arquivo .env adicione a URL de conexão com o Render:
```
VITE_API_URL=(Privado por segurança, pedir encaminhamento com membros do projeto)
```
Verifique se o arquivo src/apiConfig.ts aponta para os endereços corretos:
```
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3001';
```
---
5. Instale as dependências e rode o projeto:
```
npm install
npm run dev
```
Acesse o link disponibilizado no terminal e agora você tem acesso ao site.

---


## Estrutura de Pastas 
- /BackEnd: Servidor Express, modelos Prisma e rotas da API.
- /FrontEnd
- - /FrontEnd/ChronoTracker/src/components/ui: Componentes base da interface (shadcn/ui)
- - /FrontEnd/ChronoTracker/src/pages: Telas principais do sistema (Dashboard, Clientes, Projetos, etc)
-- /Frontend/ChronoTracker/src/hooks: Lógicas reutilizáveis e controle de permissões

## Hierarquia de acesso de usuários:
- Colaborador (acesso a todas as páginas de listagens e a página de timeTracking)
- Gerente (Acesso a todas as páginas e opções de adição, exclusão e edição de entradas nas páginas de listagens, visão das horas de toda a equipe no Timesheet e direito a reprovar horas inseridas)

## Contribuintes
- Bianca da Silva Franzon
- Fábio Alves da Silva
- Izabel Santos (Orientadora)
- Letícia Carvalho
- Renata Alvez Pint de Souza
- Rafaela Brietzke de Lima
