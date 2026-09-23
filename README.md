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

Não há login. Existe um único céu compartilhado via API Node (`/api/state`, `/api/memories`, `/api/categories`).

- **Local:** `data/memories.json`
- **Vercel (produção):** conecte um **Redis** (Upstash) no projeto — Storage / Marketplace → Redis. As variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (ou `KV_REST_API_*`) passam a guardar o estado de forma persistente.
- Sem Redis na Vercel, a API usa `/tmp` só para não quebrar, mas os dados **não** ficam confiáveis entre requisições; use Redis em produção.

## Deploy na Vercel

1. Importe o repositório no [Vercel](https://vercel.com).
2. Em **Storage** (ou Marketplace), adicione **Upstash Redis** ao projeto e vincule ao app.
3. Redeploy. Arrastar, criar e apagar lembranças deve responder **200**, não **500**.

## Stack

Next.js (App Router), TypeScript, Tailwind, shadcn/ui e Framer Motion.
