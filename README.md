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

## Privacidade (sem login)

Cada pessoa tem um **céu privado** identificado por um link secreto (`/?s=<uuid>`). Quem não tem esse link não consegue ler nem alterar suas lembranças — trate o link como uma senha.

- Na primeira visita: **Criar meu céu privado** ou colar um link que você já salvou.
- No app: **Copiar link** na barra para usar no celular ou em outro computador.
- Não há conta nem senha separada: quem descobrir o link tem acesso. Não compartilhe publicamente.

## Persistência

API Node (`/api/spaces`, `/api/state`, `/api/memories`, `/api/categories`). Cada céu é salvo separadamente pela chave do espaço.

- **Local:** `data/spaces/<uuid>.json`
- **Vercel (produção):** conecte um **Redis** (Upstash) no projeto — Storage / Marketplace → Redis. As variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (ou `KV_REST_API_*`) guardam cada espaço com chave própria.
- Sem Redis na Vercel, a API usa `/tmp` só para não quebrar, mas os dados **não** ficam confiáveis entre requisições; use Redis em produção.

## Deploy na Vercel

1. Importe o repositório no [Vercel](https://vercel.com).
2. Em **Storage** (ou Marketplace), adicione **Upstash Redis** ao projeto e vincule ao app.
3. Redeploy. Arrastar, criar e apagar lembranças deve responder **200**, não **500**.

## Stack

Next.js (App Router), TypeScript, Tailwind, shadcn/ui e Framer Motion.
