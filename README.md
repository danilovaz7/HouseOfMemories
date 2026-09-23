# House of Memories

Um mapa mental no céu: você solta **balões de lembrança** no espaço e arrasta cada um para onde fizer sentido. Não é uma lista — é um lugar para lembrar que aquelas coisas existem.

Tipos padrão: Faculdade, A fazeres, Pendências e Pessoal. Você cria os seus.

## Como rodar

```bash
npm install
npm run dev
```

Abra [http://localhost:4317](http://localhost:4317).

## Como usar

- Cada **tipo** aparece como um **balão central** no céu; as **tarefas** são nuvens menores ligadas a ele por linhas (estilo brainstorm).
- **Clique** no balão do tipo para criar uma nuvem ligada a ele, ou use **Nova lembrança** na barra.
- **Arraste** o balão do tipo para mover o ramo inteiro; arraste uma nuvem só para reposicionar aquela tarefa.
- **Clique** numa nuvem para editar título, notas, tipo ou apagar.
- Filtre pelos **tipos** na barra. Os outros ramos ficam mais suaves.
- Em **Tipos**, crie, pinte, renomeie ou apague categorias.

## Persistência

Não há login. Existe um único céu compartilhado, gravado em `data/memories.json` pela API Node (`/api/state`, `/api/memories`, `/api/categories`).

## Stack

Next.js (App Router), TypeScript, Tailwind, shadcn/ui e Framer Motion.
