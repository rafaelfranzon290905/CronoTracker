# CronoTracker
Repositório referente ao projeto CronoTracker da Sinosbyte realizado durante o período de imersão do projeto Residência em TIC 55 da Brisa.

## Tecnologias utilizadas
- **React + Vite**
- **Typescript**
- **TailwindCSS**
- **Shadcn/ui**
- **PostgreSQL**
---

## Pré-requisitos

Para rodar o projeto é preciso instalar:
- Node.js: https://www.nodejs.tech/pt-br/download 
- npm: https://www.npmjs.com/package/download
- Git: https://git-scm.com/downloads 

---

## Como Rodar

1. No visual studio code, abra o terminal git bash:
2. Clone o repositório do github:
```
bash
git clone https://github.com/rafaelfranzon290905/CronoTracker.git 
```

2. Acesse a pasta do projeto:
```
cd Frontend
cd ChronoTracker
cd ChronoTracker
```

3. Instale as dependências do projeto:
```
npm install
```

4. Rode o programa e acesse o link fornecido:
```
npm run dev
```
---
## Arquitetura Shadcn/ui
A arquitetura de user interface que usamos nesse projeto é a Shadcn/ui

### Como instalar (no nosso provavelmente já está instalado) 

```
npx shadcn@latest init
```

### Instalar componentes
Para instalar componentes individuais pesquise na documentação do shadcn o componente que você precise e adicione ele ao projeto assim:
```
npx shadcn@latest add "Nome do componente"
```
Ele vai ser adicionado na pasta "src/components/ui"

### Usar componente
Por fim, você dá import no topo da página com o componente/subcomponentes que você instalou e utiliza como um componente do React.
```
import { Nome do Componente } from "@/components/ui/Nome do Componente"
```
---
## Lucide React
O Lucide React foi a tecnologia escolhida para adicionar os icons do projeto de maneira fácil e customizável, para usá-lo, você procura o icon que você quer no site do Lucide React: https://lucide.dev/icons/ e então você dá import no topo da página e depois utiliza como componente React.

```
import { Nome do Icone } from "lucide-react"
```
