import type { Category, Memory } from "@/lib/types"

export { hashSeed } from "@/lib/layout-seed"
import { hashSeed } from "@/lib/layout-seed"

const DEFAULT_HUBS: Record<string, { x: number; y: number }> = {
  faculdade: { x: 0.26, y: 0.38 },
  afazeres: { x: 0.52, y: 0.58 },
  pendencias: { x: 0.74, y: 0.36 },
  pessoal: { x: 0.48, y: 0.78 },
}

export function defaultHubForCategory(category: Pick<Category, "id">, index: number) {
  if (DEFAULT_HUBS[category.id]) return DEFAULT_HUBS[category.id]
  const angle = (index / 6) * Math.PI * 2 - Math.PI / 2
  const radius = 0.22 + (index % 3) * 0.06
  return {
    x: 0.5 + Math.cos(angle) * radius,
    y: 0.48 + Math.sin(angle) * radius * 0.85,
  }
}

export function hubFromMemories(memories: Memory[]) {
  if (memories.length === 0) return null
  const sum = memories.reduce(
    (acc, memory) => ({ x: acc.x + memory.x, y: acc.y + memory.y }),
    { x: 0, y: 0 },
  )
  return { x: sum.x / memories.length, y: sum.y / memories.length }
}

export function ensureCategoryPositions(
  categories: Category[],
  memories: Memory[],
): Category[] {
  return categories.map((category, index) => {
    if (
      typeof category.x === "number" &&
      typeof category.y === "number" &&
      !Number.isNaN(category.x) &&
      !Number.isNaN(category.y)
    ) {
      return category
    }
    const cluster = memories.filter((memory) => memory.categoryId === category.id)
    const fromMemories = hubFromMemories(cluster)
    const fallback = fromMemories ?? defaultHubForCategory(category, index)
    return { ...category, x: fallback.x, y: fallback.y }
  })
}

export function findFreePosition(
  occupied: { x: number; y: number }[],
): { x: number; y: number } {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const x = 0.18 + Math.random() * 0.64
    const y = 0.22 + Math.random() * 0.5
    const crowded = occupied.some(
      (point) => Math.hypot(point.x - x, point.y - y) < 0.14,
    )
    if (!crowded) return { x, y }
  }
  return { x: 0.5, y: 0.42 }
}

export function findMemoryPositionNearCategory(
  category: Category,
  memories: Memory[],
  occupied: { x: number; y: number }[] = [],
  compact = false,
) {
  const seed = hashSeed(category.id)
  const cluster = memories.filter((memory) => memory.categoryId === category.id)
  const baseAngle = (seed % 12) * (Math.PI / 6)
  for (let ring = 0; ring < 4; ring += 1) {
    const radius =
      (compact ? 0.07 : 0.1) + ring * (compact ? 0.05 : 0.07) + cluster.length * 0.012
    for (let step = 0; step < 8; step += 1) {
      const angle = baseAngle + step * (Math.PI / 4)
      const x = category.x + Math.cos(angle) * radius
      const y = category.y + Math.sin(angle) * radius
      if (x < 0.08 || x > 0.92 || y < 0.12 || y > 0.88) continue
      const crowded = [...occupied, ...memories].some(
        (point) => Math.hypot(point.x - x, point.y - y) < 0.11,
      )
      if (!crowded) return { x, y }
    }
  }
  return findFreePosition([...occupied, ...memories, category])
}

export function findFreeCategoryHub(
  categories: Category[],
  memories: Memory[],
) {
  const occupied = [
    ...categories.map((category) => ({ x: category.x, y: category.y })),
    ...memories.map((memory) => ({ x: memory.x, y: memory.y })),
  ]
  return findFreePosition(occupied)
}

export function clampRelative(x: number, y: number, compact = false) {
  if (compact) {
    return {
      x: Math.min(0.9, Math.max(0.1, x)),
      y: Math.min(0.66, Math.max(0.12, y)),
    }
  }
  return {
    x: Math.min(0.92, Math.max(0.08, x)),
    y: Math.min(0.86, Math.max(0.14, y)),
  }
}
