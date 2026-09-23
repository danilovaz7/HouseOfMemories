import { promises as fs } from "node:fs"
import path from "node:path"

import { ensureCategoryPositions } from "@/lib/layout"
import type { AppState, Category, Memory } from "@/lib/types"

const DATA_PATH = path.join(process.cwd(), "data", "memories.json")

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "faculdade", name: "Faculdade", color: "#f59e0b", x: 0.26, y: 0.38 },
  { id: "afazeres", name: "A fazeres", color: "#38bdf8", x: 0.52, y: 0.58 },
  { id: "pendencias", name: "Pendências", color: "#fb7185", x: 0.74, y: 0.36 },
  { id: "pessoal", name: "Pessoal", color: "#c084fc", x: 0.48, y: 0.78 },
]

const DEFAULT_STATE: AppState = {
  categories: DEFAULT_CATEGORIES,
  memories: [
    {
      id: "seed-calculo",
      title: "Entregar o trabalho de cálculo",
      notes: "Lista 4, até sexta. Revisar os exercícios de integrais.",
      categoryId: "faculdade",
      x: 0.16,
      y: 0.3,
      createdAt: "2026-09-10T12:00:00.000Z",
      updatedAt: "2026-09-10T12:00:00.000Z",
    },
    {
      id: "seed-dentista",
      title: "Ligar para o dentista",
      notes: "Remarcar a limpeza que ficou pendente no mês passado.",
      categoryId: "pendencias",
      x: 0.84,
      y: 0.28,
      createdAt: "2026-09-11T12:00:00.000Z",
      updatedAt: "2026-09-11T12:00:00.000Z",
    },
    {
      id: "seed-cafe",
      title: "Comprar café e leite",
      notes: "Acabou o café do filtro. Pegar o leite integral também.",
      categoryId: "afazeres",
      x: 0.42,
      y: 0.48,
      createdAt: "2026-09-12T12:00:00.000Z",
      updatedAt: "2026-09-12T12:00:00.000Z",
    },
    {
      id: "seed-aniversario",
      title: "Aniversário da Maria no sábado",
      notes: "Presente ainda em aberto. Ela mencionou aquele livro.",
      categoryId: "pessoal",
      x: 0.58,
      y: 0.7,
      createdAt: "2026-09-13T12:00:00.000Z",
      updatedAt: "2026-09-13T12:00:00.000Z",
    },
  ],
}

let chain: Promise<unknown> = Promise.resolve()

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = chain.then(fn, fn)
  chain = next.then(
    () => undefined,
    () => undefined,
  )
  return next
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readCategory(value: unknown): Category | null {
  if (!isRecord(value)) return null
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.color !== "string"
  ) {
    return null
  }
  const x = typeof value.x === "number" ? value.x : Number.NaN
  const y = typeof value.y === "number" ? value.y : Number.NaN
  return {
    id: value.id,
    name: value.name,
    color: value.color,
    x,
    y,
  }
}

function isValidMemory(value: unknown): value is Memory {
  if (!isRecord(value)) return false
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.categoryId === "string" &&
    typeof value.x === "number" &&
    typeof value.y === "number" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.notes === undefined || typeof value.notes === "string")
  )
}

function normalizeState(value: unknown): AppState {
  if (!isRecord(value)) return structuredClone(DEFAULT_STATE)

  const rawCategories = Array.isArray(value.categories)
    ? value.categories.map(readCategory).filter((item): item is Category => item !== null)
    : []
  const memories = Array.isArray(value.memories)
    ? value.memories.filter(isValidMemory)
    : []

  if (rawCategories.length === 0) {
    return structuredClone(DEFAULT_STATE)
  }

  const categories = ensureCategoryPositions(rawCategories, memories)
  return { categories, memories }
}

async function readFromDisk(): Promise<AppState> {
  try {
    const raw = await fs.readFile(DATA_PATH, "utf8")
    const state = normalizeState(JSON.parse(raw))
    return state
  } catch {
    const initial = structuredClone(DEFAULT_STATE)
    await writeToDisk(initial)
    return initial
  }
}

async function writeToDisk(state: AppState): Promise<void> {
  const normalized = normalizeState(state)
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true })
  const tmp = `${DATA_PATH}.tmp`
  await fs.writeFile(tmp, `${JSON.stringify(normalized, null, 2)}\n`, "utf8")
  await fs.rename(tmp, DATA_PATH)
}

export function getState(): Promise<AppState> {
  return enqueue(async () => structuredClone(await readFromDisk()))
}

export function mutateState(
  mutator: (state: AppState) => AppState,
): Promise<AppState> {
  return enqueue(async () => {
    const current = await readFromDisk()
    const next = normalizeState(mutator(structuredClone(current)))
    await writeToDisk(next)
    return structuredClone(next)
  })
}

export function putState(state: AppState): Promise<AppState> {
  return enqueue(async () => {
    const next = normalizeState(state)
    await writeToDisk(next)
    return structuredClone(next)
  })
}

export function moveCategoryCluster(
  state: AppState,
  categoryId: string,
  x: number,
  y: number,
): AppState {
  const category = state.categories.find((item) => item.id === categoryId)
  if (!category) return state
  const dx = x - category.x
  const dy = y - category.y
  if (Math.hypot(dx, dy) < 0.0001) return state
  category.x = x
  category.y = y
  state.memories = state.memories.map((memory) =>
    memory.categoryId === categoryId
      ? {
          ...memory,
          x: Math.min(0.94, Math.max(0.06, memory.x + dx)),
          y: Math.min(0.88, Math.max(0.1, memory.y + dy)),
          updatedAt: new Date().toISOString(),
        }
      : memory,
  )
  return state
}
