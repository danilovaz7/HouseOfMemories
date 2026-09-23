import { promises as fs } from "node:fs"
import path from "node:path"

import { Redis } from "@upstash/redis"

import { ensureCategoryPositions } from "@/lib/layout"
import { storageKeyForSpace } from "@/lib/space"
import type { AppState, Category, Memory } from "@/lib/types"

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "faculdade", name: "Faculdade", color: "#f59e0b", x: 0.26, y: 0.38 },
  { id: "afazeres", name: "A fazeres", color: "#38bdf8", x: 0.52, y: 0.58 },
  { id: "pendencias", name: "Pendências", color: "#fb7185", x: 0.74, y: 0.36 },
  { id: "pessoal", name: "Pessoal", color: "#c084fc", x: 0.48, y: 0.78 },
]

export function createInitialState(): AppState {
  return {
    categories: structuredClone(DEFAULT_CATEGORIES),
    memories: [],
  }
}

const chains = new Map<string, Promise<unknown>>()

function enqueue<T>(spaceId: string, fn: () => Promise<T>): Promise<T> {
  const prev = chains.get(spaceId) ?? Promise.resolve()
  const next = prev.then(fn, fn)
  chains.set(
    spaceId,
    next.then(
      () => undefined,
      () => undefined,
    ),
  )
  return next
}

function isVercelRuntime() {
  return process.env.VERCEL === "1"
}

let redisClient: Redis | null = null

function getRedis(): Redis | null {
  if (redisClient) return redisClient
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redisClient = new Redis({ url, token })
  return redisClient
}

function hasKvStore() {
  return getRedis() !== null
}

function writableFilePath(spaceId: string) {
  if (hasKvStore()) return null
  if (isVercelRuntime()) {
    return path.join("/tmp", `house-of-memories-${spaceId}.json`)
  }
  return path.join(process.cwd(), "data", "spaces", `${spaceId}.json`)
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
  if (!isRecord(value)) return createInitialState()

  const rawCategories = Array.isArray(value.categories)
    ? value.categories.map(readCategory).filter((item): item is Category => item !== null)
    : []
  const memories = Array.isArray(value.memories)
    ? value.memories.filter(isValidMemory)
    : []

  if (rawCategories.length === 0) {
    return createInitialState()
  }

  const categories = ensureCategoryPositions(rawCategories, memories)
  return { categories, memories }
}

async function readFromKv(spaceId: string): Promise<AppState | null> {
  const redis = getRedis()
  if (!redis) return null
  const value = await redis.get<AppState>(storageKeyForSpace(spaceId))
  if (!value) return null
  return normalizeState(value)
}

async function readFromFile(spaceId: string): Promise<AppState | null> {
  const filePath = writableFilePath(spaceId)
  if (!filePath) return null
  try {
    const raw = await fs.readFile(filePath, "utf8")
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
  }
}

async function readFromDisk(spaceId: string): Promise<AppState> {
  const fromKv = await readFromKv(spaceId)
  if (fromKv) return fromKv

  const fromFile = await readFromFile(spaceId)
  if (fromFile) return fromFile

  const initial = createInitialState()
  await writeToDisk(spaceId, initial)
  return initial
}

async function writeToDisk(spaceId: string, state: AppState): Promise<void> {
  const normalized = normalizeState(state)
  const payload = `${JSON.stringify(normalized, null, 2)}\n`

  const redis = getRedis()
  if (redis) {
    await redis.set(storageKeyForSpace(spaceId), normalized)
    return
  }

  const filePath = writableFilePath(spaceId)
  if (!filePath) {
    throw new Error("Nenhum armazenamento gravável configurado.")
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true })

  if (isVercelRuntime()) {
    await fs.writeFile(filePath, payload, "utf8")
    return
  }

  const tmp = `${filePath}.tmp`
  await fs.writeFile(tmp, payload, "utf8")
  await fs.rename(tmp, filePath)
}

export function getState(spaceId: string): Promise<AppState> {
  return enqueue(spaceId, async () => structuredClone(await readFromDisk(spaceId)))
}

export function createSpaceState(spaceId: string): Promise<AppState> {
  return enqueue(spaceId, async () => {
    const existing = (await readFromKv(spaceId)) ?? (await readFromFile(spaceId))
    if (existing) return structuredClone(existing)
    const initial = createInitialState()
    await writeToDisk(spaceId, initial)
    return structuredClone(initial)
  })
}

export function mutateState(
  spaceId: string,
  mutator: (state: AppState) => AppState,
): Promise<AppState> {
  return enqueue(spaceId, async () => {
    const current = await readFromDisk(spaceId)
    const next = normalizeState(mutator(structuredClone(current)))
    await writeToDisk(spaceId, next)
    return structuredClone(next)
  })
}

export function putState(spaceId: string, state: AppState): Promise<AppState> {
  return enqueue(spaceId, async () => {
    const next = normalizeState(state)
    await writeToDisk(spaceId, next)
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
