# Céu de Lembranças

Um mapa mental no céu: você solta **balões de lembrança** no espaço e arrasta cada um para onde fizer sentido. Não é uma lista — é um lugar para lembrar que aquelas coisas existem.

Tipos padrão: Faculdade, A fazeres, Pendências e Pessoal. Você cria os seus.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:4317](http://localhost:4317).

## Como usar

- **Nova lembrança** na barra, ou clique num vazio do céu, para soltar um balão.
- **Arraste** os balões com o mouse ou o dedo. A posição é salva no servidor.
- **Clique** num balão para editar título, notas, tipo ou apagar.
- Filtre pelos **tipos** na barra. Os outros balões ficam mais suaves.
- Em **Tipos**, crie, pinte, renomeie ou apague categorias.

## Persistência

Não há login. Existe um único céu compartilhado, gravado em `data/memories.json` pela API Node (`/api/state`, `/api/memories`, `/api/categories`).

## Stack

Next.js (App Router), TypeScript, Tailwind, shadcn/ui e Framer Motion.
